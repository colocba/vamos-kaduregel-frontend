import { useEffect, type ReactNode } from "react";

export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-rise-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-t-2xl border border-line bg-white p-5 shadow-ring sm:rounded-2xl animate-rise-in">
        <span
          aria-hidden
          className="mx-auto mb-3 block h-1 w-10 rounded-full bg-line sm:hidden"
        />
        {children}
      </div>
    </div>
  );
}
