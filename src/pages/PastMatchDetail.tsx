import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMatch } from "../matches/hooks/useMatch";
import { useParticipants } from "../matches/hooks/useParticipants";
import { MatchInfo } from "../components/MatchInfo";
import { Avatar } from "../components/Avatar";

export function PastMatchDetailPage() {
  const { id = null } = useParams();
  const { t } = useTranslation();
  const { loading, match } = useMatch(id);
  const { participants } = useParticipants(id);

  if (loading)
    return (
      <main className="mx-auto w-full max-w-2xl space-y-3 px-4 py-5 sm:px-6 sm:py-8">
        <div className="surface h-44 animate-pulse" />
      </main>
    );
  if (!match)
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12 text-center">
        <p className="font-display text-3xl font-extrabold text-ash">404</p>
      </main>
    );

  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-5 sm:px-6 sm:py-8">
      <MatchInfo match={match} />
      <section className="surface p-4 sm:p-5">
        <header className="flex items-baseline justify-between">
          <h3 className="font-display text-base font-extrabold uppercase tracking-[0.18em] text-ink">
            {t("match.roster")}
          </h3>
          <span className="font-display text-sm font-bold tabular-nums text-ash">
            {participants.length}
          </span>
        </header>
        <ul className="mt-3 space-y-2">
          {participants.map((p) => {
            const name = p.isGuest ? (p.guestName ?? "?") : p.paidByName;
            return (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5 shadow-card"
              >
                <Avatar name={name} size="md" ring={p.verified} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold text-ink">{name}</p>
                  {p.isGuest && (
                    <p className="text-xs text-ash">
                      {t("match.guestOf", { name: p.paidByName })}
                    </p>
                  )}
                </div>
                {p.team && (
                  <span className="pill border-pitch-200 bg-pitch-50 text-pitch-800">
                    {t("match.team", { n: p.team })}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
