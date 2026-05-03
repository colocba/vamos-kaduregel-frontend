import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMatch } from "../../matches/hooks/useMatch";
import { useParticipants } from "../../matches/hooks/useParticipants";
import { MatchInfo } from "../../components/MatchInfo";
import { verifyParticipant } from "../../matches/api/verifyParticipant";
import { cancelParticipant } from "../../matches/api/cancelParticipant";
import { assignTeam } from "../../matches/api/assignTeam";
import { setMatchStatus } from "../../matches/api/setMatchStatus";
import { updateMatch } from "../../matches/api/updateMatch";
import { teamCount } from "../../matches/helpers/teamCount";
import { useAuth } from "../../auth/useAuth";
import type { Match } from "../../types/match";

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
  const [numFields, setNumFields] = useState<1 | 2>(match.numFields);
  const [price, setPrice] = useState(match.pricePerPlayer);
  const [link, setLink] = useState(match.paymentLink);
  const [notes, setNotes] = useState(match.notes);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded border px-3 py-1 text-sm"
      >
        {t("common.save")}
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
          numFields,
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
    <div className="space-y-2 rounded border bg-white p-3">
      <input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full rounded border p-2"
      />
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full rounded border p-2"
      />
      <select
        value={numFields}
        onChange={(e) => setNumFields(Number(e.target.value) as 1 | 2)}
        className="w-full rounded border p-2"
      >
        <option value={1}>1</option>
        <option value={2}>2</option>
      </select>
      <input
        type="number"
        min={0}
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="w-full rounded border p-2"
      />
      <input
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="w-full rounded border p-2"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full rounded border p-2"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="rounded bg-slate-900 px-3 py-1 text-white"
        >
          {t("common.save")}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-3 py-1">
          {t("common.cancel")}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function ManageMatchPage() {
  const { id = null } = useParams();
  const { t } = useTranslation();
  const auth = useAuth();
  const { loading, match } = useMatch(id);
  const { participants } = useParticipants(id);

  if (loading) return <p className="p-4">{t("common.loading")}</p>;
  if (!match || auth.status !== "signedIn") return <p className="p-4">404</p>;
  const uid = auth.user.uid;
  const teams = teamCount(match.numFields);
  const teamOptions = Array.from({ length: teams }, (_, i) => i + 1);

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <MatchInfo match={match} />
      <div className="flex flex-wrap gap-2">
        {match.status === "open" && (
          <button
            type="button"
            onClick={() => setMatchStatus(match.id, "closed")}
            className="rounded border px-3 py-1 text-sm"
          >
            {t("admin.closeMatch")}
          </button>
        )}
        {match.status === "closed" && (
          <button
            type="button"
            onClick={() => setMatchStatus(match.id, "open")}
            className="rounded border px-3 py-1 text-sm"
          >
            {t("admin.reopenMatch")}
          </button>
        )}
        {match.status !== "cancelled" && (
          <button
            type="button"
            onClick={() => setMatchStatus(match.id, "cancelled")}
            className="rounded border border-red-400 px-3 py-1 text-sm text-red-700"
          >
            {t("admin.cancelMatch")}
          </button>
        )}
      </div>
      <EditPanel match={match} />
      <ul className="space-y-1">
        {participants.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded bg-white p-2 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={p.verified}
                onChange={(e) =>
                  verifyParticipant({
                    matchId: match.id,
                    participantId: p.id,
                    verified: e.target.checked,
                    byUid: uid,
                  })
                }
              />
              <span>
                {p.isGuest
                  ? `${p.guestName} (${t("match.guestOf", { name: p.paidByName })})`
                  : p.paidByName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={p.team ?? ""}
                onChange={(e) =>
                  assignTeam({
                    matchId: match.id,
                    participantId: p.id,
                    team:
                      e.target.value === ""
                        ? null
                        : (Number(e.target.value) as 1 | 2 | 3 | 4),
                  })
                }
                className="rounded border p-1 text-sm"
              >
                <option value="">—</option>
                {teamOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => cancelParticipant({ matchId: match.id, participantId: p.id })}
              >
                {t("common.cancel")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
