/*
  Community voting — what to paint next on stream. Owner-edited, same pattern
  as commission.ts / events.ts: a plain typed array, committed to git, picked
  up by the next deploy. One entry covers one voting session (all its
  questions vote together as a single ballot) and never needs to be removed
  once its window closes — closed entries just become history, browsable via
  the calendar on /community/voting.

  Firestore (see src/lib/firebase.ts, firestore.rules) only stores the vote
  TALLIES, keyed by the `id` below — the poll's shape itself always lives
  here, never in the database.

  resultsMode:
    "live"    — real, aggregated votes from every visitor, updated live.
    "curated" — the publicly displayed tally is a deterministic simulation
                (src/lib/results.ts) that drifts toward `curatedPicks` by
                closesAt, rather than the real backend count. Use this when
                you already know what you're painting but still want to run
                the vote for the crowd. `curatedPicks` and `expectedTurnout`
                only matter when resultsMode is "curated".
*/

export interface Option {
  id: string;
  label: string;
}

export interface Question {
  id: string;
  prompt: string;
  options: Option[];
}

export interface Poll {
  id: string;
  title: string;
  theme: string;
  /** ISO 8601 with explicit UTC offset, e.g. 2026-08-01T18:00:00-04:00 */
  opensAt: string;
  /** ISO 8601 with explicit UTC offset. */
  closesAt: string;
  /** IANA zone for display; defaults to America/New_York. */
  timeZone?: string;
  /** Max ballot submissions one visitor can cast on this poll. */
  votesPerPerson: number;
  questions: Question[];
  /** Gate the whole poll behind NSFW mode (e.g. explicit theme options). */
  nsfw?: boolean;
  resultsMode: "live" | "curated";
  /** questionId -> optionId. Only read when resultsMode is "curated". */
  curatedPicks?: Record<string, string>;
  /** Rough grand-total vote count to converge toward by closesAt. Only read
   *  when resultsMode is "curated"; ignored otherwise. */
  expectedTurnout?: number;
}

/*
  Copy the shape below to add a poll — nothing else needs editing. A poll
  with a past `closesAt` automatically becomes "history"; one whose window
  is currently open automatically becomes "active". At most one poll should
  be open at a time.

  export const POLLS: Poll[] = [
    {
      id: "pokemon-2026-08",
      title: "What should I paint next?",
      theme: "Pokemon",
      opensAt: "2026-08-01T18:00:00-04:00",
      closesAt: "2026-08-01T21:00:00-04:00",
      timeZone: "America/New_York",
      votesPerPerson: 3,
      resultsMode: "live",
      questions: [
        {
          id: "character",
          prompt: "Which character?",
          options: [
            { id: "umbreon", label: "Umbreon" },
            { id: "espeon", label: "Espeon" },
            { id: "sylveon", label: "Sylveon" },
            { id: "zeraora", label: "Zeraora" },
          ],
        },
        {
          id: "action",
          prompt: "Doing what?",
          options: [
            { id: "battling", label: "Battling" },
            { id: "slice-of-life", label: "Slice of life" },
            { id: "horror", label: "Horror" },
          ],
        },
        {
          id: "medium",
          prompt: "In what medium?",
          options: [
            { id: "painting", label: "Painting" },
            { id: "illustration", label: "Illustration" },
            { id: "comic", label: "Comic" },
            { id: "animation", label: "Animation" },
          ],
        },
      ],
    },
  ];
*/

export const POLLS: Poll[] = [];
