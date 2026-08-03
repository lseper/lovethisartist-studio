import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Poll } from "@/data/voting";

/** `${questionId}__${optionId}` -> vote count. */
export type TallyMap = Record<string, number>;

export function tallyKey(questionId: string, optionId: string): string {
  return `${questionId}__${optionId}`;
}

/*
  Deterministic seeded PRNG (mulberry32) — never Math.random(). The seed is
  derived from the poll + question id, so every visitor's browser derives
  the exact same numbers independently, with no network round-trip. Only
  used to shape a "curated" poll's *static* parameters (which option wins,
  by how much, how the others trail) once; the live tick-to-tick movement
  below is a pure function of wall-clock time, not further randomness, so
  concurrent viewers stay in lockstep.
*/
function mulberry32(seed: number): () => number {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** One question's precomputed curated shape: an even split at t=0 that
 *  blends toward `finalShares` (winner ahead of the runner-up by 10-25%,
 *  seeded) as t -> 1. */
interface CuratedShape {
  optionIds: string[];
  evenShare: number;
  finalShares: Record<string, number>;
}

function curatedShape(
  pollId: string,
  questionId: string,
  optionIds: string[],
  winnerId: string,
): CuratedShape {
  const rng = mulberry32(hashString(`${pollId}::${questionId}`));
  const evenShare = 1 / optionIds.length;

  const weights: Record<string, number> = {};
  let runnerUp = 0;
  for (const id of optionIds) {
    if (id === winnerId) continue;
    const w = 0.6 + rng() * 0.4; // 0.6-1.0, gives the pack some texture
    weights[id] = w;
    if (w > runnerUp) runnerUp = w;
  }
  const marginOverRunnerUp = 0.1 + rng() * 0.15; // reasonable win, not a blowout
  weights[winnerId] = Math.max(runnerUp, 0.6) * (1 + marginOverRunnerUp);

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const finalShares: Record<string, number> = {};
  for (const id of optionIds) finalShares[id] = weights[id] / total;

  return { optionIds, evenShare, finalShares };
}

function sharesAt(shape: CuratedShape, t: number): Record<string, number> {
  const blend = Math.pow(t, 1.5); // hold suspense — bias shows late, not early
  const raw: Record<string, number> = {};
  let sum = 0;
  for (const id of shape.optionIds) {
    const v = shape.evenShare + (shape.finalShares[id] - shape.evenShare) * blend;
    raw[id] = v;
    sum += v;
  }
  const shares: Record<string, number> = {};
  for (const id of shape.optionIds) shares[id] = raw[id] / sum;
  return shares;
}

function countsAt(shape: CuratedShape, t: number, total: number): Record<string, number> {
  const shares = sharesAt(shape, t);
  const counts: Record<string, number> = {};
  let assigned = 0;
  let leaderId = shape.optionIds[0];
  let leaderShare = -1;
  for (const id of shape.optionIds) {
    const c = Math.floor(shares[id] * total);
    counts[id] = c;
    assigned += c;
    if (shares[id] > leaderShare) {
      leaderShare = shares[id];
      leaderId = id;
    }
  }
  counts[leaderId] += total - assigned; // rounding remainder always lands on the leader
  return counts;
}

/**
 * Subscribes to a poll's live results, regardless of whether they're real or
 * curated — callers never need to know which. "live" polls get a genuine
 * Firestore onSnapshot listener; "curated" polls get a local deterministic
 * simulation (no Firestore reads at all) that drifts from a near-even split
 * toward `poll.curatedPicks` by closesAt. Returns an unsubscribe function.
 */
export function subscribeResults(
  poll: Poll,
  onUpdate: (tallies: TallyMap) => void,
): () => void {
  if (poll.resultsMode === "live") {
    return onSnapshot(
      collection(db, "polls", poll.id, "optionTallies"),
      (snap) => {
        const tallies: TallyMap = {};
        for (const d of snap.docs) tallies[d.id] = (d.data().count as number) ?? 0;
        onUpdate(tallies);
      },
    );
  }

  const opens = new Date(poll.opensAt).getTime();
  const closes = new Date(poll.closesAt).getTime();
  const span = Math.max(1, closes - opens);
  const expectedTurnout = poll.expectedTurnout ?? 60;
  const startTotal = Math.max(4, Math.round(expectedTurnout * 0.08));

  const shapes = poll.questions.map((q) => ({
    question: q,
    shape: curatedShape(
      poll.id,
      q.id,
      q.options.map((o) => o.id),
      poll.curatedPicks?.[q.id] ?? q.options[0]?.id ?? "",
    ),
  }));

  function tick(): number {
    const now = Date.now();
    const t = Math.max(0, Math.min(1, (now - opens) / span));
    const total = Math.round(
      startTotal + (expectedTurnout - startTotal) * easeOutCubic(t),
    );
    const tallies: TallyMap = {};
    for (const { question, shape } of shapes) {
      const counts = countsAt(shape, t, total);
      for (const opt of question.options) {
        tallies[tallyKey(question.id, opt.id)] = counts[opt.id] ?? 0;
      }
    }
    onUpdate(tallies);
    return t;
  }

  if (tick() >= 1) return () => {};

  const interval = window.setInterval(() => {
    if (tick() >= 1) window.clearInterval(interval);
  }, 4000);
  return () => window.clearInterval(interval);
}

/**
 * One-time read of a *closed* poll's final tally, for the history calendar.
 * "live" polls read the real backend total. "curated" polls reproduce the
 * exact frozen state deterministically (t=1 of the same simulation the
 * poll displayed while voting was open) rather than the real Firestore
 * count — ballots cast during a curated poll are still recorded for the
 * owner's own reference, but the public history must keep showing what the
 * public actually saw, not the real numbers, or the bit would be spoiled
 * retroactively.
 */
export async function finalResults(poll: Poll): Promise<TallyMap> {
  if (poll.resultsMode === "live") {
    const snap = await getDocs(collection(db, "polls", poll.id, "optionTallies"));
    const tallies: TallyMap = {};
    for (const d of snap.docs) tallies[d.id] = (d.data().count as number) ?? 0;
    return tallies;
  }

  const expectedTurnout = poll.expectedTurnout ?? 60;
  const tallies: TallyMap = {};
  for (const q of poll.questions) {
    const shape = curatedShape(
      poll.id,
      q.id,
      q.options.map((o) => o.id),
      poll.curatedPicks?.[q.id] ?? q.options[0]?.id ?? "",
    );
    const counts = countsAt(shape, 1, expectedTurnout);
    for (const opt of q.options) tallies[tallyKey(q.id, opt.id)] = counts[opt.id] ?? 0;
  }
  return tallies;
}
