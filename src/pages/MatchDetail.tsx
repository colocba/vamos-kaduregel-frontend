import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMatch } from "../matches/hooks/useMatch";
import { useParticipants } from "../matches/hooks/useParticipants";
import { useAuth } from "../auth/useAuth";
import { useIsAdmin } from "../admin/useIsAdmin";
import { isUpcoming } from "../matches/helpers/isUpcoming";
import { setMatchStatus } from "../matches/api/setMatchStatus";
import { updateMatch } from "../matches/api/updateMatch";
import { MatchInfo } from "../components/MatchInfo";
import { RosterList } from "../components/RosterList";
import { TeamsBoard } from "../components/TeamsBoard";
import type { Match } from "../types/match";

function EditPanel({ match }: { match: Match }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = match.date.toDate();
  const initialDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const [date, setDate] = useState(initialDate);
  const [location, setLocation] = useState(match.location);
  const [numTeams, setNumTeams] = useState(match.numTeams);
  const [playerLimit, setPlayerLimit] = useState(match.playerLimit);
  const [price, setPrice] = useState(match.pricePerPlayer);
  const [link, setLink] = useState(match.paymentLink);
  const [notes, setNotes] = useState(match.notes);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary">
        {t("admin.editDetails")}
      </button>
    );
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await updateMatch({
        matchId: match.id,
        patch: {
          date: new Date(date),
          location,
          numTeams,
          playerLimit,
          pricePerPlayer: price,
          paymentLink: link,
          notes,
        },
      });
      setOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface space-y-3 p-4 sm:p-5">
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="input"
      />
      <input value={location} onChange={(e) => setLocation(e.target.value)} className="input" />
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label-text">{t("admin.numTeams")}</span>
          <input
            type="number"
            min={1}
            value={numTeams}
            onChange={(e) => setNumTeams(Number(e.target.value))}
            className="input"
          />
        </label>
        <label className="block">
          <span className="label-text">{t("admin.numPlayers")}</span>
          <input
            type="number"
            min={1}
            value={playerLimit}
            onChange={(e) => setPlayerLimit(Number(e.target.value))}
            className="input"
          />
        </label>
      </div>
      <input
        type="number"
        min={0}
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="input"
      />
      <input type="url" value={link} onChange={(e) => setLink(e.target.value)} className="input" />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="input"
      />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          {t("common.cancel")}
        </button>
        <button type="button" disabled={busy} onClick={save} className="btn-primary">
          {t("common.save")}
        </button>
      </div>
      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function MatchDetailPage() {
  const { id = null } = useParams();
  const { t } = useTranslation();
  const auth = useAuth();
  const { isAdmin } = useIsAdmin();
  const { loading, match } = useMatch(id);
  const { participants } = useParticipants(id);

  if (loading)
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="surface h-44 animate-pulse" />
      </main>
    );
  if (!match || auth.status !== "signedIn")
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12 text-center">
        <p className="font-display text-3xl font-extrabold text-ash">404</p>
      </main>
    );

  const editable = isUpcoming(match.date) && match.status !== "cancelled";
  const canManageTeams = isAdmin && match.status !== "cancelled";

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-5 sm:px-6 sm:py-8">
      <MatchInfo match={match} />

      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          {match.status === "open" && (
            <button
              type="button"
              onClick={() => setMatchStatus(match.id, "closed")}
              className="btn-secondary"
            >
              {t("admin.closeMatch")}
            </button>
          )}
          {match.status === "closed" && (
            <button
              type="button"
              onClick={() => setMatchStatus(match.id, "open")}
              className="btn-secondary"
            >
              {t("admin.reopenMatch")}
            </button>
          )}
          {match.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => setMatchStatus(match.id, "cancelled")}
              className="btn-danger"
            >
              {t("admin.cancelMatch")}
            </button>
          )}
          <EditPanel match={match} />
        </div>
      )}

      <TeamsBoard match={match} participants={participants} isAdmin={canManageTeams} />

      <RosterList
        match={match}
        participants={participants}
        currentUid={auth.user.uid}
        isAdmin={isAdmin && editable}
      />
    </main>
  );
}
