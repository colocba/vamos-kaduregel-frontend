import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BottomSheet } from "./BottomSheet";

export function GuestNameModal({
  open,
  onSubmit,
  onCancel,
}: {
  open: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  return (
    <BottomSheet open={open} onClose={onCancel}>
      <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">
        {t("match.addGuest")}
      </h2>
      <p className="mt-1 text-sm text-ash">{t("match.guestOf", { name: "" }).replace("{}", "")}</p>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input mt-4"
      />
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-ghost">
          {t("common.cancel")}
        </button>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            onSubmit(name.trim());
            setName("");
          }}
          className="btn-primary"
        >
          {t("common.save")}
        </button>
      </div>
    </BottomSheet>
  );
}
