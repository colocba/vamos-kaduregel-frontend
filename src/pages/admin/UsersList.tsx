import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { db } from "../../firebase/client";
import { Avatar } from "../../components/Avatar";

type Row = { id: string; displayName: string; email: string; isAdmin: boolean };

export function UsersListPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(
    () =>
      onSnapshot(collection(db, "users"), (snap) =>
        setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Row, "id">) }))),
      ),
    [],
  );

  async function toggle(uid: string, current: boolean) {
    await updateDoc(doc(db, "users", uid), { isAdmin: !current });
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          {t("admin.users")}
        </h2>
        <span className="font-display text-sm font-bold tabular-nums text-ash-soft">
          {rows.length}
        </span>
      </div>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5 shadow-card"
          >
            <Avatar name={r.displayName || r.email} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold text-ink">{r.displayName}</p>
              <p className="truncate text-xs text-ash">{r.email}</p>
            </div>
            <label className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-semibold">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 accent-pitch-600"
                checked={r.isAdmin}
                onChange={() => toggle(r.id, r.isAdmin)}
              />
              admin
            </label>
          </li>
        ))}
      </ul>
    </main>
  );
}
