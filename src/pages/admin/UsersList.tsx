import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { db } from "../../firebase/client";

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
    <main className="mx-auto max-w-xl space-y-2 p-4">
      <h2 className="text-xl font-bold">{t("admin.users")}</h2>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between rounded bg-white p-2 shadow-sm"
          >
            <div>
              <p className="font-medium">{r.displayName}</p>
              <p className="text-xs text-slate-500">{r.email}</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={r.isAdmin} onChange={() => toggle(r.id, r.isAdmin)} />
              admin
            </label>
          </li>
        ))}
      </ul>
    </main>
  );
}
