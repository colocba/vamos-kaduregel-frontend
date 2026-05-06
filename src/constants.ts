export const APP_NAME = "Vamos Kaduregel";
export const SUPPORTED_LOCALES = ["he", "es", "en", "pt"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "he";
