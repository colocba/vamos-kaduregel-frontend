import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Match } from "../types/match";

const STATUS_STYLE: Record<Match["status"], string> = {
  open: "bg-pitch-50 text-pitch-800 border-pitch-200",
  closed: "bg-stadium-400/15 text-stadium-600 border-stadium-400/40",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_DOT: Record<Match["status"], string> = {
  open: "bg-pitch-500",
  closed: "bg-stadium-500",
  cancelled: "bg-rose-500",
};

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-pitch-700" fill="none" aria-hidden>
      <path
        d="M12 22s7-7.58 7-12a7 7 0 10-14 0c0 4.42 7 12 7 12z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-stadium-600" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9 9.5c0-1.1 1.3-2 3-2s3 .9 3 2-1.3 2-3 2-3 .9-3 2 1.3 2 3 2 3-.9 3-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M12 5v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function MatchInfo({ match, linkTo }: { match: Match; linkTo?: string }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const date = match.date.toDate();
  const weekday = new Intl.DateTimeFormat(lang, { weekday: "long" }).format(date);
  const dayMonth = new Intl.DateTimeFormat(lang, { day: "2-digit", month: "short" }).format(date);
  const time = new Intl.DateTimeFormat(lang, { hour: "2-digit", minute: "2-digit" }).format(date);
  const year = date.getFullYear();

  const limit = match.playerLimit || 1;
  const pct = Math.min(100, Math.round((match.paidCount / limit) * 100));

  const Wrapper: React.ElementType = linkTo ? Link : "section";
  const wrapperProps = linkTo
    ? {
        to: linkTo,
        "aria-label": t("match.details"),
        className:
          "surface relative block overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:border-pitch-200 hover:shadow-ring focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-500 sm:p-6",
      }
    : { className: "surface relative overflow-hidden p-5 sm:p-6" };

  return (
    <Wrapper {...wrapperProps}>
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-pitch-700/5 blur-2xl" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-stadium-500/10 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-ash">
            {weekday}
          </p>
          <h2 className="mt-1 font-display text-3xl font-extrabold leading-none tracking-tight text-ink sm:text-4xl">
            {dayMonth}
            <span className="ms-2 text-ash-soft">{year}</span>
          </h2>
          <p className="mt-1 font-display text-lg font-bold tracking-wide text-pitch-800">
            {time}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${STATUS_STYLE[match.status]}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[match.status]}`} />
          {t(`match.${match.status}`)}
        </span>
      </div>

      <div className="relative mt-5 grid gap-2 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2 text-ink">
          <PinIcon />
          <span className="font-semibold">{match.location || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-ink">
          <CoinIcon />
          <span className="font-semibold">{match.pricePerPlayer}</span>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ash">
            {t("match.capacity")}
          </span>
          <span className="font-display text-sm font-extrabold tracking-tight text-ink">
            {match.paidCount}
            <span className="text-ash-soft"> / {match.playerLimit}</span>
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pitch-500 via-pitch-600 to-pitch-700 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {match.notes && (
        <p className="relative mt-5 rounded-xl border border-line bg-paper/60 p-3 text-sm leading-relaxed text-ink/80">
          {match.notes}
        </p>
      )}

      {linkTo && (
        <span
          aria-hidden
          className="pointer-events-none absolute end-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white/80 text-ash-soft opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 rtl:scale-x-[-1]" fill="none">
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </Wrapper>
  );
}
