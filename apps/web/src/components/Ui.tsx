import type { FormEventHandler, ReactNode } from "react";
import { Link } from "react-router-dom";

export function Card(props: { title?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="card">
      {(props.title || props.actions) && (
        <div className="cardHeader">
          <h2 className="cardTitle">{props.title}</h2>
          <div className="cardActions">{props.actions}</div>
        </div>
      )}
      <div className="cardBody">{props.children}</div>
    </section>
  );
}

export function Field(props: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label className="field">
      <div className="fieldLabel">{props.label}</div>
      <div className="fieldControl">{props.children}</div>
      {props.hint ? <div className="fieldHint">{props.hint}</div> : null}
    </label>
  );
}

export function Button(props: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; primary?: boolean }) {
  return (
    <button
      className={`button ${props.primary ? "primary" : ""}`}
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}

export function DangerButton(props: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button className="button danger" type={props.type ?? "button"} onClick={props.onClick} disabled={props.disabled}>
      {props.children}
    </button>
  );
}

export function TextInput(props: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "password";
}) {
  return (
    <input
      className="input"
      value={props.value}
      type={props.type ?? "text"}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}

export function TextArea(props: { value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      className="textarea"
      value={props.value}
      placeholder={props.placeholder}
      rows={props.rows ?? 6}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}

export function Select(props: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select className="select" value={props.value} onChange={(e) => props.onChange(e.target.value)}>
      {props.options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function InlineCode(props: { children: ReactNode }) {
  return <code className="code">{props.children}</code>;
}

export function KvTable(props: { rows: Array<{ k: ReactNode; v: ReactNode }> }) {
  return (
    <table className="kvTable">
      <tbody>
        {props.rows.map((r, idx) => (
          <tr key={idx}>
            <th>{r.k}</th>
            <td>{r.v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function EmptyState(props: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="emptyTitle">{props.title}</div>
      {props.description ? <div className="emptyDesc">{props.description}</div> : null}
      {props.action ? <div className="emptyAction">{props.action}</div> : null}
    </div>
  );
}

export function PageHeader(props: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="pageHeader">
      <div className="pageHeaderText">
        <h1 className="pageTitle">{props.title}</h1>
        {props.subtitle ? <div className="pageSubtitle">{props.subtitle}</div> : null}
      </div>
      <div className="pageHeaderActions">{props.actions}</div>
    </div>
  );
}

export function LinkButton(props: { to: string; children: ReactNode }) {
  return (
    <Link className="button" to={props.to}>
      {props.children}
    </Link>
  );
}

export function Form(props: { onSubmit: FormEventHandler; children: ReactNode }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit(e);
      }}
    >
      {props.children}
    </form>
  );
}

export function ErrorBox(props: { title?: string; error: unknown }) {
  const message = props.error instanceof Error ? props.error.message : String(props.error);
  return (
    <div className="errorBox">
      <div className="errorTitle">{props.title ?? "错误"}</div>
      <pre className="pre">{message}</pre>
    </div>
  );
}

export function Badge(props: { status: string }) {
  const s = props.status.toUpperCase();
  let colorClass = "default";
  if (s === "SUCCEEDED" || s === "SUCCESS") colorClass = "succeeded";
  else if (s === "FAILED" || s === "ERROR" || s === "TIMEOUT" || s === "MODEL_ERROR" || s === "PARSER_ERROR" || s === "RATE_LIMIT") colorClass = "failed";
  else if (s === "RUNNING" || s === "ACTIVE") colorClass = "running";
  
  return <span className={`badge ${colorClass}`}>{props.status}</span>;
}
