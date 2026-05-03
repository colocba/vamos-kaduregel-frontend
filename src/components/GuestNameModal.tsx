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
      <h2 className="mb-3 text-lg font-semibold">{t("match.addGuest")}</h2>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border border-slate-300 p-2"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-2">
          {t("common.cancel")}
        </button>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            onSubmit(name.trim());
            setName("");
          }}
          className="rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
        >
          {t("common.save")}
        </button>
      </div>
    </BottomSheet>
  );
}
