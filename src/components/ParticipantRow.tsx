import { useTranslation } from "react-i18next";
import type { Participant } from "../types/participant";

export type ParticipantRowProps = {
  participant: Participant;
  canCancel: boolean;
  onCancel?: () => void;
};

export function ParticipantRow({ participant: p, canCancel, onCancel }: ParticipantRowProps) {
  const { t } = useTranslation();
  const label = p.isGuest
    ? `${p.guestName} (${t("match.guestOf", { name: p.paidByName })})`
    : p.paidByName;

  return (
    <li className="flex items-center justify-between rounded bg-white p-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {p.verified && (
          <span aria-label={t("match.verified")} className="text-emerald-600">
            ✓
          </span>
        )}
        {p.team && (
          <span className="text-sm text-slate-500">· {t("match.team", { n: p.team })}</span>
        )}
      </div>
      {canCancel && onCancel && (
        <button onClick={onCancel} className="text-sm text-red-600">
          {p.isGuest ? t("match.cancelGuest", { name: p.guestName }) : t("match.cancelMySpot")}
        </button>
      )}
    </li>
  );
}
