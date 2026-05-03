import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signInWithGoogle } from "../auth/signIn";
import { APP_NAME } from "../constants";

export function LoginPage() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch {
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-full items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">{APP_NAME}</h1>
        <button
          onClick={handleSignIn}
          disabled={busy}
          className="w-full rounded-md bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {t("auth.signIn")}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}
