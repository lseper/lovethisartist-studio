import { useMemo, useState, type FormEvent, type MouseEvent } from "react";
import { FORM_ENDPOINT, CONTACT_EMAIL } from "@/data/commission";

/*
  The commission request form, shared by the Customs calculator and the YCH
  modal. `item` identifies what is being ordered ("custom" or "ych-<slug>");
  `itemLabel` (when set) renders a read-only "Item" line — used by YCHs, which
  have a fixed price instead of a live calculator estimate. `estimate` is the
  calculator's read-only summary (Customs only).
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

interface Props {
  item: string;
  itemLabel?: string;
  estimate?: string;
}

export default function RequestForm({ item, itemLabel, estimate }: Props) {
  const [fields, setFields] = useState<FormFields>(EMPTY_FIELDS);
  const [submit, setSubmit] = useState<SubmitState>({ kind: "idle" });
  const [invalid, setInvalid] = useState<Set<keyof FormFields>>(new Set());

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
    const subject = `Commission request — ${itemLabel ?? item}`;
    const body = [
      `Item: ${itemLabel ?? item}`,
      `Name: ${fields.name}`,
      `Contact: ${fields.handle}`,
      `Email: ${fields.email}`,
      `Reference links: ${fields.refs}`,
      "",
      "Details:",
      fields.details,
      ...(estimate ? ["", "Your estimate:", estimate] : []),
    ].join("\n");
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }, [fields, estimate, item, itemLabel]);

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
          item,
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

  if (submit.kind === "sent") {
    return (
      <div className="rf-notice go-notice" role="status">
        <p className="mono">Sent — I&apos;ll reach out within 24 hours.</p>
        <style>{formStyles}</style>
      </div>
    );
  }

  return (
    <form className="rf-form" onSubmit={onSubmit} noValidate>
      {itemLabel && (
        <div className="field">
          <span className="field-label caps mono">Item</span>
          <p className="rf-item mono">{itemLabel}</p>
        </div>
      )}

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

      {estimate && (
        <div className="field">
          <span className="field-label caps mono">Your estimate</span>
          <pre className="estimate mono" aria-readonly="true">
            {estimate}
          </pre>
        </div>
      )}

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
        <a className="btn btn-primary" href={mailtoHref} onClick={onMailtoClick}>
          Send request
        </a>
      )}

      <style>{formStyles}</style>
    </form>
  );
}

const formStyles = `
  .rf-form { display: flex; flex-direction: column; gap: 1rem; }
  .field { display: flex; flex-direction: column; gap: 0.35rem; }
  .field-label { color: var(--ink-dim); font-size: var(--step--1); }
  .rf-item {
    margin: 0;
    background: var(--surface-2);
    border: 1px solid var(--line);
    color: var(--ink);
    padding: 0.55rem 0.7rem;
    font-size: var(--step-0);
  }
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
  .input:focus { outline: none; border-color: var(--accent); }
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

  .warn-line { color: var(--warn); font-size: var(--step--1); margin: 0; }
  .rf-notice { border: 1px solid var(--line-strong); padding: var(--gutter); }
  .go-notice p { margin: 0; color: var(--go); }
`;
