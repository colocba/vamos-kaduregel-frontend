const PALETTE = [
  { bg: "bg-pitch-100", text: "text-pitch-800", ring: "ring-pitch-200" },
  { bg: "bg-stadium-400/30", text: "text-stadium-600", ring: "ring-stadium-400/40" },
  { bg: "bg-sky-100", text: "text-sky-800", ring: "ring-sky-200" },
  { bg: "bg-rose-100", text: "text-rose-800", ring: "ring-rose-200" },
  { bg: "bg-violet-100", text: "text-violet-800", ring: "ring-violet-200" },
  { bg: "bg-amber-100", text: "text-amber-800", ring: "ring-amber-200" },
  { bg: "bg-emerald-100", text: "text-emerald-800", ring: "ring-emerald-200" },
  { bg: "bg-indigo-100", text: "text-indigo-800", ring: "ring-indigo-200" },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export function initialsFor(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function colorFor(name: string) {
  return PALETTE[hash(name || "?") % PALETTE.length];
}
