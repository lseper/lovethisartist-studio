import {
  collection,
  doc,
  getDocs,
  increment,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { POLLS, type Poll } from "@/data/voting";
import type { Mode } from "@/data/config";

/*
  Everything about a ballot except the live-vs-curated results math, which
  lives in src/lib/results.ts. Voter identity mirrors the cookie pattern in
  lib/mode.ts (setCookie/getCookie duplicated locally rather than shared, to
  keep this feature's footprint self-contained).

  Vote limiting here is best-effort: a person is "whoever holds this
  browser's voter id", enforced by firestore.rules capping that id's ballot
  count. Clearing storage or using a private window resets it. There is no
  login system on this site, so this is the ceiling of what's enforceable
  without one.
*/

const VOTER_ID_KEY = "lta:voter-id";
const VOTER_ID_COOKIE = "lta_voter_id";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Random per-browser identity — localStorage primary, cookie fallback. */
export function getVoterId(): string {
  let id = localStorage.getItem(VOTER_ID_KEY) ?? getCookie(VOTER_ID_COOKIE);
  if (!id) id = crypto.randomUUID();
  localStorage.setItem(VOTER_ID_KEY, id);
  setCookie(VOTER_ID_COOKIE, id, 3650);
  return id;
}

/** questionId -> optionId, one pick per question, for a single ballot. */
export type Ballot = Record<string, string>;

interface LocalVoteState {
  count: number;
  lastBallot: Ballot;
}

function localVoteKey(pollId: string): string {
  return `lta:voted:${pollId}`;
}

export function localVoteState(pollId: string): LocalVoteState {
  try {
    const raw = localStorage.getItem(localVoteKey(pollId));
    if (!raw) return { count: 0, lastBallot: {} };
    return JSON.parse(raw) as LocalVoteState;
  } catch {
    return { count: 0, lastBallot: {} };
  }
}

function recordLocalVote(pollId: string, ballot: Ballot) {
  const prev = localVoteState(pollId);
  localStorage.setItem(
    localVoteKey(pollId),
    JSON.stringify({ count: prev.count + 1, lastBallot: ballot }),
  );
}

export type SubmitResult = "ok" | "capped" | "error";

/**
 * Casts one ballot: a single pick per question, submitted as one atomic
 * batch that increments the voter's own ballot count and every chosen
 * option's tally together. firestore.rules rejects the whole batch (nothing
 * is incremented) if the voter is already at their cap.
 */
export async function submitBallot(
  pollId: string,
  ballot: Ballot,
): Promise<SubmitResult> {
  const voterId = getVoterId();
  const batch = writeBatch(db);

  batch.set(
    doc(db, "polls", pollId, "voters", voterId),
    { count: increment(1), lastVotedAt: serverTimestamp() },
    { merge: true },
  );
  for (const [questionId, optionId] of Object.entries(ballot)) {
    batch.set(
      doc(db, "polls", pollId, "optionTallies", `${questionId}__${optionId}`),
      { count: increment(1) },
      { merge: true },
    );
  }

  try {
    await batch.commit();
    recordLocalVote(pollId, ballot);
    return "ok";
  } catch (err: unknown) {
    const code = (err as { code?: string } | null)?.code;
    return code === "permission-denied" ? "capped" : "error";
  }
}

/** Read-once final tally for a closed poll (calendar/history view). */
export async function finalTallies(
  pollId: string,
): Promise<Record<string, number>> {
  const snap = await getDocs(collection(db, "polls", pollId, "optionTallies"));
  const tallies: Record<string, number> = {};
  for (const d of snap.docs) tallies[d.id] = (d.data().count as number) ?? 0;
  return tallies;
}

/** The poll currently open for voting, if any. Evaluate against wall-clock
 *  time on the client only — never at build time. */
export function activePoll(now: Date = new Date()): Poll | undefined {
  const open = POLLS.filter(
    (p) => new Date(p.opensAt) <= now && now < new Date(p.closesAt),
  );
  return open.sort(
    (a, b) => new Date(b.opensAt).getTime() - new Date(a.opensAt).getTime(),
  )[0];
}

/** Closed polls, most recently closed first. */
export function historicalPolls(now: Date = new Date()): Poll[] {
  return POLLS.filter((p) => new Date(p.closesAt) <= now).sort(
    (a, b) => new Date(b.closesAt).getTime() - new Date(a.closesAt).getTime(),
  );
}

export function pollVisibleInMode(poll: Poll, mode: Mode): boolean {
  return !poll.nsfw || mode === "nsfw";
}
