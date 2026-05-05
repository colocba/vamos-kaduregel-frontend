import { useState } from "react";
import { useTranslation } from "react-i18next";
import { joinMatch } from "../matches/api/joinMatch";
import { addGuest } from "../matches/api/addGuest";
import type { Match } from "../types/match";
import { GuestNameModal } from "./GuestNameModal";

function ExternalIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M6 3h7v7M13 3L6.5 9.5M11 8.5V13H3V5h4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

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
    <div className="space-y-2.5">
      <a
        href={match.paymentLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-stadium w-full"
      >
        <ExternalIcon />
        {t("match.openPaymentLink")}
      </a>
      {!hasSelfEntry && (
        <>
          <button
            type="button"
            disabled={disabled}
            onClick={selfOnly}
            className="btn-primary w-full"
          >
            {t("match.iPaid")}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setModal("selfPlusGuest")}
            className="btn-secondary w-full"
          >
            <PlusIcon />
            {t("match.payForGuest")}
          </button>
        </>
      )}
      {hasSelfEntry && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setModal("guestOnly")}
          className="btn-secondary w-full"
        >
          <PlusIcon />
          {t("match.addGuest")}
        </button>
      )}
      {error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
          {error}
        </p>
      )}

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
