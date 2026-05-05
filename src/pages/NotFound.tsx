import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="font-display text-7xl font-extrabold tracking-tight text-ash-soft">404</p>
      <p className="mt-2 font-display text-lg font-bold text-ink">Off the pitch.</p>
      <Link to="/" className="btn-primary mt-6">
        ⚽
      </Link>
    </main>
  );
}
