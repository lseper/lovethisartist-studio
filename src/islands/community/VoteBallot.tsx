import { useMemo, useState } from "react";
import type { Poll } from "@/data/voting";
import { localVoteState, submitBallot, type Ballot } from "@/lib/voting";

/*
  Follows the segmented-option pattern from CommissionTool (unselected =
  transparent + line-strong border + ink-dim; selected = accent fill). One
  ballot = one pick per question, submitted together; a person may resubmit
  up to `votesPerPerson` times.
*/

type SubmitState = "idle" | "sending" | "sent" | "capped" | "error";

interface Props {
  poll: Poll;
  closed: boolean;
  votesUsed: number;
  onVoted: () => void;
}

export default function VoteBallot({ poll, closed, votesUsed, onVoted }: Props) {
  const [selections, setSelections] = useState<Ballot>({});
  const [submit, setSubmit] = useState<SubmitState>("idle");

  const remaining = Math.max(0, poll.votesPerPerson - votesUsed);
  const complete = poll.questions.every((q) => selections[q.id]);
  const capped = remaining <= 0;

  const lastBallot = useMemo(() => localVoteState(poll.id).lastBallot, [poll.id]);

  function pick(questionId: string, optionId: string) {
    if (closed || capped) return;
    setSelections((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function onSubmit() {
    if (!complete || closed || capped) return;
    setSubmit("sending");
    const result = await submitBallot(poll.id, selections);
    if (result === "ok") {
      setSubmit("sent");
      onVoted();
      window.setTimeout(() => setSubmit("idle"), 1800);
    } else {
      setSubmit(result);
    }
  }

  return (
    <div className="vb">
      <div className="vb-cap mono caps">
        {capped
          ? "You've used all your votes on this poll"
          : `${remaining} of ${poll.votesPerPerson} votes left`}
      </div>

      <div className="vb-questions">
        {poll.questions.map((q) => (
          <fieldset className="q" key={q.id} disabled={closed || capped}>
            <legend className="q-label caps mono">{q.prompt}</legend>
            <div className="segs" role="group" aria-label={q.prompt}>
              {q.options.map((opt) => {
                const on = selections[q.id] === opt.id;
                const wasLast = lastBallot[q.id] === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    className={on ? "seg on" : "seg"}
                    aria-pressed={on}
                    title={wasLast ? "Your last vote" : undefined}
                    onClick={() => pick(q.id, opt.id)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {submit === "error" && (
        <p className="warn-line mono" role="alert">
          Something went wrong — try again.
        </p>
      )}

      <button
        type="button"
        className="btn btn-primary"
        disabled={!complete || closed || capped || submit === "sending"}
        onClick={onSubmit}
      >
        {closed
          ? "Voting closed"
          : submit === "sending"
            ? "Casting…"
            : submit === "sent"
              ? "Cast!"
              : "Cast ballot"}
      </button>

      <style>{`
        .vb { display: flex; flex-direction: column; gap: 1rem; }
        .vb-cap { color: var(--ink-dim); font-size: var(--step--1); }
        .vb-questions { display: flex; flex-direction: column; gap: 1rem; }
        .q { border: 0; margin: 0; padding: 0; min-width: 0; }
        .q:disabled { opacity: 0.5; }
        .q-label {
          display: block;
          padding: 0;
          margin: 0 0 0.4rem;
          color: var(--ink-dim);
          font-size: var(--step--1);
        }
        .segs { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .seg {
          background: transparent;
          color: var(--ink-dim);
          border: 1px solid var(--line-strong);
          padding: 0.4rem 0.7rem;
          font: inherit;
          font-size: var(--step--1);
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease),
            color var(--dur-fast) var(--ease),
            border-color var(--dur-fast) var(--ease);
        }
        .seg:not(.on):hover { color: var(--ink); background: var(--surface); }
        .seg.on {
          background: var(--accent);
          color: var(--accent-ink);
          border-color: var(--accent);
        }
        .q:disabled .seg { cursor: default; }

        .warn-line { color: var(--warn); font-size: var(--step--1); margin: 0; }

        .btn {
          display: inline-block;
          background: transparent;
          color: var(--ink);
          border: 1px solid var(--line-strong);
          padding: 0.6rem 1rem;
          font: inherit;
          font-size: var(--step--1);
          letter-spacing: var(--tracking-caps);
          text-transform: uppercase;
          text-decoration: none;
          text-align: center;
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease),
            border-color var(--dur-fast) var(--ease);
        }
        .btn:hover { background: var(--surface); }
        .btn-primary {
          background: var(--accent);
          color: var(--accent-ink);
          border-color: var(--accent);
          width: 100%;
        }
        .btn-primary:hover { filter: brightness(1.1); }
        .btn-primary:disabled { opacity: 0.5; cursor: default; filter: none; }
      `}</style>
    </div>
  );
}
