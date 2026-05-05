import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePastMatches } from "../matches/hooks/usePastMatches";

function ChevronEnd() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-ash-soft transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" fill="none" aria-hidden>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PastMatchesPage() {
  const { t, i18n } = useTranslation();
  const { loading, matches } = usePastMatches();
  const fmt = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium" });
  const wkfmt = new Intl.DateTimeFormat(i18n.resolvedLanguage, { weekday: "short" });

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          {t("nav.past")}
        </h2>
        {!loading && (
          <span className="font-display text-sm font-bold tabular-nums text-ash-soft">
            {matches.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface-tight h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {matches.map((m) => {
            const d = m.date.toDate();
            return (
              <li key={m.id}>
                <Link
                  to={`/past/${m.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-line bg-white px-4 py-3 shadow-card transition-all hover:border-pitch-200 hover:shadow-ring"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-paper">
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-ash-soft">
                      {wkfmt.format(d)}
                    </span>
                    <span className="font-display text-base font-extrabold leading-none text-ink">
                      {d.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold text-ink">{fmt.format(d)}</p>
                    <p className="truncate text-xs text-ash">{m.location}</p>
                  </div>
                  <ChevronEnd />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
