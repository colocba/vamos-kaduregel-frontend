import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router-dom";
import { APP_NAME } from "../constants";
import { useAuth } from "../auth/useAuth";
import { signOut } from "../auth/signOut";
import { useIsAdmin } from "../admin/useIsAdmin";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Avatar } from "./Avatar";

function BallMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="14" className="fill-pitch-700" />
      <path
        d="M16 5l4.5 3.5-1.7 5.5h-5.6L11.5 8.5 16 5z"
        className="fill-white"
      />
      <path
        d="M11.5 8.5l-5 3.7 1.8 5.6 4.7-.6.7-5.4-2.2-3.3z"
        className="fill-white/0 stroke-white/80"
        strokeWidth="1.1"
      />
      <path
        d="M20.5 8.5l5 3.7-1.8 5.6-4.7-.6-.7-5.4 2.2-3.3z"
        className="fill-white/0 stroke-white/80"
        strokeWidth="1.1"
      />
      <path
        d="M9.5 19l2.4 5.6 4 .9 4-.9 2.4-5.6-2.4-1.6h-7.9L9.5 19z"
        className="fill-white/0 stroke-white/80"
        strokeWidth="1.1"
      />
      <circle cx="16" cy="16" r="14" className="fill-none stroke-pitch-900/30" strokeWidth="1" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type NavItem = { to: string; label: string };

function NavLinks({
  items,
  onClick,
  variant,
}: {
  items: NavItem[];
  onClick?: () => void;
  variant: "row" | "stack";
}) {
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          onClick={onClick}
          className={({ isActive }) =>
            variant === "row"
              ? `relative rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-pitch-50 text-pitch-800"
                    : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                }`
              : `block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-pitch-50 text-pitch-800"
                    : "text-ink/80 hover:bg-ink/5"
                }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

export function Header() {
  const { t } = useTranslation();
  const auth = useAuth();
  const { isAdmin } = useIsAdmin();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const signedIn = auth.status === "signedIn";
  const userName = signedIn ? (auth.user.displayName ?? auth.user.email ?? "") : "";
  const firstName = userName.split(/\s+/)[0] || userName;

  const items: NavItem[] = [];
  if (signedIn) {
    items.push({ to: "/", label: t("nav.home") });
    items.push({ to: "/past", label: t("nav.past") });
    if (isAdmin) {
      items.push({ to: "/admin/create", label: t("admin.createMatch") });
      items.push({ to: "/admin/users", label: t("admin.users") });
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        <Link
          to={signedIn ? "/" : "/login"}
          className="group flex shrink-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-pitch-500"
          aria-label={APP_NAME}
        >
          <BallMark className="h-9 w-9 transition-transform group-hover:-rotate-12" />
          <h1
            aria-label={APP_NAME}
            className="font-display text-[15px] font-extrabold uppercase leading-none tracking-[0.06em] text-ink sm:text-[17px]"
          >
            <span aria-hidden className="block text-ash text-[10px] font-bold tracking-[0.32em]">
              VAMOS
            </span>
            <span aria-hidden className="block">
              Kaduregel
            </span>
          </h1>
        </Link>

        {signedIn && (
          <nav className="ms-2 hidden items-center gap-1 md:flex">
            <NavLinks items={items} variant="row" />
          </nav>
        )}

        <div className="ms-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {signedIn && (
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-2 rounded-full border border-line bg-white px-2 py-1 shadow-card">
                <Avatar name={userName || "?"} size="sm" />
                <span className="pe-2 text-sm font-semibold text-ink">{firstName}</span>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                className="btn-ghost px-3 py-2 text-sm"
              >
                {t("auth.signOut")}
              </button>
            </div>
          )}

          {signedIn && (
            <button
              type="button"
              aria-label={open ? t("common.cancel") : t("nav.menu")}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink shadow-card"
            >
              <MenuIcon open={open} />
            </button>
          )}
        </div>
      </div>

      {signedIn && open && (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm animate-rise-in"
          />
          <div className="absolute inset-x-0 top-16 z-40 mx-3 mt-2 rounded-2xl border border-line bg-white p-3 shadow-ring animate-rise-in">
            <div className="flex items-center gap-3 rounded-xl bg-paper px-3 py-3">
              <Avatar name={userName || "?"} size="md" ring />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{firstName}</p>
                <p className="truncate text-xs text-ash">{auth.user.email}</p>
              </div>
            </div>
            <nav className="mt-2 flex flex-col gap-1">
              <NavLinks items={items} variant="stack" onClick={() => setOpen(false)} />
            </nav>
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="btn-secondary"
              >
                {t("auth.signOut")}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
