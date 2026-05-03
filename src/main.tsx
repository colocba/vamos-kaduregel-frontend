import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./firebase/client";
import i18n from "./i18n";
import { syncHtmlDirAndLang } from "./i18n/direction";
import type { Locale } from "./constants";
import App from "./App.tsx";

syncHtmlDirAndLang(i18n.resolvedLanguage as Locale);
i18n.on("languageChanged", (lng) => syncHtmlDirAndLang(lng as Locale));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
