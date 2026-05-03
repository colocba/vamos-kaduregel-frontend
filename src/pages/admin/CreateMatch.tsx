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
  const [numFields, setNumFields] = useState<1 | 2>(2);
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
        numFields,
        pricePerPlayer: price,
        paymentLink: link,
        notes,
        createdBy: auth.user.uid,
      });
      navigate(`/admin/match/${id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-3 p-4">
      <h2 className="text-xl font-bold">{t("admin.createMatch")}</h2>
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-sm">{t("admin.location")}</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <label className="block">
          <span className="text-sm">Date</span>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <label className="block">
          <span className="text-sm">{t("admin.fields")}</span>
          <select
            value={numFields}
            onChange={(e) => setNumFields(Number(e.target.value) as 1 | 2)}
            className="mt-1 w-full rounded border p-2"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm">{t("admin.price")}</span>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <label className="block">
          <span className="text-sm">{t("admin.paymentLink")}</span>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <label className="block">
          <span className="text-sm">{t("admin.notes")}</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded border p-2"
          />
        </label>
        <button
          disabled={busy}
          className="w-full rounded bg-slate-900 p-3 text-white disabled:opacity-50"
        >
          {t("common.save")}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
