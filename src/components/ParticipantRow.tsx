import { useTranslation } from "react-i18next";
import type { Participant } from "../types/participant";
import { Avatar } from "./Avatar";

export type ParticipantRowProps = {
  participant: Participant;
  canCancel: boolean;
  onCancel?: () => void;
  index?: number;
  canVerify?: boolean;
  onToggleVerify?: () => void;
};

function CrossIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function VerifyControl({
  active,
  interactive,
  onClick,
  label,
}: {
  active: boolean;
  interactive: boolean;
  onClick?: () => void;
  label: string;
}) {
  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={label}
        title={label}
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-all ${
          active
            ? "bg-pitch-600 text-white shadow-card hover:bg-pitch-700"
            : "border border-dashed border-ash-soft text-ash-soft hover:border-pitch-500 hover:bg-pitch-50 hover:text-pitch-700"
        }`}
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
          <path
            d="M3.5 8.5l3 3 6-7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }
  if (!active) {
    return (
      <span
        aria-hidden
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-ash-soft text-ash-soft"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
          <circle cx="8" cy="8" r="3" fill="currentColor" />
        </svg>
      </span>
    );
  }
  return (
    <span
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pitch-600 text-white shadow-card"
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
        <path
          d="M3.5 8.5l3 3 6-7"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ParticipantRow({
  participant: p,
  canCancel,
  onCancel,
  index,
  canVerify,
  onToggleVerify,
}: ParticipantRowProps) {
  const { t } = useTranslation();
  const displayName = p.isGuest ? (p.guestName ?? "?") : p.paidByName;
  const subline = p.isGuest ? t("match.guestOf", { name: p.paidByName }) : null;

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5 shadow-card transition-all hover:border-pitch-200 hover:shadow-ring">
      {typeof index === "number" && (
        <span className="hidden w-6 shrink-0 text-end font-display text-xs font-bold tabular-nums text-ash-soft sm:block">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <Avatar name={displayName} size="md" ring={p.verified} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="truncate font-display text-sm font-bold text-ink">{displayName}</p>
          {p.isGuest && (
            <span className="pill border-stadium-400/40 bg-stadium-400/10 text-stadium-600">
              {t("match.guestBadge")}
            </span>
          )}
          {p.team && (
            <span className="pill border-pitch-200 bg-pitch-50 text-pitch-800">
              {t("match.team", { n: p.team })}
            </span>
          )}
        </div>
        {subline && <p className="mt-0.5 truncate text-xs text-ash">{subline}</p>}
      </div>
      <VerifyControl
        active={p.verified}
        interactive={Boolean(canVerify && onToggleVerify)}
        onClick={onToggleVerify}
        label={t("match.confirmPaid")}
      />
      {canCancel && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          aria-label={
            p.isGuest ? t("match.cancelGuest", { name: p.guestName ?? "" }) : t("match.cancelMySpot")
          }
          className="ms-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ash transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
        >
          <CrossIcon />
        </button>
      )}
    </li>
  );
}
