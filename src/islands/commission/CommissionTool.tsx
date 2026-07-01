import { useMemo, useState, type FormEvent, type MouseEvent } from "react";
import {
  computeQuote,
  quoteToText,
  visibleCategories,
  type CategoryId,
  type Selection,
} from "@/lib/pricing";
import { FORM_ENDPOINT, CONTACT_EMAIL } from "@/data/commission";
import { copyText } from "@/lib/clipboard";

/*
  Commission calculator + form as one island so they share `selection` state:
  the live estimate flows straight into the form's read-only "estimate" field.

  Follows the segmented-option pattern from ModeControl (unselected =
  transparent + line-strong border + ink-dim; selected = accent fill).
*/

type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error" };

interface FormFields {
  name: string;
  handle: string;
  email: string;
  refs: string;
  details: string;
}

const EMPTY_FIELDS: FormFields = {
  name: "",
  handle: "",
  email: "",
  refs: "",
  details: "",
};

export default function CommissionTool() {
  const [selection, setSelection] = useState<Selection>({});
  const [fields, setFields] = useState<FormFields>(EMPTY_FIELDS);
  const [copied, setCopied] = useState(false);
  const [submit, setSubmit] = useState<SubmitState>({ kind: "idle" });
  const [invalid, setInvalid] = useState<Set<keyof FormFields>>(new Set());

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

  function setField(key: keyof FormFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (invalid.has(key)) {
      setInvalid((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  function validate(): boolean {
    const missing = new Set<keyof FormFields>();
    if (!fields.name.trim()) missing.add("name");
    if (!fields.handle.trim()) missing.add("handle");
    if (!fields.email.trim()) missing.add("email");
    if (!fields.details.trim()) missing.add("details");
    setInvalid(missing);
    return missing.size === 0;
  }

  const mailtoHref = useMemo(() => {
    const subject = "Commission request";
    const body = [
      `Name: ${fields.name}`,
      `Contact: ${fields.handle}`,
      `Email: ${fields.email}`,
      `Reference links: ${fields.refs}`,
      "",
      "Details:",
      fields.details,
      "",
      "Your estimate:",
      estimate,
    ].join("\n");
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }, [fields, estimate]);

  const usesEndpoint = FORM_ENDPOINT !== "";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setSubmit({ kind: "sending" });
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: fields.name,
          handle: fields.handle,
          email: fields.email,
          refs: fields.refs,
          details: fields.details,
          estimate,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSubmit({ kind: "sent" });
    } catch {
      setSubmit({ kind: "error" });
    }
  }

  // When using a mailto fallback, still enforce required fields before the
  // browser follows the link.
  function onMailtoClick(e: MouseEvent<HTMLAnchorElement>) {
    if (!validate()) e.preventDefault();
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
              <div
                className="segs"
                role="group"
                aria-label={cat.label}
              >
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

        {submit.kind === "sent" ? (
          <div className="notice go-notice" role="status">
            <p className="mono">Sent — I&apos;ll reach out within 24 hours.</p>
          </div>
        ) : (
          <form className="ct-form" onSubmit={onSubmit} noValidate>
            <label className="field">
              <span className="field-label caps mono">Name</span>
              <input
                type="text"
                className="input"
                value={fields.name}
                onChange={(e) => setField("name", e.target.value)}
                aria-invalid={invalid.has("name")}
                required
              />
            </label>

            <label className="field">
              <span className="field-label caps mono">
                Contact handle (Telegram / Discord)
              </span>
              <input
                type="text"
                className="input"
                value={fields.handle}
                onChange={(e) => setField("handle", e.target.value)}
                aria-invalid={invalid.has("handle")}
                required
              />
            </label>

            <label className="field">
              <span className="field-label caps mono">Email</span>
              <input
                type="email"
                className="input"
                value={fields.email}
                onChange={(e) => setField("email", e.target.value)}
                aria-invalid={invalid.has("email")}
                required
              />
            </label>

            <label className="field">
              <span className="field-label caps mono">Reference links</span>
              <textarea
                className="input textarea"
                rows={2}
                value={fields.refs}
                onChange={(e) => setField("refs", e.target.value)}
                placeholder="One URL per line"
              />
            </label>

            <label className="field">
              <span className="field-label caps mono">Commission details</span>
              <textarea
                className="input textarea"
                rows={5}
                value={fields.details}
                onChange={(e) => setField("details", e.target.value)}
                aria-invalid={invalid.has("details")}
                required
              />
            </label>

            <div className="field">
              <span className="field-label caps mono">Your estimate</span>
              <pre className="estimate mono" aria-readonly="true">
                {estimate}
              </pre>
            </div>

            {invalid.size > 0 && (
              <p className="warn-line mono" role="alert">
                Please fill in the required fields.
              </p>
            )}

            {submit.kind === "error" && (
              <p className="warn-line mono" role="alert">
                Something went wrong.{" "}
                <a className="link-line" href={mailtoHref}>
                  Email me instead
                </a>
                .
              </p>
            )}

            {usesEndpoint ? (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submit.kind === "sending"}
              >
                {submit.kind === "sending" ? "Sending…" : "Send request"}
              </button>
            ) : (
              <a
                className="btn btn-primary"
                href={mailtoHref}
                onClick={onMailtoClick}
              >
                Send request
              </a>
            )}
          </form>
        )}
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
        .btn-primary {
          background: var(--accent);
          color: var(--accent-ink);
          border-color: var(--accent);
          width: 100%;
        }
        .btn-primary:hover { background: var(--accent); filter: brightness(1.1); }
        .btn-primary:disabled { opacity: 0.6; cursor: default; }
        .quote .btn { margin-top: 0.25rem; }

        .ct-form { display: flex; flex-direction: column; gap: 1rem; }
        .field { display: flex; flex-direction: column; gap: 0.35rem; }
        .field-label { color: var(--ink-dim); font-size: var(--step--1); }
        .input {
          background: var(--surface);
          color: var(--ink);
          border: 1px solid var(--line-strong);
          padding: 0.55rem 0.7rem;
          font: inherit;
          font-size: var(--step-0);
          width: 100%;
        }
        .input::placeholder { color: var(--ink-faint); }
        .input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .input[aria-invalid="true"] { border-color: var(--warn); }
        .textarea { resize: vertical; font-family: inherit; }

        .estimate {
          margin: 0;
          background: var(--surface-2);
          border: 1px solid var(--line);
          color: var(--ink-dim);
          padding: 0.7rem;
          font-size: var(--step--1);
          white-space: pre-wrap;
          word-break: break-word;
        }

        .warn-line { color: var(--warn); font-size: var(--step--1); margin: 0; }
        .notice { border: 1px solid var(--line-strong); padding: var(--gutter); }
        .go-notice p { margin: 0; color: var(--go); }
      `}</style>
    </div>
  );
}
