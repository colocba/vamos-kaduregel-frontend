import { useState } from "react";
import { useTranslation } from "react-i18next";
import { joinMatch } from "../matches/api/joinMatch";
import { addGuest } from "../matches/api/addGuest";
import type { Match } from "../types/match";
import { GuestNameModal } from "./GuestNameModal";

export function PayButtons({
  match,
  currentUid,
  currentName,
  isAdmin,
  hasSelfEntry,
}: {
  match: Match;
  currentUid: string;
  currentName: string;
  isAdmin: boolean;
  hasSelfEntry: boolean;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<"none" | "selfPlusGuest" | "guestOnly">("none");
  const [error, setError] = useState<string | null>(null);
  const disabled = busy || match.status !== "open";

  async function selfOnly() {
    setError(null);
    setBusy(true);
    try {
      await joinMatch({ matchId: match.id, uid: currentUid, name: currentName, isAdmin });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function selfPlusGuest(guestName: string) {
    setError(null);
    setBusy(true);
    setModal("none");
    try {
      await joinMatch({
        matchId: match.id,
        uid: currentUid,
        name: currentName,
        isAdmin,
        guestName,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function guestOnly(guestName: string) {
    setError(null);
    setBusy(true);
    setModal("none");
    try {
      await addGuest({
        matchId: match.id,
        uid: currentUid,
        name: currentName,
        isAdmin,
        guestName,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <a
        href={match.paymentLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded bg-blue-600 px-4 py-3 text-center font-medium text-white"
      >
        {t("match.openPaymentLink")}
      </a>
      {!hasSelfEntry && (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={selfOnly}
            className="w-full rounded bg-emerald-600 px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {t("match.iPaid")}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setModal("selfPlusGuest")}
            className="w-full rounded border border-emerald-600 px-4 py-3 font-medium text-emerald-700 disabled:opacity-50"
          >
            {t("match.payForGuest")}
          </button>
        </>
      )}
      {hasSelfEntry && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setModal("guestOnly")}
          className="w-full rounded border border-slate-400 px-4 py-3 font-medium disabled:opacity-50"
        >
          {t("match.addGuest")}
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <GuestNameModal
        open={modal === "selfPlusGuest"}
        onSubmit={selfPlusGuest}
        onCancel={() => setModal("none")}
      />
      <GuestNameModal
        open={modal === "guestOnly"}
        onSubmit={guestOnly}
        onCancel={() => setModal("none")}
      />
    </div>
  );
}
