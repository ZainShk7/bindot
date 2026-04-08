import { useEffect, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";

export function Card({
  title,
  icon: TitleIcon,
  actions,
  children,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 16,
        background: "var(--bg)",
        boxShadow: "var(--shadow)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {TitleIcon ? (
            <span
              style={{
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <TitleIcon size={20} strokeWidth={2} aria-hidden />
            </span>
          ) : null}
          <div style={{ fontWeight: 700, color: "var(--text-h)" }}>{title}</div>
        </div>
        {actions ?? null}
      </div>
      {children}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  icon: TitleIcon,
  wide,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: LucideIcon;
  wide?: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="bindot-modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bindot-modal-title"
    >
      <button
        type="button"
        className="bindot-modal-backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className={
          wide
            ? "bindot-modal-panel bindot-modal-panel-wide"
            : "bindot-modal-panel"
        }
      >
        <header className="bindot-modal-header">
          <div className="bindot-modal-title-row">
            {TitleIcon ? (
              <TitleIcon size={22} strokeWidth={2} aria-hidden />
            ) : null}
            <h2 className="bindot-modal-title" id="bindot-modal-title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="bindot-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={20} strokeWidth={2} aria-hidden />
          </button>
        </header>
        <div className="bindot-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, opacity: 0.7 }}>{children}</div>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        padding: 10,
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--bg)",
        color: "var(--text-h)",
        ...(props.style || {}),
      }}
    />
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      style={{
        padding: 10,
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--bg)",
        color: "var(--text-h)",
        ...(props.style || {}),
      }}
    />
  );
}

export function Btn({
  children,
  variant = "primary",
  icon: Icon,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  icon?: LucideIcon;
}) {
  const styles =
    variant === "primary"
      ? {
          border: "1px solid var(--text-h)",
          background: "var(--text-h)",
          color: "var(--bg)",
        }
      : variant === "danger"
        ? {
            border: "1px solid #fecaca",
            background: "var(--bg)",
            color: "var(--text-h)",
          }
        : {
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--text-h)",
          };
  return (
    <button
      type="button"
      {...props}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.65 : 1,
        ...(styles as object),
        ...(props.style || {}),
      }}
    >
      {Icon ? <Icon size={16} strokeWidth={2} aria-hidden /> : null}
      {children}
    </button>
  );
}
