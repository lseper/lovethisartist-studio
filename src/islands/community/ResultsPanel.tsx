import { useEffect, useState } from "react";
import type { Poll } from "@/data/voting";
import { subscribeResults, tallyKey, type TallyMap } from "@/lib/results";

/*
  Renders live-updating bars per question. Doesn't know or care whether
  `poll.resultsMode` is "live" (real Firestore listener) or "curated" (local
  simulation) — subscribeResults() hides that entirely.
*/

interface Props {
  poll: Poll;
  /** Skip the live subscription and render a fixed tally instead — used by
   *  PollCalendar for closed polls, where results are frozen. */
  frozenTallies?: TallyMap;
}

export default function ResultsPanel({ poll, frozenTallies }: Props) {
  const [tallies, setTallies] = useState<TallyMap>(frozenTallies ?? {});

  useEffect(() => {
    if (frozenTallies) return;
    return subscribeResults(poll, setTallies);
  }, [poll, frozenTallies]);

  return (
    <div className="rp">
      {poll.questions.map((q) => {
        const counts = q.options.map((opt) => ({
          opt,
          count: tallies[tallyKey(q.id, opt.id)] ?? 0,
        }));
        const total = counts.reduce((sum, c) => sum + c.count, 0);
        const max = Math.max(1, ...counts.map((c) => c.count));

        return (
          <div className="q" key={q.id}>
            <p className="q-label caps mono">{q.prompt}</p>
            <ul className="bars">
              {counts.map(({ opt, count }) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <li className="bar-row" key={opt.id}>
                    <span className="bar-label">{opt.label}</span>
                    <div className="bar-track" aria-hidden="true">
                      <div
                        className="bar-fill"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="bar-count mono">
                      {count} · {pct}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <style>{`
        .rp { display: flex; flex-direction: column; gap: 1.25rem; }
        .q-label {
          margin: 0 0 0.5rem;
          color: var(--ink-dim);
          font-size: var(--step--1);
        }
        .bars { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .bar-row {
          display: grid;
          grid-template-columns: 8rem 1fr 5rem;
          align-items: center;
          gap: 0.6rem;
        }
        .bar-label {
          font-size: var(--step--1);
          color: var(--ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .bar-track {
          height: 0.6rem;
          background: var(--surface-2);
          border: 1px solid var(--line);
        }
        .bar-fill {
          height: 100%;
          background: var(--accent);
          transition: width var(--dur-slow) var(--ease);
        }
        .bar-count {
          color: var(--ink-dim);
          font-size: var(--step--1);
          text-align: right;
        }
        @media (prefers-reduced-motion: reduce) {
          .bar-fill { transition: none; }
        }
        @media (max-width: 560px) {
          .bar-row { grid-template-columns: 5rem 1fr 4.5rem; }
        }
      `}</style>
    </div>
  );
}
