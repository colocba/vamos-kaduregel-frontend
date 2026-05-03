import { useTranslation } from "react-i18next";
import { useNextMatch } from "../matches/hooks/useNextMatch";
import { useParticipants } from "../matches/hooks/useParticipants";
import { useAuth } from "../auth/useAuth";
import { useIsAdmin } from "../admin/useIsAdmin";
import { MatchInfo } from "../components/MatchInfo";
import { PayButtons } from "../components/PayButtons";
import { RosterList } from "../components/RosterList";

export function HomePage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const { isAdmin } = useIsAdmin();
  const { loading, match } = useNextMatch();
  const { participants } = useParticipants(match?.id ?? null);

  if (loading) return <p className="p-4">{t("common.loading")}</p>;
  if (!match) return <p className="p-4 text-center text-slate-600">{t("match.noUpcoming")}</p>;
  if (auth.status !== "signedIn") return null;

  const uid = auth.user.uid;
  const name = auth.user.displayName ?? auth.user.email ?? "";
  const hasSelfEntry = participants.some((p) => p.paidByUid === uid && !p.isGuest);

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <MatchInfo match={match} />
      <PayButtons
        match={match}
        currentUid={uid}
        currentName={name}
        isAdmin={isAdmin}
        hasSelfEntry={hasSelfEntry}
      />
      <RosterList match={match} participants={participants} currentUid={uid} isAdmin={isAdmin} />
    </main>
  );
}
