import type { Locale } from "../constants";

export type Direction = "rtl" | "ltr";

export function directionFor(locale: Locale): Direction {
  return locale === "he" ? "rtl" : "ltr";
}

export function syncHtmlDirAndLang(locale: Locale) {
  const html = document.documentElement;
  html.dir = directionFor(locale);
  html.lang = locale;
}
