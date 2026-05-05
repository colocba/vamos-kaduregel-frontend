import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signInWithGoogle } from "../auth/signIn";
import { APP_NAME } from "../constants";

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M9 3.6c1.32 0 2.5.45 3.43 1.34l2.55-2.55C13.46.96 11.42 0 9 0 5.48 0 2.44 2.02 1 4.96l2.97 2.31C4.66 5.16 6.66 3.6 9 3.6z"
      />
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84c-.21 1.13-.85 2.09-1.81 2.74v2.27h2.92c1.71-1.57 2.69-3.88 2.69-6.66z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.4 5.4 0 0 1 3.6 9c0-.59.1-1.17.27-1.71L1 4.96A9 9 0 0 0 0 9c0 1.45.35 2.82.97 4.04l3-2.33z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.95-2.18l-2.92-2.27c-.81.55-1.85.87-3.03.87-2.34 0-4.34-1.56-5.04-3.66L1 13.04C2.44 15.98 5.48 18 9 18z"
      />
    </svg>
  );
}

function BallMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <circle cx="32" cy="32" r="28" className="fill-pitch-700" />
      <path d="M32 12l9 6.5-3.4 11h-11.2L23 18.5 32 12z" className="fill-white" />
      <path
        d="M23 18.5l-10 7.5 3.5 11.5 9.5-1.2L27 24.7l-4-6.2z"
        className="fill-white/0 stroke-white/85"
        strokeWidth="2"
      />
      <path
        d="M41 18.5l10 7.5-3.5 11.5-9.5-1.2L37 24.7l4-6.2z"
        className="fill-white/0 stroke-white/85"
        strokeWidth="2"
      />
      <path
        d="M19 38l4.5 11.2 8.5 1.6 8.5-1.6L45 38l-4.5-3h-17L19 38z"
        className="fill-white/0 stroke-white/85"
        strokeWidth="2"
      />
    </svg>
  );
}

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
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            "radial-gradient(600px 400px at 20% 30%, rgba(15,107,69,0.12), transparent 60%), radial-gradient(500px 380px at 85% 70%, rgba(245,158,11,0.10), transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <BallMark className="h-16 w-16 drop-shadow-md" />
          <p className="mt-4 font-display text-[11px] font-extrabold uppercase tracking-[0.32em] text-ash">
            VAMOS
          </p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
            {APP_NAME.split(" ")[1] ?? APP_NAME}
          </h1>
        </div>
        <div className="surface relative overflow-hidden p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-pitch-700/5 blur-2xl" />
          <p className="text-center text-sm text-ash">
            {t("auth.signIn")}
          </p>
          <button
            onClick={handleSignIn}
            disabled={busy}
            className="btn mt-4 w-full border border-line bg-white text-ink shadow-card hover:bg-paper disabled:opacity-60"
          >
            <GoogleMark />
            {t("auth.signIn")}
          </button>
          {error && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2 text-center text-sm text-rose-700">
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
