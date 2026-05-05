import { colorFor, initialsFor } from "./avatarUtils";

const SIZE: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

export type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  ring?: boolean;
};

export function Avatar({ name, size = "md", ring = false, className = "" }: AvatarProps) {
  const c = colorFor(name);
  return (
    <span
      aria-hidden
      className={`${SIZE[size]} ${c.bg} ${c.text} ${ring ? `ring-2 ${c.ring}` : ""} inline-flex shrink-0 select-none items-center justify-center rounded-full font-display font-bold tracking-wider ${className}`}
    >
      {initialsFor(name)}
    </span>
  );
}
