export function nextThursday(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(20, 0, 0, 0);
  const day = d.getDay();
  // 4 = Thursday
  let delta = (4 - day + 7) % 7;
  // If today is Thursday and 20:00 already passed (or is now), roll to next week.
  if (delta === 0 && d.getTime() <= now.getTime()) delta = 7;
  d.setDate(d.getDate() + delta);
  return d;
}
