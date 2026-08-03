import { useEffect, useState } from "react";
import type { Poll } from "@/data/voting";
import { activePoll, localVoteState } from "@/lib/voting";
import VoteBallot from "@/islands/community/VoteBallot";
import ResultsPanel from "@/islands/community/ResultsPanel";
import PollCalendar from "@/islands/community/PollCalendar";

/*
  Parent island. Resolves the active poll entirely inside useEffect (never
  in the render body) — this component hydrates via client:load, and Astro
  SSRs islands once at `astro build` time. If "which poll is active" were
  computed from Date.now() during that render pass, whatever was true at
  build time would get baked into the static HTML and stay wrong until the
  next deploy. Following the same pattern as ModeControl: render a neutral
  default first, then correct it client-side once mounted.
*/

function useCountdown(closesAt: string | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!closesAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [closesAt]);

  if (!closesAt) return { label: "", expired: false, urgent: false };
  const remainingMs = new Date(closesAt).getTime() - now;
  const expired = remainingMs <= 0;
  const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const label =
    h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${m}:${String(s).padStart(2, "0")}`;
  return { label, expired, urgent: !expired && totalSec < 60 };
}

export default function VotingBooth() {
  const [checked, setChecked] = useState(false);
  const [poll, setPoll] = useState<Poll | undefined>(undefined);
  const [votesUsed, setVotesUsed] = useState(0);
  const countdown = useCountdown(poll?.closesAt);

  useEffect(() => {
    function refresh() {
      const active = activePoll();
      setPoll(active);
      setVotesUsed(active ? localVoteState(active.id).count : 0);
      setChecked(true);
    }
    refresh();
    // Catches a poll opening or closing while someone leaves the tab open
    // through a stream, without needing a page reload.
    const id = window.setInterval(refresh, 30000);
    return () => window.clearInterval(id);
  }, []);

  function onVoted() {
    if (poll) setVotesUsed(localVoteState(poll.id).count);
  }

  return (
    <div className="vbooth">
      {!checked ? (
        <p className="mono">Loading…</p>
      ) : !poll ? (
        <p className="empty mono">
          No vote is running right now — check back during the next stream.
        </p>
      ) : (
        <section className="active-poll">
          <header className="poll-head">
            <p className="poll-theme caps mono">{poll.theme}</p>
            <h2 className="font-display poll-title">{poll.title}</h2>
            <p className={countdown.urgent ? "poll-timer mono urgent" : "poll-timer mono"}>
              {countdown.expired ? "Voting closed" : `Closes in ${countdown.label}`}
            </p>
          </header>

          <div className="poll-grid">
            <div className="poll-pane">
              <h3 className="pane-h caps mono">Cast your vote</h3>
              <VoteBallot
                poll={poll}
                closed={countdown.expired}
                votesUsed={votesUsed}
                onVoted={onVoted}
              />
            </div>
            <div className="poll-pane">
              <h3 className="pane-h caps mono">Live results</h3>
              <ResultsPanel poll={poll} />
            </div>
          </div>
        </section>
      )}

      <section className="history">
        <h3 className="pane-h caps mono">Past votes</h3>
        <PollCalendar />
      </section>

      <style>{`
        .vbooth { display: flex; flex-direction: column; gap: 2.5rem; }
        .empty { color: var(--ink-dim); font-size: var(--step-0); }

        .poll-head { margin-bottom: var(--gutter); }
        .poll-theme { margin: 0 0 0.25rem; color: var(--accent); font-size: var(--step--1); }
        .poll-title { margin: 0 0 0.5rem; font-size: var(--step-3); }
        .poll-timer { margin: 0; color: var(--ink-dim); font-size: var(--step-0); }
        .poll-timer.urgent { color: var(--warn); }

        .poll-grid {
          display: grid;
          gap: var(--gutter);
          grid-template-columns: 1fr;
          border: 1px solid var(--line-strong);
        }
        @media (min-width: 900px) {
          .poll-grid { grid-template-columns: 1fr 1fr; gap: 0; }
          .poll-pane:first-child { border-right: 1px solid var(--line-strong); }
        }
        .poll-pane { padding: var(--gutter); }
        .pane-h { margin: 0 0 1rem; color: var(--ink-dim); font-size: var(--step--1); }

        .history { padding-top: var(--gutter); border-top: 1px solid var(--line); }
      `}</style>
    </div>
  );
}
