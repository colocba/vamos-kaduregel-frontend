import { useTranslation } from "react-i18next";
import { useNextMatch } from "../matches/hooks/useNextMatch";
import { useParticipants } from "../matches/hooks/useParticipants";
import { useAuth } from "../auth/useAuth";
import { useIsAdmin } from "../admin/useIsAdmin";
import { MatchInfo } from "../components/MatchInfo";
import { PayButtons } from "../components/PayButtons";
import { RosterList } from "../components/RosterList";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-5 sm:px-6 sm:py-8">{children}</main>
  );
}

function LoadingPulse() {
  return (
    <div className="surface h-44 animate-pulse bg-gradient-to-br from-white to-paper" aria-hidden />
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="surface flex flex-col items-center justify-center px-6 py-14 text-center">
      <span
        aria-hidden
        className="font-display text-5xl"
        style={{ filter: "saturate(0.7)" }}
      >
        ⚽
      </span>
      <p className="mt-3 font-display text-xl font-extrabold tracking-tight text-ink">{title}</p>
      <p className="mt-1 text-sm text-ash">— —</p>
    </div>
  );
}

export function HomePage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const { isAdmin } = useIsAdmin();
  const { loading, match } = useNextMatch();
  const { participants } = useParticipants(match?.id ?? null);

  if (loading) {
    return (
      <PageShell>
        <LoadingPulse />
      </PageShell>
    );
  }
  if (!match) {
    return (
      <PageShell>
        <EmptyState title={t("match.noUpcoming")} />
      </PageShell>
    );
  }
  if (auth.status !== "signedIn") return null;

  const uid = auth.user.uid;
  const name = auth.user.displayName ?? auth.user.email ?? "";
  const hasSelfEntry = participants.some((p) => p.paidByUid === uid && !p.isGuest);

  return (
    <PageShell>
      <MatchInfo match={match} linkTo={`/match/${match.id}`} />
      <PayButtons
        match={match}
        currentUid={uid}
        currentName={name}
        isAdmin={isAdmin}
        hasSelfEntry={hasSelfEntry}
      />
      <RosterList match={match} participants={participants} currentUid={uid} isAdmin={isAdmin} />
    </PageShell>
  );
}
