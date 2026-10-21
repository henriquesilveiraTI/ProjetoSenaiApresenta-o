import {
  useEffect,
  useId,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import type { RunStatus } from "@error/shared";
import { CloseIcon } from "./icons";

export function Spinner({ label = "Carregando" }: { label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-block size-5 animate-spin rounded-full border-2 border-neon/25 border-t-neon"
    />
  );
}

export function LoadingScreen({ label = "SINCRONIZANDO SISTEMA" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6 text-center">
      <Spinner label={label} />
      <p className="font-display text-xs font-bold tracking-[0.34em] text-neon">
        {label}
        <span className="animate-pulse">...</span>
      </p>
      <p className="max-w-xs text-xs leading-relaxed text-muted">
        Se o sistema demorar, respire. Ele também está te avaliando.
      </p>
    </div>
  );
}

export function ErrorNotice({
  message,
  onRetry,
  retryLabel = "Tentar novamente",
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      role="alert"
      className="hud-panel flex flex-col gap-4 border-alert/40 p-5 text-sm text-alert sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-block size-2 shrink-0 animate-pulse rounded-full bg-alert shadow-[0_0_14px_rgba(255,48,48,0.7)]" />
        <p className="leading-relaxed">{message}</p>
      </div>
      {onRetry ? (
        <button type="button" className="btn-danger shrink-0" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="hud-panel px-6 py-14 text-center">
      <p className="font-display text-xs font-bold tracking-[0.32em] text-neon">
        SEM REGISTROS
      </p>
      <h2 className="mt-4 text-2xl text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>
      {action ? <div className="mt-7 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon,
  accent = "neon",
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  icon?: ReactNode;
  accent?: "neon" | "alert" | "muted";
}) {
  const accentClass =
    accent === "alert"
      ? "text-alert"
      : accent === "muted"
        ? "text-muted"
        : "text-neon";

  return (
    <div className="hud-panel min-h-32 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.66rem] font-bold tracking-[0.24em] text-muted uppercase">
          {label}
        </span>
        <span className={accentClass}>{icon}</span>
      </div>
      <p className={`mt-4 font-display text-3xl font-bold ${accentClass}`}>
        {value}
      </p>
      {detail ? <p className="mt-1 text-xs text-muted">{detail}</p> : null}
    </div>
  );
}

const statusMap: Record<
  RunStatus,
  { label: string; className: string }
> = {
  active: {
    label: "EM ANDAMENTO",
    className: "border-neon/45 bg-neon/10 text-neon",
  },
  completed: {
    label: "CONCLUÍDA",
    className: "border-neon/45 bg-neon/10 text-neon",
  },
  failed: {
    label: "BLOQUEADA",
    className: "border-alert/45 bg-alert/10 text-alert",
  },
  abandoned: {
    label: "ABANDONADA",
    className: "border-muted/35 bg-muted/5 text-muted",
  },
};

export function StatusBadge({ status }: { status: RunStatus }) {
  const item = statusMap[status];
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 font-display text-[0.6rem] font-bold tracking-[0.16em] ${item.className}`}
    >
      {item.label}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-display text-[0.66rem] font-bold tracking-[0.34em] text-neon">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-void/85 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="hud-panel animate-feedback-in relative w-full max-w-md p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-[0.62rem] font-bold tracking-[0.28em] text-alert">
              CONFIRMAÇÃO
            </p>
            <h2 id={titleId} className="mt-2 text-2xl text-ink">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="flex size-10 shrink-0 items-center justify-center border border-muted/30 text-muted transition-colors hover:border-neon/50 hover:text-neon"
            aria-label="Fechar"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        <div className="mt-5 text-sm leading-relaxed text-muted">{children}</div>
        {footer ? <div className="mt-7 flex flex-wrap justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}

export function HomeLink({ label = "Voltar ao início" }: { label?: string }) {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-muted uppercase transition-colors hover:text-neon"
    >
      <span aria-hidden>←</span> {label}
    </Link>
  );
}
