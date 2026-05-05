import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/useAuth";
import { createMatch } from "../../matches/api/createMatch";
import { nextThursday } from "../../matches/helpers/nextThursday";

function defaultDateISO() {
  const d = nextThursday();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T20:00`;
}

export function CreateMatchPage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(defaultDateISO());
  const [location, setLocation] = useState("");
  const [numTeams, setNumTeams] = useState(4);
  const [playerLimit, setPlayerLimit] = useState(24);
  const [price, setPrice] = useState(0);
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (auth.status !== "signedIn") return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (auth.status !== "signedIn") return;
    setError(null);
    setBusy(true);
    try {
      const id = await createMatch({
        date: new Date(date),
        location,
        numTeams,
        playerLimit,
        pricePerPlayer: price,
        paymentLink: link,
        notes,
        createdBy: auth.user.uid,
      });
      navigate(`/match/${id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-5 sm:px-6 sm:py-8">
      <h2 className="mb-4 font-display text-2xl font-extrabold tracking-tight text-ink">
        {t("admin.createMatch")}
      </h2>
      <form onSubmit={submit} className="surface space-y-4 p-5 sm:p-6">
        <label className="block">
          <span className="label-text">{t("admin.location")}</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="input"
          />
        </label>
        <label className="block">
          <span className="label-text">Date</span>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="input"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="label-text">{t("admin.numTeams")}</span>
            <input
              type="number"
              min={1}
              value={numTeams}
              onChange={(e) => setNumTeams(Number(e.target.value))}
              required
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
              required
              className="input"
            />
          </label>
        </div>
        <label className="block">
          <span className="label-text">{t("admin.price")}</span>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            className="input"
          />
        </label>
        <label className="block">
          <span className="label-text">{t("admin.paymentLink")}</span>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
            className="input"
          />
        </label>
        <label className="block">
          <span className="label-text">{t("admin.notes")}</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="input"
          />
        </label>
        <button disabled={busy} className="btn-primary w-full">
          {t("common.save")}
        </button>
        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
            {error}
          </p>
        )}
      </form>
    </main>
  );
}
