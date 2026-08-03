import { useMemo, useState } from "react";
import type { Poll } from "@/data/voting";
import { historicalPolls } from "@/lib/voting";
import { finalResults, type TallyMap } from "@/lib/results";
import ResultsPanel from "@/islands/community/ResultsPanel";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function dateKey(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

interface Selected {
  poll: Poll;
  tallies: TallyMap | "loading";
}

export default function PollCalendar() {
  const polls = useMemo(() => historicalPolls(), []);
  const byDate = useMemo(() => {
    const map = new Map<string, Poll>();
    for (const p of polls) map.set(dateKey(p.closesAt, p.timeZone ?? "America/New_York"), p);
    return map;
  }, [polls]);

  const [cursor, setCursor] = useState(() =>
    polls[0] ? new Date(polls[0].closesAt) : new Date(),
  );
  const [selected, setSelected] = useState<Selected | null>(null);

  if (polls.length === 0) {
    return (
      <p className="empty mono">
        No past polls yet — check back after the first stream vote closes.
      </p>
    );
  }

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadDays = firstDay.getDay();

  const cells: Array<{ day: number; key: string; poll?: Poll } | null> = [];
  for (let i = 0; i < leadDays; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, key, poll: byDate.get(key) });
  }

  async function selectPoll(poll: Poll) {
    setSelected({ poll, tallies: "loading" });
    const tallies = await finalResults(poll);
    setSelected({ poll, tallies });
  }

  function changeMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
    setSelected(null);
  }

  return (
    <div className="pc">
      <div className="pc-head">
        <button
          type="button"
          className="pc-nav"
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
        >
          ←
        </button>
        <span className="pc-month caps mono">
          {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
            cursor,
          )}
        </span>
        <button
          type="button"
          className="pc-nav"
          onClick={() => changeMonth(1)}
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="pc-grid pc-weekdays caps mono">
        {WEEKDAYS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="pc-grid">
        {cells.map((cell, i) =>
          cell === null ? (
            <span className="pc-cell blank" key={`blank-${i}`} aria-hidden="true" />
          ) : (
            <button
              type="button"
              key={cell.key}
              className={cell.poll ? "pc-cell has-poll" : "pc-cell"}
              disabled={!cell.poll}
              aria-current={selected?.poll.id === cell.poll?.id ? "date" : undefined}
              onClick={() => cell.poll && selectPoll(cell.poll)}
            >
              {cell.day}
            </button>
          ),
        )}
      </div>

      {selected && (
        <div className="pc-detail">
          <p className="pc-detail-theme caps mono">{selected.poll.theme}</p>
          <p className="pc-detail-title font-display">{selected.poll.title}</p>
          {selected.tallies === "loading" ? (
            <p className="mono">Loading results…</p>
          ) : (
            <ResultsPanel poll={selected.poll} frozenTallies={selected.tallies} />
          )}
        </div>
      )}

      <style>{`
        .pc { display: flex; flex-direction: column; gap: 1rem; }
        .empty { color: var(--ink-dim); font-size: var(--step-0); }
        .pc-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pc-month { color: var(--ink); font-size: var(--step-0); }
        .pc-nav {
          background: transparent;
          color: var(--ink-dim);
          border: 1px solid var(--line-strong);
          padding: 0.3rem 0.7rem;
          font: inherit;
          cursor: pointer;
          transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
        }
        .pc-nav:hover { color: var(--ink); background: var(--surface); }

        .pc-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .pc-weekdays span {
          text-align: center;
          color: var(--ink-faint);
          font-size: var(--step--1);
          padding: 0.25rem 0;
        }
        .pc-cell {
          aspect-ratio: 1;
          display: grid;
          place-items: center;
          background: var(--surface);
          border: 1px solid var(--line);
          color: var(--ink-faint);
          font: inherit;
          font-size: var(--step--1);
          cursor: default;
        }
        .pc-cell.blank { background: transparent; border-color: transparent; }
        .pc-cell.has-poll {
          color: var(--ink);
          border-color: var(--accent);
          cursor: pointer;
        }
        .pc-cell.has-poll:hover { background: var(--surface-2); }
        .pc-cell[aria-current="date"] {
          background: var(--accent);
          color: var(--accent-ink);
        }

        .pc-detail {
          margin-top: 0.5rem;
          padding-top: var(--gutter);
          border-top: 1px solid var(--line);
        }
        .pc-detail-theme { margin: 0 0 0.25rem; color: var(--accent); font-size: var(--step--1); }
        .pc-detail-title { margin: 0 0 1rem; font-size: var(--step-2); }
      `}</style>
    </div>
  );
}
