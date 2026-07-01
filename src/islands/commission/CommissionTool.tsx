import { useMemo, useState } from "react";
import {
  computeQuote,
  quoteToText,
  visibleCategories,
  type CategoryId,
  type Selection,
} from "@/lib/pricing";
import { copyText } from "@/lib/clipboard";
import RequestForm from "@/islands/commission/RequestForm";

/*
  Commission calculator + request form as one island so they share `selection`
  state: the live estimate flows straight into the form's read-only "estimate"
  field. The form itself lives in RequestForm (reused by the YCH modal).

  Follows the segmented-option pattern from ModeControl (unselected =
  transparent + line-strong border + ink-dim; selected = accent fill).
*/

export default function CommissionTool() {
  const [selection, setSelection] = useState<Selection>({});
  const [copied, setCopied] = useState(false);

  const visible = useMemo(() => visibleCategories(selection), [selection]);
  const quote = useMemo(() => computeQuote(selection), [selection]);
  const estimate = useMemo(() => quoteToText(selection), [selection]);

  function selectOption(catId: CategoryId, optionId: string) {
    setSelection((prev) => {
      const next: Selection = { ...prev, [catId]: optionId };
      // Drop selections for any category that is no longer visible, so a
      // hidden category never contributes to the quote. Iterate to a fixed
      // point in case hiding one category cascades to hide another.
      let stable = false;
      while (!stable) {
        stable = true;
        const allowed = new Set(visibleCategories(next).map((c) => c.id));
        for (const key of Object.keys(next) as CategoryId[]) {
          if (!allowed.has(key)) {
            delete next[key];
            stable = false;
          }
        }
      }
      return next;
    });
  }

  async function onCopy() {
    const ok = await copyText(estimate);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="ct">
      {/* -------- Calculator -------- */}
      <section className="ct-calc" aria-label="Price calculator">
        <h2 className="font-display ct-h">Estimate</h2>
        <div className="ct-cats">
          {visible.map((cat) => (
            <fieldset className="cat" key={cat.id}>
              <legend className="cat-label caps mono">{cat.label}</legend>
              <div className="segs" role="group" aria-label={cat.label}>
                {cat.options.map((opt) => {
                  const on = selection[cat.id] === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      className={on ? "seg on" : "seg"}
                      aria-pressed={on}
                      onClick={() => selectOption(cat.id, opt.id)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="quote" aria-live="polite">
          <ul className="lines">
            {quote.lineItems.length === 0 && (
              <li className="line empty mono">
                Select options to build an estimate.
              </li>
            )}
            {quote.lineItems.map((li, i) => (
              <li className="line" key={`${li.category}-${i}`}>
                <span className="line-label">{li.label}</span>
                <span className="line-amt mono">+${li.amount}</span>
              </li>
            ))}
          </ul>
          <div className="total mono">
            <span className="caps">Total</span>
            <strong>${quote.total}</strong>
          </div>
          <button type="button" className="btn" onClick={onCopy}>
            {copied ? "Copied!" : "Copy details"}
          </button>
        </div>
      </section>

      {/* -------- Form -------- */}
      <section className="ct-form-wrap" aria-label="Commission request form">
        <h2 className="font-display ct-h">Request</h2>
        <RequestForm item="custom" estimate={estimate} />
      </section>

      <style>{`
        .ct {
          display: grid;
          gap: var(--gutter);
          grid-template-columns: 1fr;
          border: 1px solid var(--line-strong);
        }
        @media (min-width: 900px) {
          .ct { grid-template-columns: 1fr 1fr; gap: 0; }
          .ct-calc { border-right: 1px solid var(--line-strong); }
        }
        .ct-calc, .ct-form-wrap { padding: var(--gutter); }
        .ct-h {
          margin: 0 0 var(--gutter);
          font-size: var(--step-2);
        }

        .ct-cats { display: flex; flex-direction: column; gap: 1rem; }
        .cat { border: 0; margin: 0; padding: 0; min-width: 0; }
        .cat-label {
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

        .quote {
          margin-top: var(--gutter);
          padding-top: var(--gutter);
          border-top: 1px solid var(--line);
        }
        .lines { list-style: none; margin: 0 0 0.75rem; padding: 0; }
        .line {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.25rem 0;
          color: var(--ink-dim);
          font-size: var(--step-0);
        }
        .line-amt { color: var(--ink); }
        .line.empty { color: var(--ink-faint); font-size: var(--step--1); }
        .total {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          padding: 0.6rem 0;
          border-top: 1px solid var(--line-strong);
          color: var(--ink);
          font-size: var(--step-1);
        }
        .total .caps { color: var(--ink-dim); font-size: var(--step--1); }
        .total strong { font-size: var(--step-2); }

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
        .quote .btn { margin-top: 0.25rem; }
      `}</style>
    </div>
  );
}
