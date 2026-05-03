# Vamos Kaduregel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v1 of the Vamos Kaduregel weekly soccer subscription web app — Firebase-only stack, no backend.

**Architecture:** React (Vite) + TypeScript + Tailwind frontend talking directly to Firestore via the Firebase Web SDK. Auth via Firebase Authentication (Google provider). All multi-document mutations run inside Firestore transactions, gated by Firestore Security Rules. Hosted on Firebase Hosting. The Spark (free) tier is sufficient.

**Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, Firebase JS SDK 10, react-i18next, react-router-dom 6, Vitest, React Testing Library, Firebase Emulator Suite, `@firebase/rules-unit-testing`.

---

## File Structure

```
vamos-kaduregel-frontend/
├── package.json
├── tsconfig.json / tsconfig.node.json / tsconfig.test.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .env.example          # VITE_FIREBASE_* template
├── .env.local            # gitignored — real values
├── .gitignore
├── firebase.json         # hosting + emulator config
├── firestore.rules       # security rules
├── firestore.indexes.json
├── .firebaserc
├── README.md
├── docs/superpowers/...  # spec + this plan (already in place)
├── public/                # static assets
└── src/
    ├── main.tsx                       # entry, mounts <App>
    ├── App.tsx                        # router + providers
    ├── index.css                      # Tailwind imports + global styles
    ├── constants.ts                   # APP_NAME, SUPPORTED_LOCALES
    ├── firebase/
    │   ├── client.ts                  # Firebase init (app, auth, firestore)
    │   └── emulator.ts                # connect to emulators in dev/test
    ├── i18n/
    │   ├── index.ts                   # i18next init
    │   ├── direction.ts               # locale → dir, html attr sync
    │   └── locales/{he,es,en}.json    # translations
    ├── auth/
    │   ├── AuthProvider.tsx           # auth state context
    │   ├── useAuth.ts                 # consumer hook
    │   ├── ensureUserDoc.ts           # first-sign-in user doc creation
    │   ├── signIn.ts / signOut.ts     # provider actions
    │   └── ProtectedRoute.tsx         # auth gate
    ├── admin/
    │   ├── useIsAdmin.ts              # reads users/{uid}.isAdmin
    │   └── AdminRoute.tsx             # admin gate
    ├── types/
    │   ├── user.ts
    │   ├── match.ts
    │   └── participant.ts
    ├── matches/
    │   ├── api/
    │   │   ├── joinMatch.ts           # transaction: self ± guest
    │   │   ├── addGuest.ts            # transaction: +1 guest only
    │   │   ├── cancelParticipant.ts   # transaction: -1 with reopen logic
    │   │   ├── createMatch.ts
    │   │   ├── updateMatch.ts
    │   │   ├── setMatchStatus.ts
    │   │   ├── verifyParticipant.ts
    │   │   └── assignTeam.ts
    │   ├── hooks/
    │   │   ├── useNextMatch.ts
    │   │   ├── useMatch.ts
    │   │   ├── usePastMatches.ts
    │   │   └── useParticipants.ts
    │   └── helpers/
    │       ├── deriveLimit.ts         # numFields × 12
    │       ├── teamCount.ts           # numFields × 2
    │       ├── isUpcoming.ts          # match.date > now
    │       └── nextThursday.ts        # default date for create form
    ├── pages/
    │   ├── Login.tsx
    │   ├── Home.tsx
    │   ├── PastMatches.tsx
    │   ├── PastMatchDetail.tsx
    │   ├── NotFound.tsx
    │   └── admin/
    │       ├── CreateMatch.tsx
    │       ├── ManageMatch.tsx
    │       └── UsersList.tsx
    ├── components/
    │   ├── Header.tsx
    │   ├── LanguageSwitcher.tsx
    │   ├── MatchInfo.tsx              # date/location/notes presentation
    │   ├── PayButtons.tsx             # [Open link] [I paid] [Add guest]
    │   ├── GuestNameModal.tsx
    │   ├── RosterList.tsx
    │   ├── ParticipantRow.tsx
    │   ├── BottomSheet.tsx            # mobile-aware modal
    │   ├── Spinner.tsx
    │   └── ErrorBanner.tsx
    └── test/
        ├── setup.ts                   # vitest globals, RTL teardown
        ├── emulator.ts                # ensure emulators are reachable
        └── factories.ts               # makeUser / makeMatch / makeParticipant

tests/
└── rules/
    └── firestore.rules.test.ts        # @firebase/rules-unit-testing
```

Each file has one clear responsibility. Hooks are isolated from components, transactions are isolated from hooks, types live with the domain. The split between `pages/` (routed views) and `components/` (reusable UI) is conventional React.

---

## Phase 1 — Project Foundation

### Task 1: Scaffold Vite + React + TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `.gitignore`

- [ ] **Step 1: Run Vite scaffold**

```bash
cd /Users/abaum/Desktop/personal-stuff/personal-projects/vamos-kaduregel-frontend
npm create vite@latest . -- --template react-ts
# When prompted "Current directory is not empty", choose "Ignore files and continue"
```

- [ ] **Step 2: Install scaffolded deps**

```bash
npm install
```

- [ ] **Step 3: Replace default `src/App.tsx`**

```tsx
export default function App() {
  return <h1>Vamos Kaduregel</h1>;
}
```

- [ ] **Step 4: Replace `src/index.css` with empty file (Tailwind added next task)**

```css
/* Tailwind directives added in Task 2 */
```

- [ ] **Step 5: Update `.gitignore`**

Append:
```
.env.local
.env.*.local
.firebase/
dist-ssr/
*.local
.DS_Store
coverage/
firebase-debug.log
firestore-debug.log
ui-debug.log
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```
Expected: server listening on `http://localhost:5173`, page shows "Vamos Kaduregel". Stop with Ctrl-C.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript project"
```

---

### Task 2: Add Tailwind CSS

**Files:**
- Create: `tailwind.config.js`, `postcss.config.js`
- Modify: `src/index.css`, `src/App.tsx`

- [ ] **Step 1: Install Tailwind**

```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2: Replace `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

- [ ] **Step 3: Replace `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body { @apply bg-slate-50 text-slate-900 antialiased; }
```

- [ ] **Step 4: Update `src/App.tsx` to use Tailwind**

```tsx
export default function App() {
  return (
    <main className="flex min-h-full items-center justify-center p-4">
      <h1 className="text-3xl font-bold">Vamos Kaduregel</h1>
    </main>
  );
}
```

- [ ] **Step 5: Verify Tailwind renders**

```bash
npm run dev
```
Expected: title is bold, large, centered, slate colors visible. Stop server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add Tailwind CSS"
```

---

### Task 3: Add testing toolchain (Vitest + React Testing Library + JSDOM)

**Files:**
- Create: `vitest.config.ts`, `tsconfig.test.json`, `src/test/setup.ts`, `src/App.test.tsx`
- Modify: `package.json` (add `test` script), `tsconfig.json` (include test config)

- [ ] **Step 1: Install dev deps**

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
```

- [ ] **Step 3: Create `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

- [ ] **Step 4: Create `tsconfig.test.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**/*", "tests/**/*"]
}
```

- [ ] **Step 5: Update `tsconfig.json` references**

Add to top-level `references` array (create if missing):
```json
{ "path": "./tsconfig.test.json" }
```

- [ ] **Step 6: Add test scripts to `package.json`**

In the `scripts` object:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 7: Write smoke test for `App`**

`src/App.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the app name", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /vamos kaduregel/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Run tests, verify pass**

```bash
npm test
```
Expected: 1 passed.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: add Vitest + RTL testing setup"
```

---

### Task 4: Add Firebase SDK and client init

**Files:**
- Create: `src/firebase/client.ts`, `.env.example`, `.env.local`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install Firebase**

```bash
npm install firebase@10
```

- [ ] **Step 2: Create `.env.example`**

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_FIREBASE_EMULATORS=false
```

- [ ] **Step 3: Create `.env.local` (real values from Firebase console)**

The engineer fills this in after creating the Firebase project. For now, copy `.env.example` to `.env.local` so the app boots in dev (use placeholder strings — Firebase init won't crash with malformed values until a real call is made).

```bash
cp .env.example .env.local
```

- [ ] **Step 4: Create `src/firebase/client.ts`**

```ts
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app: FirebaseApp = initializeApp(config);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
```

- [ ] **Step 5: Verify build still passes**

```bash
npm test && npm run build
```
Expected: tests pass, build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add Firebase SDK and client init"
```

---

### Task 5: Add Firebase Emulator Suite + emulator hookup

**Files:**
- Create: `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`, `src/firebase/emulator.ts`
- Modify: `src/firebase/client.ts`

- [ ] **Step 1: Install Firebase CLI globally (one-time)**

```bash
npm install -g firebase-tools
firebase --version
```
Expected: prints version. If not signed in, run `firebase login` (interactive — engineer does this manually).

- [ ] **Step 2: Create `firebase.json`**

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "hosting": { "port": 5000 },
    "ui": { "enabled": true, "port": 4000 },
    "singleProjectMode": true
  }
}
```

- [ ] **Step 3: Create `.firebaserc`**

```json
{ "projects": { "default": "vamos-kaduregel" } }
```
(Project ID will be the actual one from Firebase console; this placeholder is replaced when the engineer runs `firebase use --add` after creating the project.)

- [ ] **Step 4: Create initial `firestore.rules` (deny-all stub — strengthened in Phase 8)**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Step 5: Create `firestore.indexes.json`**

```json
{ "indexes": [], "fieldOverrides": [] }
```

- [ ] **Step 6: Create `src/firebase/emulator.ts`**

```ts
import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { auth, db } from "./client";

let connected = false;

export function connectEmulatorsOnce() {
  if (connected) return;
  connected = true;
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
}
```

- [ ] **Step 7: Wire emulator connect into `client.ts`**

Append to `src/firebase/client.ts`:
```ts
if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true") {
  // dynamic import keeps emulator code out of the production bundle
  import("./emulator").then(({ connectEmulatorsOnce }) => connectEmulatorsOnce());
}
```

- [ ] **Step 8: Verify emulator boots**

```bash
firebase emulators:start
```
Expected: UI at `http://localhost:4000`, Auth on 9099, Firestore on 8080. Stop with Ctrl-C.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: add Firebase Emulator Suite and rules stub"
```

---

### Task 6: Add Firebase Hosting deploy script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add scripts to `package.json`**

In `scripts`:
```json
"emulators": "firebase emulators:start",
"deploy:hosting": "npm run build && firebase deploy --only hosting",
"deploy:rules": "firebase deploy --only firestore:rules"
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add deploy scripts"
```

---

### Task 7: Add ESLint + Prettier

**Files:**
- Create: `.eslintrc.cjs` (or use the Vite-generated one), `.prettierrc.json`, `.prettierignore`
- Modify: `package.json`

- [ ] **Step 1: Install**

```bash
npm install -D prettier eslint-config-prettier
```

- [ ] **Step 2: Create `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

- [ ] **Step 3: Create `.prettierignore`**

```
dist
node_modules
coverage
.firebase
```

- [ ] **Step 4: Update `.eslintrc.cjs` extends array**

Append `"prettier"` to the existing extends so ESLint doesn't fight Prettier on formatting:
```js
extends: [
  "eslint:recommended",
  "plugin:@typescript-eslint/recommended",
  "plugin:react-hooks/recommended",
  "prettier",
],
```

- [ ] **Step 5: Add scripts to `package.json`**

```json
"lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
"format": "prettier --write .",
"format:check": "prettier --check ."
```

- [ ] **Step 6: Format the codebase**

```bash
npm run format && npm run lint
```
Expected: no lint errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: add ESLint + Prettier"
```

---

## Phase 2 — Internationalization & RTL

### Task 8: Add react-i18next with he/es/en stubs

**Files:**
- Create: `src/i18n/index.ts`, `src/i18n/locales/he.json`, `src/i18n/locales/es.json`, `src/i18n/locales/en.json`, `src/constants.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install**

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

- [ ] **Step 2: Create `src/constants.ts`**

```ts
export const APP_NAME = "Vamos Kaduregel";
export const SUPPORTED_LOCALES = ["he", "es", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "he";
```

- [ ] **Step 3: Create `src/i18n/locales/he.json`**

```json
{
  "auth": { "signIn": "התחברות עם Google", "signOut": "התנתקות" },
  "common": { "loading": "טוען...", "error": "אירעה שגיאה", "cancel": "ביטול", "save": "שמירה" },
  "match": {
    "noUpcoming": "אין משחק מתוכנן",
    "open": "פתוח לרישום",
    "closed": "מלא",
    "cancelled": "בוטל",
    "openPaymentLink": "פתח קישור תשלום",
    "iPaid": "שילמתי",
    "addGuest": "הוסף אורח",
    "payForGuest": "שלם עבור אורח",
    "cancelMySpot": "ביטול ההשתתפות שלי",
    "cancelGuest": "ביטול אורח: {{name}}",
    "guestOf": "אורח של {{name}}",
    "team": "קבוצה {{n}}",
    "verified": "אומת"
  },
  "admin": {
    "createMatch": "יצירת משחק",
    "manageMatch": "ניהול משחק",
    "users": "משתמשים",
    "verifyToggle": "אומת",
    "closeMatch": "סגירת רישום",
    "reopenMatch": "פתיחה מחדש",
    "cancelMatch": "ביטול משחק",
    "fields": "מספר מגרשים",
    "price": "מחיר לשחקן",
    "paymentLink": "קישור תשלום",
    "notes": "הערות",
    "location": "מיקום"
  },
  "language": { "switcher": "שפה" }
}
```

- [ ] **Step 4: Create `src/i18n/locales/es.json`**

```json
{
  "auth": { "signIn": "Iniciar sesión con Google", "signOut": "Cerrar sesión" },
  "common": { "loading": "Cargando...", "error": "Ocurrió un error", "cancel": "Cancelar", "save": "Guardar" },
  "match": {
    "noUpcoming": "No hay partido programado",
    "open": "Inscripción abierta",
    "closed": "Completo",
    "cancelled": "Cancelado",
    "openPaymentLink": "Abrir link de pago",
    "iPaid": "Ya pagué",
    "addGuest": "Agregar invitado",
    "payForGuest": "Pagar por un invitado",
    "cancelMySpot": "Cancelar mi lugar",
    "cancelGuest": "Cancelar invitado: {{name}}",
    "guestOf": "Invitado de {{name}}",
    "team": "Equipo {{n}}",
    "verified": "Verificado"
  },
  "admin": {
    "createMatch": "Crear partido",
    "manageMatch": "Gestionar partido",
    "users": "Usuarios",
    "verifyToggle": "Verificado",
    "closeMatch": "Cerrar inscripción",
    "reopenMatch": "Reabrir",
    "cancelMatch": "Cancelar partido",
    "fields": "Cantidad de canchas",
    "price": "Precio por jugador",
    "paymentLink": "Link de pago",
    "notes": "Notas",
    "location": "Lugar"
  },
  "language": { "switcher": "Idioma" }
}
```

- [ ] **Step 5: Create `src/i18n/locales/en.json`**

```json
{
  "auth": { "signIn": "Sign in with Google", "signOut": "Sign out" },
  "common": { "loading": "Loading...", "error": "Something went wrong", "cancel": "Cancel", "save": "Save" },
  "match": {
    "noUpcoming": "No match scheduled",
    "open": "Open for sign-up",
    "closed": "Full",
    "cancelled": "Cancelled",
    "openPaymentLink": "Open payment link",
    "iPaid": "I paid",
    "addGuest": "Add a guest",
    "payForGuest": "Pay for a guest",
    "cancelMySpot": "Cancel my spot",
    "cancelGuest": "Cancel guest: {{name}}",
    "guestOf": "Guest of {{name}}",
    "team": "Team {{n}}",
    "verified": "Verified"
  },
  "admin": {
    "createMatch": "Create match",
    "manageMatch": "Manage match",
    "users": "Users",
    "verifyToggle": "Verified",
    "closeMatch": "Close sign-up",
    "reopenMatch": "Reopen",
    "cancelMatch": "Cancel match",
    "fields": "Number of fields",
    "price": "Price per player",
    "paymentLink": "Payment link",
    "notes": "Notes",
    "location": "Location"
  },
  "language": { "switcher": "Language" }
}
```

- [ ] **Step 6: Create `src/i18n/index.ts`**

```ts
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "../constants";
import he from "./locales/he.json";
import es from "./locales/es.json";
import en from "./locales/en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    resources: {
      he: { translation: he },
      es: { translation: es },
      en: { translation: en },
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
```

- [ ] **Step 7: Wire i18n into `src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 8: Use a translation in `App`**

```tsx
import { useTranslation } from "react-i18next";
import { APP_NAME } from "./constants";

export default function App() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-full items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{APP_NAME}</h1>
        <p className="mt-2 text-slate-600">{t("match.noUpcoming")}</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 9: Update `App.test.tsx` to wrap in i18n**

```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";
import "./i18n";
import { APP_NAME } from "./constants";

describe("App", () => {
  it("renders the app name", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: APP_NAME })).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: Run tests**

```bash
npm test
```
Expected: 1 passed.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add i18n with he/es/en translations"
```

---

### Task 9: Direction (RTL) handling

**Files:**
- Create: `src/i18n/direction.ts`, `src/i18n/direction.test.ts`
- Modify: `src/main.tsx`, `tailwind.config.js`

- [ ] **Step 1: Write failing test**

`src/i18n/direction.test.ts`:
```ts
import { directionFor, syncHtmlDirAndLang } from "./direction";

describe("directionFor", () => {
  it("returns rtl for he", () => expect(directionFor("he")).toBe("rtl"));
  it("returns ltr for es", () => expect(directionFor("es")).toBe("ltr"));
  it("returns ltr for en", () => expect(directionFor("en")).toBe("ltr"));
});

describe("syncHtmlDirAndLang", () => {
  it("sets dir=rtl and lang=he", () => {
    syncHtmlDirAndLang("he");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("he");
  });

  it("sets dir=ltr and lang=en", () => {
    syncHtmlDirAndLang("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
  });
});
```

- [ ] **Step 2: Run test, verify fail**

```bash
npm test src/i18n/direction.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/i18n/direction.ts`**

```ts
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
```

- [ ] **Step 4: Run test, verify pass**

```bash
npm test src/i18n/direction.test.ts
```
Expected: PASS.

- [ ] **Step 5: Sync direction at startup in `src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import i18n from "./i18n";
import { syncHtmlDirAndLang } from "./i18n/direction";
import type { Locale } from "./constants";

syncHtmlDirAndLang(i18n.resolvedLanguage as Locale);
i18n.on("languageChanged", (lng) => syncHtmlDirAndLang(lng as Locale));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 6: Verify Tailwind RTL variants are available**

Tailwind v3 supports `rtl:` / `ltr:` variants natively when `dir` is set on `<html>`. Verify by adding a temporary check in `App.tsx`:
```tsx
<p className="rtl:text-right ltr:text-left">test</p>
```
Run `npm run dev`, switch the html dir manually in DevTools, confirm alignment flips. Then revert the temporary line.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: sync html dir/lang with active locale"
```

---

### Task 10: Language switcher component

**Files:**
- Create: `src/components/LanguageSwitcher.tsx`, `src/components/LanguageSwitcher.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write failing test**

`src/components/LanguageSwitcher.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../i18n";
import i18n from "../i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("changes the active language when an option is selected", async () => {
    render(<LanguageSwitcher />);
    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "es");
    expect(i18n.language).toBe("es");
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
npm test src/components/LanguageSwitcher.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/components/LanguageSwitcher.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, type Locale } from "../constants";

const LABELS: Record<Locale, string> = { he: "עברית", es: "Español", en: "English" };

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? "he") as Locale;

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t("language.switcher")}</span>
      <select
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="rounded border border-slate-300 bg-white px-2 py-1"
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>{LABELS[loc]}</option>
        ))}
      </select>
    </label>
  );
}
```

- [ ] **Step 4: Run, verify pass**

```bash
npm test src/components/LanguageSwitcher.test.tsx
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add language switcher"
```

---

## Phase 3 — Authentication

### Task 11: Auth provider + useAuth hook

**Files:**
- Create: `src/auth/AuthProvider.tsx`, `src/auth/useAuth.ts`

- [ ] **Step 1: Create `src/auth/AuthProvider.tsx`**

```tsx
import { createContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase/client";

export type AuthState =
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "signedIn"; user: User };

export const AuthContext = createContext<AuthState>({ status: "loading" });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setState(user ? { status: "signedIn", user } : { status: "signedOut" });
    });
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
```

- [ ] **Step 2: Create `src/auth/useAuth.ts`**

```ts
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export function useAuth() {
  return useContext(AuthContext);
}
```

- [ ] **Step 3: Wire `AuthProvider` into `App.tsx`**

```tsx
import { AuthProvider } from "./auth/AuthProvider";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { APP_NAME } from "./constants";

export default function App() {
  const { t } = useTranslation();
  return (
    <AuthProvider>
      <main className="min-h-full p-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
          <LanguageSwitcher />
        </header>
        <p className="mt-8 text-center text-slate-600">{t("match.noUpcoming")}</p>
      </main>
    </AuthProvider>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm test && npm run build
```
Expected: tests pass, build OK.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add AuthProvider and useAuth hook"
```

---

### Task 12: Sign-in / sign-out actions

**Files:**
- Create: `src/auth/signIn.ts`, `src/auth/signOut.ts`

- [ ] **Step 1: Create `src/auth/signIn.ts`**

```ts
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/client";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  await signInWithPopup(auth, provider);
}
```

- [ ] **Step 2: Create `src/auth/signOut.ts`**

```ts
import { signOut as fbSignOut } from "firebase/auth";
import { auth } from "../firebase/client";

export async function signOut() {
  await fbSignOut(auth);
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Google sign-in/out actions"
```

---

### Task 13: Login page

**Files:**
- Create: `src/pages/Login.tsx`

- [ ] **Step 1: Create `src/pages/Login.tsx`**

```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signInWithGoogle } from "../auth/signIn";
import { APP_NAME } from "../constants";

export function LoginPage() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    setError(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-full items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">{APP_NAME}</h1>
        <button
          onClick={handleSignIn}
          disabled={busy}
          className="w-full rounded-md bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-50"
        >
          {t("auth.signIn")}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add login page"
```

---

### Task 14: User types + ensureUserDoc on first sign-in

**Files:**
- Create: `src/types/user.ts`, `src/auth/ensureUserDoc.ts`, `src/auth/ensureUserDoc.test.ts`
- Modify: `src/auth/AuthProvider.tsx`

- [ ] **Step 1: Create `src/types/user.ts`**

```ts
import type { Timestamp } from "firebase/firestore";
import type { Locale } from "../constants";

export type UserDoc = {
  displayName: string;
  email: string;
  photoURL: string;
  isAdmin: boolean;
  locale: Locale;
  createdAt: Timestamp;
};
```

- [ ] **Step 2: Write failing test using emulator**

This test needs the Firestore emulator running. The CI/dev workflow assumes `firebase emulators:start` is up. Add to `package.json`:
```json
"test:emu": "VITE_USE_FIREBASE_EMULATORS=true vitest run"
```

`src/auth/ensureUserDoc.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { connectEmulatorsOnce } from "../firebase/emulator";
import { db } from "../firebase/client";
import { ensureUserDoc } from "./ensureUserDoc";

connectEmulatorsOnce();

const fakeUser = {
  uid: "test-uid-1",
  displayName: "Test Player",
  email: "test@example.com",
  photoURL: "https://example.com/p.png",
} as any;

describe("ensureUserDoc", () => {
  beforeEach(async () => {
    await deleteDoc(doc(db, "users", fakeUser.uid)).catch(() => {});
  });

  it("creates a user doc when one does not exist", async () => {
    await ensureUserDoc(fakeUser, "es");
    const snap = await getDoc(doc(db, "users", fakeUser.uid));
    expect(snap.exists()).toBe(true);
    expect(snap.data()?.displayName).toBe("Test Player");
    expect(snap.data()?.locale).toBe("es");
    expect(snap.data()?.isAdmin).toBe(false);
  });

  it("does not overwrite an existing user doc", async () => {
    await ensureUserDoc(fakeUser, "es");
    await ensureUserDoc({ ...fakeUser, displayName: "Renamed" } as any, "en");
    const snap = await getDoc(doc(db, "users", fakeUser.uid));
    expect(snap.data()?.displayName).toBe("Test Player");
    expect(snap.data()?.locale).toBe("es");
  });
});
```

Note: this test requires temporarily relaxing `firestore.rules` for the `users/{uid}` path during local emulator testing. We will write production rules in Phase 8; for now, the engineer can add a wide-open rule to `firestore.rules`:

```
match /users/{uid} {
  allow read, write: if request.auth == null || request.auth.uid == uid || true;
}
```

(Yes, this is permissive — emulator only. Phase 8 replaces it.)

- [ ] **Step 3: Run, verify fail**

```bash
firebase emulators:start &
npm run test:emu src/auth/ensureUserDoc.test.ts
```
Expected: FAIL — `ensureUserDoc` not implemented.

- [ ] **Step 4: Implement `src/auth/ensureUserDoc.ts`**

```ts
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase/client";
import type { UserDoc } from "../types/user";
import type { Locale } from "../constants";

export async function ensureUserDoc(user: User, resolvedLocale: Locale): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const initial: Omit<UserDoc, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    displayName: user.displayName ?? "",
    email: user.email ?? "",
    photoURL: user.photoURL ?? "",
    isAdmin: false,
    locale: resolvedLocale,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, initial);
}
```

- [ ] **Step 5: Run, verify pass**

```bash
npm run test:emu src/auth/ensureUserDoc.test.ts
```
Expected: PASS.

- [ ] **Step 6: Wire `ensureUserDoc` into `AuthProvider`**

Update `src/auth/AuthProvider.tsx`:
```tsx
import { createContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase/client";
import { ensureUserDoc } from "./ensureUserDoc";
import i18n from "../i18n";
import type { Locale } from "../constants";

export type AuthState =
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "signedIn"; user: User };

export const AuthContext = createContext<AuthState>({ status: "loading" });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        await ensureUserDoc(user, (i18n.resolvedLanguage ?? "he") as Locale);
        setState({ status: "signedIn", user });
      } else {
        setState({ status: "signedOut" });
      }
    });
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: ensure user doc exists on first sign-in"
```

---

### Task 15: Header component (app name, language switcher, sign-out)

**Files:**
- Create: `src/components/Header.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/components/Header.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import { APP_NAME } from "../constants";
import { useAuth } from "../auth/useAuth";
import { signOut } from "../auth/signOut";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const { t } = useTranslation();
  const auth = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <h1 className="text-lg font-bold sm:text-xl">{APP_NAME}</h1>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        {auth.status === "signedIn" && (
          <button
            onClick={() => signOut()}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          >
            {t("auth.signOut")}
          </button>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Update `src/App.tsx`**

```tsx
import { AuthProvider } from "./auth/AuthProvider";
import { Header } from "./components/Header";
import { LoginPage } from "./pages/Login";
import { useAuth } from "./auth/useAuth";

function Body() {
  const auth = useAuth();
  if (auth.status === "loading") return <p className="p-4">…</p>;
  if (auth.status === "signedOut") return <LoginPage />;
  return <p className="p-4">Signed in as {auth.user.displayName}</p>;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-full flex-col">
        <Header />
        <Body />
      </div>
    </AuthProvider>
  );
}
```

- [ ] **Step 3: Manual smoke test**

```bash
firebase emulators:start &
VITE_USE_FIREBASE_EMULATORS=true npm run dev
```
Open `http://localhost:5173`. Click sign-in. The Auth emulator UI offers "Add new user" — create a fake user. Verify you land back on the app, the header shows sign-out, and a `users/{uid}` doc exists in the Firestore emulator UI (`http://localhost:4000`).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: header with sign-out and language switcher"
```

---

### Task 16: Routing + ProtectedRoute

**Files:**
- Create: `src/auth/ProtectedRoute.tsx`, `src/pages/Home.tsx`, `src/pages/NotFound.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Install router**

```bash
npm install react-router-dom@6
```

- [ ] **Step 2: Create `src/pages/Home.tsx` (placeholder)**

```tsx
import { useTranslation } from "react-i18next";
export function HomePage() {
  const { t } = useTranslation();
  return <p className="p-4 text-center text-slate-600">{t("match.noUpcoming")}</p>;
}
```

- [ ] **Step 3: Create `src/pages/NotFound.tsx`**

```tsx
export function NotFoundPage() {
  return <p className="p-4 text-center">404</p>;
}
```

- [ ] **Step 4: Create `src/auth/ProtectedRoute.tsx`**

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
  const auth = useAuth();
  if (auth.status === "loading") return <p className="p-4">…</p>;
  if (auth.status === "signedOut") return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

- [ ] **Step 5: Replace `src/App.tsx` with router**

```tsx
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { Header } from "./components/Header";
import { LoginPage } from "./pages/Login";
import { HomePage } from "./pages/Home";
import { NotFoundPage } from "./pages/NotFound";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { useAuth } from "./auth/useAuth";

function LoginGate() {
  const auth = useAuth();
  if (auth.status === "signedIn") return <Navigate to="/" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-full flex-col">
          <Header />
          <Routes>
            <Route path="/login" element={<LoginGate />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 6: Update `App.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";
import "./i18n";
import { APP_NAME } from "./constants";

describe("App", () => {
  it("renders the app name in the header", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: APP_NAME })).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run tests**

```bash
npm test
```
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add router with protected route"
```

---

## Phase 4 — Domain Types & Helpers

### Task 17: Domain types

**Files:**
- Create: `src/types/match.ts`, `src/types/participant.ts`

- [ ] **Step 1: Create `src/types/match.ts`**

```ts
import type { Timestamp } from "firebase/firestore";

export type MatchStatus = "open" | "closed" | "cancelled";

export type MatchDoc = {
  date: Timestamp;
  location: string;
  numFields: 1 | 2;
  playerLimit: number;
  pricePerPlayer: number;
  paymentLink: string;
  notes: string;
  status: MatchStatus;
  paidCount: number;
  createdBy: string;
  createdAt: Timestamp;
};

export type Match = MatchDoc & { id: string };
```

- [ ] **Step 2: Create `src/types/participant.ts`**

```ts
import type { Timestamp } from "firebase/firestore";

export type ParticipantDoc = {
  paidByUid: string;
  paidByName: string;
  isGuest: boolean;
  guestName: string | null;
  team: 1 | 2 | 3 | 4 | null;
  verified: boolean;
  verifiedBy: string | null;
  paidAt: Timestamp;
};

export type Participant = ParticipantDoc & { id: string };
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Match and Participant types"
```

---

### Task 18: Match helpers

**Files:**
- Create: `src/matches/helpers/deriveLimit.ts`, `src/matches/helpers/teamCount.ts`, `src/matches/helpers/isUpcoming.ts`, `src/matches/helpers/nextThursday.ts`, plus colocated `.test.ts` for each

- [ ] **Step 1: Write failing tests**

`src/matches/helpers/deriveLimit.test.ts`:
```ts
import { deriveLimit } from "./deriveLimit";
describe("deriveLimit", () => {
  it("12 for one field", () => expect(deriveLimit(1)).toBe(12));
  it("24 for two fields", () => expect(deriveLimit(2)).toBe(24));
});
```

`src/matches/helpers/teamCount.test.ts`:
```ts
import { teamCount } from "./teamCount";
describe("teamCount", () => {
  it("2 for one field", () => expect(teamCount(1)).toBe(2));
  it("4 for two fields", () => expect(teamCount(2)).toBe(4));
});
```

`src/matches/helpers/isUpcoming.test.ts`:
```ts
import { Timestamp } from "firebase/firestore";
import { isUpcoming } from "./isUpcoming";

describe("isUpcoming", () => {
  it("true for a future timestamp", () => {
    const future = Timestamp.fromMillis(Date.now() + 60_000);
    expect(isUpcoming(future)).toBe(true);
  });
  it("false for a past timestamp", () => {
    const past = Timestamp.fromMillis(Date.now() - 60_000);
    expect(isUpcoming(past)).toBe(false);
  });
});
```

`src/matches/helpers/nextThursday.test.ts`:
```ts
import { nextThursday } from "./nextThursday";

describe("nextThursday", () => {
  it("returns a Date that is a Thursday at 20:00 local", () => {
    const d = nextThursday(new Date("2026-05-03T10:00:00")); // a Sunday
    expect(d.getDay()).toBe(4); // Thursday
    expect(d.getHours()).toBe(20);
    expect(d.getMinutes()).toBe(0);
  });

  it("rolls to next Thursday if today is Thursday after 20:00", () => {
    const today = new Date("2026-05-07T21:00:00"); // Thursday 21:00
    const d = nextThursday(today);
    expect(d.getDay()).toBe(4);
    expect(d.getDate()).toBe(14); // next week
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
npm test src/matches/helpers
```
Expected: FAIL.

- [ ] **Step 3: Implement helpers**

`src/matches/helpers/deriveLimit.ts`:
```ts
export function deriveLimit(numFields: 1 | 2): number {
  return numFields * 12;
}
```

`src/matches/helpers/teamCount.ts`:
```ts
export function teamCount(numFields: 1 | 2): number {
  return numFields * 2;
}
```

`src/matches/helpers/isUpcoming.ts`:
```ts
import type { Timestamp } from "firebase/firestore";
export function isUpcoming(date: Timestamp): boolean {
  return date.toMillis() > Date.now();
}
```

`src/matches/helpers/nextThursday.ts`:
```ts
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
```

- [ ] **Step 4: Run, verify pass**

```bash
npm test src/matches/helpers
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add match domain helpers"
```

---

## Phase 5 — Match Read Paths (Player Views)

### Task 19: useNextMatch hook

**Files:**
- Create: `src/matches/hooks/useNextMatch.ts`, `src/matches/hooks/useNextMatch.test.tsx`

- [ ] **Step 1: Write failing test (emulator-backed)**

`src/matches/hooks/useNextMatch.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { addDoc, collection, deleteDoc, getDocs, Timestamp } from "firebase/firestore";
import { connectEmulatorsOnce } from "../../firebase/emulator";
import { db } from "../../firebase/client";
import { useNextMatch } from "./useNextMatch";

connectEmulatorsOnce();

async function clearMatches() {
  const snap = await getDocs(collection(db, "matches"));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

describe("useNextMatch", () => {
  beforeEach(clearMatches);

  it("returns null when there is no future open/closed match", async () => {
    const { result } = renderHook(() => useNextMatch());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.match).toBeNull();
  });

  it("returns the soonest non-cancelled future match", async () => {
    const future = Timestamp.fromMillis(Date.now() + 60_000);
    const fartherFuture = Timestamp.fromMillis(Date.now() + 120_000);
    await addDoc(collection(db, "matches"), {
      date: fartherFuture, location: "B", numFields: 1, playerLimit: 12,
      pricePerPlayer: 50, paymentLink: "x", notes: "", status: "open",
      paidCount: 0, createdBy: "u1", createdAt: Timestamp.now(),
    });
    await addDoc(collection(db, "matches"), {
      date: future, location: "A", numFields: 1, playerLimit: 12,
      pricePerPlayer: 50, paymentLink: "x", notes: "", status: "open",
      paidCount: 0, createdBy: "u1", createdAt: Timestamp.now(),
    });
    const { result } = renderHook(() => useNextMatch());
    await waitFor(() => expect(result.current.match?.location).toBe("A"));
  });
});
```

Note: emulator rules need to permit reads on `matches`. For now keep the permissive rule from Task 14 (Phase 8 tightens this).

- [ ] **Step 2: Run, verify fail**

```bash
npm run test:emu src/matches/hooks/useNextMatch.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/matches/hooks/useNextMatch.ts`**

```ts
import { useEffect, useState } from "react";
import {
  collection, limit, onSnapshot, orderBy, query, Timestamp, where,
} from "firebase/firestore";
import { db } from "../../firebase/client";
import type { Match, MatchDoc } from "../../types/match";

export type UseNextMatchResult = { loading: boolean; match: Match | null };

export function useNextMatch(): UseNextMatchResult {
  const [state, setState] = useState<UseNextMatchResult>({ loading: true, match: null });

  useEffect(() => {
    const q = query(
      collection(db, "matches"),
      where("date", ">", Timestamp.now()),
      where("status", "in", ["open", "closed"]),
      orderBy("date", "asc"),
      limit(1),
    );
    return onSnapshot(q, (snap) => {
      const first = snap.docs[0];
      setState({
        loading: false,
        match: first ? ({ id: first.id, ...(first.data() as MatchDoc) }) : null,
      });
    });
  }, []);

  return state;
}
```

- [ ] **Step 4: Run, verify pass**

```bash
npm run test:emu src/matches/hooks/useNextMatch.test.tsx
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add useNextMatch hook"
```

---

### Task 20: useParticipants hook

**Files:**
- Create: `src/matches/hooks/useParticipants.ts`

- [ ] **Step 1: Implement (no separate test — covered by integration test in Task 27)**

```ts
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { Participant, ParticipantDoc } from "../../types/participant";

export type UseParticipantsResult = { loading: boolean; participants: Participant[] };

export function useParticipants(matchId: string | null): UseParticipantsResult {
  const [state, setState] = useState<UseParticipantsResult>({ loading: true, participants: [] });

  useEffect(() => {
    if (!matchId) {
      setState({ loading: false, participants: [] });
      return;
    }
    const q = query(collection(db, "matches", matchId, "participants"), orderBy("paidAt", "asc"));
    return onSnapshot(q, (snap) => {
      setState({
        loading: false,
        participants: snap.docs.map((d) => ({ id: d.id, ...(d.data() as ParticipantDoc) })),
      });
    });
  }, [matchId]);

  return state;
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add useParticipants hook"
```

---

### Task 21: Wire HomePage to next match (read-only view)

**Files:**
- Create: `src/components/MatchInfo.tsx`
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Create `src/components/MatchInfo.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import type { Match } from "../types/match";

export function MatchInfo({ match }: { match: Match }) {
  const { t, i18n } = useTranslation();
  const dateFmt = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <section className="rounded-lg bg-white p-4 shadow">
      <p className="text-lg font-semibold">{dateFmt.format(match.date.toDate())}</p>
      <p className="mt-1 text-slate-700">{match.location}</p>
      <p className="mt-1 text-slate-500">
        {match.pricePerPlayer} · {match.paidCount} / {match.playerLimit}
      </p>
      <p className="mt-2 text-sm">{t(`match.${match.status}`)}</p>
      {match.notes && <p className="mt-3 text-sm text-slate-600">{match.notes}</p>}
    </section>
  );
}
```

- [ ] **Step 2: Update `src/pages/Home.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import { useNextMatch } from "../matches/hooks/useNextMatch";
import { MatchInfo } from "../components/MatchInfo";

export function HomePage() {
  const { t } = useTranslation();
  const { loading, match } = useNextMatch();

  if (loading) return <p className="p-4">{t("common.loading")}</p>;
  if (!match) return <p className="p-4 text-center text-slate-600">{t("match.noUpcoming")}</p>;

  return (
    <main className="mx-auto max-w-2xl p-4">
      <MatchInfo match={match} />
    </main>
  );
}
```

- [ ] **Step 3: Manual smoke test**

Start emulators + dev. Add a match doc through the Firestore emulator UI (`/matches/abc` with the required fields). Confirm the home page shows it.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: home page shows next match"
```

---

### Task 22: Past matches list + detail

**Files:**
- Create: `src/matches/hooks/usePastMatches.ts`, `src/matches/hooks/useMatch.ts`, `src/pages/PastMatches.tsx`, `src/pages/PastMatchDetail.tsx`
- Modify: `src/App.tsx` (add routes)

- [ ] **Step 1: Create `src/matches/hooks/usePastMatches.ts`**

```ts
import { useEffect, useState } from "react";
import {
  collection, onSnapshot, orderBy, query, Timestamp, where, limit,
} from "firebase/firestore";
import { db } from "../../firebase/client";
import type { Match, MatchDoc } from "../../types/match";

export function usePastMatches(maxItems = 50) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "matches"),
      where("date", "<=", Timestamp.now()),
      orderBy("date", "desc"),
      limit(maxItems),
    );
    return onSnapshot(q, (snap) => {
      setMatches(snap.docs.map((d) => ({ id: d.id, ...(d.data() as MatchDoc) })));
      setLoading(false);
    });
  }, [maxItems]);

  return { loading, matches };
}
```

- [ ] **Step 2: Create `src/matches/hooks/useMatch.ts`**

```ts
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { Match, MatchDoc } from "../../types/match";

export function useMatch(matchId: string | null) {
  const [state, setState] = useState<{ loading: boolean; match: Match | null }>({
    loading: true, match: null,
  });
  useEffect(() => {
    if (!matchId) { setState({ loading: false, match: null }); return; }
    return onSnapshot(doc(db, "matches", matchId), (snap) => {
      setState({
        loading: false,
        match: snap.exists() ? ({ id: snap.id, ...(snap.data() as MatchDoc) }) : null,
      });
    });
  }, [matchId]);
  return state;
}
```

- [ ] **Step 3: Create `src/pages/PastMatches.tsx`**

```tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePastMatches } from "../matches/hooks/usePastMatches";

export function PastMatchesPage() {
  const { t, i18n } = useTranslation();
  const { loading, matches } = usePastMatches();
  const fmt = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium" });

  if (loading) return <p className="p-4">{t("common.loading")}</p>;

  return (
    <main className="mx-auto max-w-2xl space-y-2 p-4">
      {matches.map((m) => (
        <Link
          key={m.id}
          to={`/past/${m.id}`}
          className="block rounded-lg bg-white p-3 shadow hover:bg-slate-50"
        >
          <p className="font-medium">{fmt.format(m.date.toDate())}</p>
          <p className="text-sm text-slate-500">{m.location}</p>
        </Link>
      ))}
    </main>
  );
}
```

- [ ] **Step 4: Create `src/pages/PastMatchDetail.tsx`**

```tsx
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMatch } from "../matches/hooks/useMatch";
import { useParticipants } from "../matches/hooks/useParticipants";
import { MatchInfo } from "../components/MatchInfo";

export function PastMatchDetailPage() {
  const { id = null } = useParams();
  const { t } = useTranslation();
  const { loading, match } = useMatch(id);
  const { participants } = useParticipants(id);

  if (loading) return <p className="p-4">{t("common.loading")}</p>;
  if (!match) return <p className="p-4">404</p>;

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <MatchInfo match={match} />
      <ul className="space-y-1">
        {participants.map((p) => (
          <li key={p.id} className="rounded bg-white p-2 shadow-sm">
            {p.isGuest ? `${p.guestName} (${t("match.guestOf", { name: p.paidByName })})` : p.paidByName}
            {p.team && <span className="ms-2 text-sm text-slate-500">· {t("match.team", { n: p.team })}</span>}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 5: Add routes to `src/App.tsx`**

Inside the `<Route element={<ProtectedRoute />}>`:
```tsx
import { PastMatchesPage } from "./pages/PastMatches";
import { PastMatchDetailPage } from "./pages/PastMatchDetail";

<Route path="/past" element={<PastMatchesPage />} />
<Route path="/past/:id" element={<PastMatchDetailPage />} />
```

Also add a nav link in `Header.tsx`:
```tsx
import { Link } from "react-router-dom";
{auth.status === "signedIn" && (
  <Link to="/past" className="text-sm text-slate-600">…</Link>
)}
```
Use translation key — add `"nav.past"` to all three locale files (`he: "משחקים קודמים"`, `es: "Partidos anteriores"`, `en: "Past matches"`).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: past matches list and detail"
```

---

## Phase 6 — Match Write Paths (Players)

### Task 23: joinMatch transaction (self only)

**Files:**
- Create: `src/matches/api/joinMatch.ts`, `src/matches/api/joinMatch.test.ts`

- [ ] **Step 1: Write failing test**

`src/matches/api/joinMatch.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, Timestamp } from "firebase/firestore";
import { connectEmulatorsOnce } from "../../firebase/emulator";
import { db } from "../../firebase/client";
import { joinMatch } from "./joinMatch";

connectEmulatorsOnce();

async function clearMatches() {
  const snap = await getDocs(collection(db, "matches"));
  for (const d of snap.docs) {
    const parts = await getDocs(collection(d.ref, "participants"));
    for (const p of parts.docs) await deleteDoc(p.ref);
    await deleteDoc(d.ref);
  }
}

const baseMatch = (overrides: Partial<any> = {}) => ({
  date: Timestamp.fromMillis(Date.now() + 60_000),
  location: "Field A",
  numFields: 1 as const,
  playerLimit: 12,
  pricePerPlayer: 50,
  paymentLink: "https://pay/x",
  notes: "",
  status: "open" as const,
  paidCount: 0,
  createdBy: "admin",
  createdAt: Timestamp.now(),
  ...overrides,
});

describe("joinMatch (self only)", () => {
  beforeEach(clearMatches);

  it("creates a self participant doc and increments paidCount", async () => {
    const ref = await addDoc(collection(db, "matches"), baseMatch());
    await joinMatch({
      matchId: ref.id,
      uid: "u1",
      name: "Alice",
      isAdmin: false,
    });
    const updated = (await getDoc(ref)).data();
    expect(updated?.paidCount).toBe(1);
    const part = (await getDoc(doc(db, "matches", ref.id, "participants", "u1"))).data();
    expect(part?.paidByUid).toBe("u1");
    expect(part?.isGuest).toBe(false);
    expect(part?.verified).toBe(false);
  });

  it("auto-verifies admin self-entries", async () => {
    const ref = await addDoc(collection(db, "matches"), baseMatch());
    await joinMatch({ matchId: ref.id, uid: "admin1", name: "A", isAdmin: true });
    const part = (await getDoc(doc(db, "matches", ref.id, "participants", "admin1"))).data();
    expect(part?.verified).toBe(true);
    expect(part?.verifiedBy).toBe("admin1");
  });

  it("flips status to closed when limit hit", async () => {
    const ref = await addDoc(collection(db, "matches"), baseMatch({ playerLimit: 2, paidCount: 1 }));
    // pre-existing other participant
    const { setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "matches", ref.id, "participants", "other"), {
      paidByUid: "other", paidByName: "O", isGuest: false, guestName: null,
      team: null, verified: false, verifiedBy: null, paidAt: Timestamp.now(),
    });
    await joinMatch({ matchId: ref.id, uid: "u2", name: "Bob", isAdmin: false });
    const updated = (await getDoc(ref)).data();
    expect(updated?.paidCount).toBe(2);
    expect(updated?.status).toBe("closed");
  });

  it("rejects when match is full", async () => {
    const ref = await addDoc(collection(db, "matches"), baseMatch({
      playerLimit: 1, paidCount: 1, status: "closed",
    }));
    await expect(
      joinMatch({ matchId: ref.id, uid: "u3", name: "C", isAdmin: false }),
    ).rejects.toThrow(/full|closed/i);
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
npm run test:emu src/matches/api/joinMatch.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/matches/api/joinMatch.ts`**

```ts
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { MatchDoc } from "../../types/match";
import type { ParticipantDoc } from "../../types/participant";

export type JoinMatchInput = {
  matchId: string;
  uid: string;
  name: string;
  isAdmin: boolean;
};

export async function joinMatch(input: JoinMatchInput): Promise<void> {
  const matchRef = doc(db, "matches", input.matchId);
  const partRef = doc(db, "matches", input.matchId, "participants", input.uid);

  await runTransaction(db, async (tx) => {
    const matchSnap = await tx.get(matchRef);
    if (!matchSnap.exists()) throw new Error("Match not found");
    const match = matchSnap.data() as MatchDoc;

    if (match.status !== "open") throw new Error("Match is not open");
    if (match.paidCount + 1 > match.playerLimit) throw new Error("Match is full");

    const existing = await tx.get(partRef);
    if (existing.exists()) throw new Error("You already paid");

    const participant: ParticipantDoc = {
      paidByUid: input.uid,
      paidByName: input.name,
      isGuest: false,
      guestName: null,
      team: null,
      verified: input.isAdmin,
      verifiedBy: input.isAdmin ? input.uid : null,
      paidAt: serverTimestamp() as any,
    };
    tx.set(partRef, participant);

    const newCount = match.paidCount + 1;
    const updates: Partial<MatchDoc> = { paidCount: newCount };
    if (newCount === match.playerLimit) updates.status = "closed";
    tx.update(matchRef, updates);
  });
}
```

- [ ] **Step 4: Run, verify pass**

```bash
npm run test:emu src/matches/api/joinMatch.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: joinMatch transaction (self only)"
```

---

### Task 24: joinMatch with guest (self + guest)

**Files:**
- Modify: `src/matches/api/joinMatch.ts`, `src/matches/api/joinMatch.test.ts`

- [ ] **Step 1: Add failing test for guest case**

Append to `joinMatch.test.ts`:
```ts
describe("joinMatch with guest", () => {
  beforeEach(clearMatches);

  it("creates self + guest, +2 to count", async () => {
    const ref = await addDoc(collection(db, "matches"), baseMatch());
    await joinMatch({
      matchId: ref.id, uid: "u1", name: "Alice", isAdmin: false, guestName: "Mr Guest",
    });
    const updated = (await getDoc(ref)).data();
    expect(updated?.paidCount).toBe(2);

    const parts = await getDocs(collection(db, "matches", ref.id, "participants"));
    const guests = parts.docs.filter((d) => d.data().isGuest);
    expect(guests).toHaveLength(1);
    expect(guests[0].data().guestName).toBe("Mr Guest");
    expect(guests[0].data().paidByUid).toBe("u1");
  });

  it("rejects when only 1 slot remains and a guest is requested", async () => {
    const ref = await addDoc(collection(db, "matches"), baseMatch({
      playerLimit: 12, paidCount: 11,
    }));
    await expect(
      joinMatch({ matchId: ref.id, uid: "u1", name: "A", isAdmin: false, guestName: "G" }),
    ).rejects.toThrow(/full/i);
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
npm run test:emu src/matches/api/joinMatch.test.ts
```
Expected: 2 failures.

- [ ] **Step 3: Update `src/matches/api/joinMatch.ts`**

```ts
import { doc, runTransaction, serverTimestamp, collection } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { MatchDoc } from "../../types/match";
import type { ParticipantDoc } from "../../types/participant";

export type JoinMatchInput = {
  matchId: string;
  uid: string;
  name: string;
  isAdmin: boolean;
  guestName?: string;
};

export async function joinMatch(input: JoinMatchInput): Promise<void> {
  const matchRef = doc(db, "matches", input.matchId);
  const partRef = doc(db, "matches", input.matchId, "participants", input.uid);
  const wantGuest = !!input.guestName?.trim();
  const guestRef = wantGuest ? doc(collection(db, "matches", input.matchId, "participants")) : null;

  await runTransaction(db, async (tx) => {
    const matchSnap = await tx.get(matchRef);
    if (!matchSnap.exists()) throw new Error("Match not found");
    const match = matchSnap.data() as MatchDoc;

    if (match.status !== "open") throw new Error("Match is not open");
    const slots = wantGuest ? 2 : 1;
    if (match.paidCount + slots > match.playerLimit) throw new Error("Match is full");

    const existing = await tx.get(partRef);
    if (existing.exists()) throw new Error("You already paid");

    const self: ParticipantDoc = {
      paidByUid: input.uid,
      paidByName: input.name,
      isGuest: false,
      guestName: null,
      team: null,
      verified: input.isAdmin,
      verifiedBy: input.isAdmin ? input.uid : null,
      paidAt: serverTimestamp() as any,
    };
    tx.set(partRef, self);

    if (guestRef && wantGuest) {
      const guest: ParticipantDoc = {
        paidByUid: input.uid,
        paidByName: input.name,
        isGuest: true,
        guestName: input.guestName!.trim(),
        team: null,
        verified: input.isAdmin,
        verifiedBy: input.isAdmin ? input.uid : null,
        paidAt: serverTimestamp() as any,
      };
      tx.set(guestRef, guest);
    }

    const newCount = match.paidCount + slots;
    const updates: Partial<MatchDoc> = { paidCount: newCount };
    if (newCount === match.playerLimit) updates.status = "closed";
    tx.update(matchRef, updates);
  });
}
```

- [ ] **Step 4: Run, verify pass**

```bash
npm run test:emu src/matches/api/joinMatch.test.ts
```
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: joinMatch supports paying for a guest"
```

---

### Task 25: addGuest (after self-pay)

**Files:**
- Create: `src/matches/api/addGuest.ts`, `src/matches/api/addGuest.test.ts`

- [ ] **Step 1: Write failing test**

`src/matches/api/addGuest.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, Timestamp, setDoc } from "firebase/firestore";
import { connectEmulatorsOnce } from "../../firebase/emulator";
import { db } from "../../firebase/client";
import { addGuest } from "./addGuest";

connectEmulatorsOnce();

async function clearMatches() {
  const snap = await getDocs(collection(db, "matches"));
  for (const d of snap.docs) {
    const parts = await getDocs(collection(d.ref, "participants"));
    for (const p of parts.docs) await deleteDoc(p.ref);
    await deleteDoc(d.ref);
  }
}

describe("addGuest", () => {
  beforeEach(clearMatches);

  it("adds one guest, +1 to count", async () => {
    const ref = await addDoc(collection(db, "matches"), {
      date: Timestamp.fromMillis(Date.now() + 60_000), location: "X",
      numFields: 1, playerLimit: 12, pricePerPlayer: 0, paymentLink: "",
      notes: "", status: "open", paidCount: 1, createdBy: "a", createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, "matches", ref.id, "participants", "u1"), {
      paidByUid: "u1", paidByName: "Alice", isGuest: false, guestName: null,
      team: null, verified: false, verifiedBy: null, paidAt: Timestamp.now(),
    });
    await addGuest({
      matchId: ref.id, uid: "u1", name: "Alice", guestName: "Bob", isAdmin: false,
    });
    const updated = (await getDoc(ref)).data();
    expect(updated?.paidCount).toBe(2);
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
npm run test:emu src/matches/api/addGuest.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/matches/api/addGuest.ts`**

```ts
import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { MatchDoc } from "../../types/match";
import type { ParticipantDoc } from "../../types/participant";

export type AddGuestInput = {
  matchId: string;
  uid: string;
  name: string;
  guestName: string;
  isAdmin: boolean;
};

export async function addGuest(input: AddGuestInput): Promise<void> {
  if (!input.guestName.trim()) throw new Error("Guest name is required");
  const matchRef = doc(db, "matches", input.matchId);
  const guestRef = doc(collection(db, "matches", input.matchId, "participants"));

  await runTransaction(db, async (tx) => {
    const matchSnap = await tx.get(matchRef);
    if (!matchSnap.exists()) throw new Error("Match not found");
    const match = matchSnap.data() as MatchDoc;

    if (match.status !== "open") throw new Error("Match is not open");
    if (match.paidCount + 1 > match.playerLimit) throw new Error("Match is full");

    const guest: ParticipantDoc = {
      paidByUid: input.uid,
      paidByName: input.name,
      isGuest: true,
      guestName: input.guestName.trim(),
      team: null,
      verified: input.isAdmin,
      verifiedBy: input.isAdmin ? input.uid : null,
      paidAt: serverTimestamp() as any,
    };
    tx.set(guestRef, guest);

    const newCount = match.paidCount + 1;
    const updates: Partial<MatchDoc> = { paidCount: newCount };
    if (newCount === match.playerLimit) updates.status = "closed";
    tx.update(matchRef, updates);
  });
}
```

- [ ] **Step 4: Run, verify pass**

```bash
npm run test:emu src/matches/api/addGuest.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: addGuest transaction"
```

---

### Task 26: cancelParticipant transaction (with reopen logic)

**Files:**
- Create: `src/matches/api/cancelParticipant.ts`, `src/matches/api/cancelParticipant.test.ts`

- [ ] **Step 1: Write failing test**

`src/matches/api/cancelParticipant.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, Timestamp } from "firebase/firestore";
import { connectEmulatorsOnce } from "../../firebase/emulator";
import { db } from "../../firebase/client";
import { cancelParticipant } from "./cancelParticipant";

connectEmulatorsOnce();

async function clearMatches() {
  const snap = await getDocs(collection(db, "matches"));
  for (const d of snap.docs) {
    const parts = await getDocs(collection(d.ref, "participants"));
    for (const p of parts.docs) await deleteDoc(p.ref);
    await deleteDoc(d.ref);
  }
}

describe("cancelParticipant", () => {
  beforeEach(clearMatches);

  it("removes participant and decrements count", async () => {
    const ref = await addDoc(collection(db, "matches"), {
      date: Timestamp.fromMillis(Date.now() + 60_000), location: "X",
      numFields: 1, playerLimit: 12, pricePerPlayer: 0, paymentLink: "",
      notes: "", status: "open", paidCount: 1, createdBy: "a", createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, "matches", ref.id, "participants", "u1"), {
      paidByUid: "u1", paidByName: "Alice", isGuest: false, guestName: null,
      team: null, verified: false, verifiedBy: null, paidAt: Timestamp.now(),
    });
    await cancelParticipant({ matchId: ref.id, participantId: "u1" });
    const updated = (await getDoc(ref)).data();
    expect(updated?.paidCount).toBe(0);
    expect((await getDoc(doc(db, "matches", ref.id, "participants", "u1"))).exists()).toBe(false);
  });

  it("reopens a closed match when a slot frees", async () => {
    const ref = await addDoc(collection(db, "matches"), {
      date: Timestamp.fromMillis(Date.now() + 60_000), location: "X",
      numFields: 1, playerLimit: 1, pricePerPlayer: 0, paymentLink: "",
      notes: "", status: "closed", paidCount: 1, createdBy: "a", createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, "matches", ref.id, "participants", "u1"), {
      paidByUid: "u1", paidByName: "Alice", isGuest: false, guestName: null,
      team: null, verified: false, verifiedBy: null, paidAt: Timestamp.now(),
    });
    await cancelParticipant({ matchId: ref.id, participantId: "u1" });
    const updated = (await getDoc(ref)).data();
    expect(updated?.status).toBe("open");
    expect(updated?.paidCount).toBe(0);
  });
});
```

- [ ] **Step 2: Run, verify fail**

```bash
npm run test:emu src/matches/api/cancelParticipant.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement `src/matches/api/cancelParticipant.ts`**

```ts
import { doc, runTransaction } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { MatchDoc } from "../../types/match";

export type CancelInput = { matchId: string; participantId: string };

export async function cancelParticipant({ matchId, participantId }: CancelInput): Promise<void> {
  const matchRef = doc(db, "matches", matchId);
  const partRef = doc(db, "matches", matchId, "participants", participantId);

  await runTransaction(db, async (tx) => {
    const matchSnap = await tx.get(matchRef);
    if (!matchSnap.exists()) throw new Error("Match not found");
    const match = matchSnap.data() as MatchDoc;
    const partSnap = await tx.get(partRef);
    if (!partSnap.exists()) return;

    tx.delete(partRef);
    const newCount = Math.max(0, match.paidCount - 1);
    const updates: Partial<MatchDoc> = { paidCount: newCount };
    if (match.status === "closed" && newCount < match.playerLimit) updates.status = "open";
    tx.update(matchRef, updates);
  });
}
```

- [ ] **Step 4: Run, verify pass**

```bash
npm run test:emu src/matches/api/cancelParticipant.test.ts
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: cancelParticipant transaction with reopen"
```

---

### Task 27: RosterList + ParticipantRow

**Files:**
- Create: `src/components/RosterList.tsx`, `src/components/ParticipantRow.tsx`

- [ ] **Step 1: Create `src/components/ParticipantRow.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import type { Participant } from "../types/participant";

export type ParticipantRowProps = {
  participant: Participant;
  canCancel: boolean;
  onCancel?: () => void;
};

export function ParticipantRow({ participant: p, canCancel, onCancel }: ParticipantRowProps) {
  const { t } = useTranslation();
  const label = p.isGuest
    ? `${p.guestName} (${t("match.guestOf", { name: p.paidByName })})`
    : p.paidByName;

  return (
    <li className="flex items-center justify-between rounded bg-white p-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {p.verified && <span aria-label={t("match.verified")} className="text-emerald-600">✓</span>}
        {p.team && <span className="text-sm text-slate-500">· {t("match.team", { n: p.team })}</span>}
      </div>
      {canCancel && onCancel && (
        <button onClick={onCancel} className="text-sm text-red-600">
          {p.isGuest ? t("match.cancelGuest", { name: p.guestName }) : t("match.cancelMySpot")}
        </button>
      )}
    </li>
  );
}
```

- [ ] **Step 2: Create `src/components/RosterList.tsx`**

```tsx
import type { Participant } from "../types/participant";
import { ParticipantRow } from "./ParticipantRow";
import { cancelParticipant } from "../matches/api/cancelParticipant";
import { isUpcoming } from "../matches/helpers/isUpcoming";
import type { Match } from "../types/match";

export function RosterList({
  match, participants, currentUid, isAdmin,
}: {
  match: Match;
  participants: Participant[];
  currentUid: string;
  isAdmin: boolean;
}) {
  const editable = isUpcoming(match.date) && match.status !== "cancelled";
  return (
    <ul className="space-y-1">
      {participants.map((p) => {
        const ownsRow = p.paidByUid === currentUid;
        const canCancel = editable && (isAdmin || ownsRow);
        return (
          <ParticipantRow
            key={p.id}
            participant={p}
            canCancel={canCancel}
            onCancel={canCancel ? () => cancelParticipant({ matchId: match.id, participantId: p.id }) : undefined}
          />
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: roster list with cancel buttons"
```

---

### Task 28: PayButtons + GuestNameModal + Home wiring

**Files:**
- Create: `src/components/BottomSheet.tsx`, `src/components/GuestNameModal.tsx`, `src/components/PayButtons.tsx`
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Create `src/components/BottomSheet.tsx`**

```tsx
import { useEffect, type ReactNode } from "react";

export function BottomSheet({
  open, onClose, children,
}: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-t-xl bg-white p-4 shadow-xl sm:rounded-xl">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/GuestNameModal.tsx`**

```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BottomSheet } from "./BottomSheet";

export function GuestNameModal({
  open, onSubmit, onCancel,
}: {
  open: boolean;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  return (
    <BottomSheet open={open} onClose={onCancel}>
      <h2 className="mb-3 text-lg font-semibold">{t("match.addGuest")}</h2>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded border border-slate-300 p-2"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-2">{t("common.cancel")}</button>
        <button
          disabled={!name.trim()}
          onClick={() => { onSubmit(name.trim()); setName(""); }}
          className="rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
        >
          {t("common.save")}
        </button>
      </div>
    </BottomSheet>
  );
}
```

- [ ] **Step 3: Create `src/components/PayButtons.tsx`**

```tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { joinMatch } from "../matches/api/joinMatch";
import { addGuest } from "../matches/api/addGuest";
import type { Match } from "../types/match";
import { GuestNameModal } from "./GuestNameModal";

export function PayButtons({
  match, currentUid, currentName, isAdmin, hasSelfEntry,
}: {
  match: Match;
  currentUid: string;
  currentName: string;
  isAdmin: boolean;
  hasSelfEntry: boolean;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<"none" | "selfPlusGuest" | "guestOnly">("none");
  const [error, setError] = useState<string | null>(null);
  const disabled = busy || match.status !== "open";

  async function selfOnly() {
    setError(null); setBusy(true);
    try {
      await joinMatch({ matchId: match.id, uid: currentUid, name: currentName, isAdmin });
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function selfPlusGuest(guestName: string) {
    setError(null); setBusy(true); setModal("none");
    try {
      await joinMatch({
        matchId: match.id, uid: currentUid, name: currentName, isAdmin, guestName,
      });
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function guestOnly(guestName: string) {
    setError(null); setBusy(true); setModal("none");
    try {
      await addGuest({
        matchId: match.id, uid: currentUid, name: currentName, isAdmin, guestName,
      });
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-3">
      <a
        href={match.paymentLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded bg-blue-600 px-4 py-3 text-center font-medium text-white"
      >
        {t("match.openPaymentLink")}
      </a>
      {!hasSelfEntry && (
        <>
          <button
            disabled={disabled}
            onClick={selfOnly}
            className="w-full rounded bg-emerald-600 px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            {t("match.iPaid")}
          </button>
          <button
            disabled={disabled}
            onClick={() => setModal("selfPlusGuest")}
            className="w-full rounded border border-emerald-600 px-4 py-3 font-medium text-emerald-700 disabled:opacity-50"
          >
            {t("match.payForGuest")}
          </button>
        </>
      )}
      {hasSelfEntry && (
        <button
          disabled={disabled}
          onClick={() => setModal("guestOnly")}
          className="w-full rounded border border-slate-400 px-4 py-3 font-medium disabled:opacity-50"
        >
          {t("match.addGuest")}
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <GuestNameModal
        open={modal === "selfPlusGuest"}
        onSubmit={selfPlusGuest}
        onCancel={() => setModal("none")}
      />
      <GuestNameModal
        open={modal === "guestOnly"}
        onSubmit={guestOnly}
        onCancel={() => setModal("none")}
      />
    </div>
  );
}
```

- [ ] **Step 4: Update `src/pages/Home.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import { useNextMatch } from "../matches/hooks/useNextMatch";
import { useParticipants } from "../matches/hooks/useParticipants";
import { useAuth } from "../auth/useAuth";
import { useIsAdmin } from "../admin/useIsAdmin";
import { MatchInfo } from "../components/MatchInfo";
import { PayButtons } from "../components/PayButtons";
import { RosterList } from "../components/RosterList";

export function HomePage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const isAdmin = useIsAdmin();
  const { loading, match } = useNextMatch();
  const { participants } = useParticipants(match?.id ?? null);

  if (loading) return <p className="p-4">{t("common.loading")}</p>;
  if (!match) return <p className="p-4 text-center text-slate-600">{t("match.noUpcoming")}</p>;
  if (auth.status !== "signedIn") return null;

  const uid = auth.user.uid;
  const name = auth.user.displayName ?? auth.user.email ?? "";
  const hasSelfEntry = participants.some((p) => p.paidByUid === uid && !p.isGuest);

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <MatchInfo match={match} />
      <PayButtons
        match={match}
        currentUid={uid}
        currentName={name}
        isAdmin={isAdmin}
        hasSelfEntry={hasSelfEntry}
      />
      <RosterList match={match} participants={participants} currentUid={uid} isAdmin={isAdmin} />
    </main>
  );
}
```

- [ ] **Step 5: Create `src/admin/useIsAdmin.ts`**

```ts
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/client";
import { useAuth } from "../auth/useAuth";

export function useIsAdmin(): boolean {
  const auth = useAuth();
  const uid = auth.status === "signedIn" ? auth.user.uid : null;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!uid) { setIsAdmin(false); return; }
    return onSnapshot(doc(db, "users", uid), (snap) => {
      setIsAdmin(snap.exists() && !!snap.data()?.isAdmin);
    });
  }, [uid]);

  return isAdmin;
}
```

- [ ] **Step 6: Manual smoke test**

Start emulators + dev. Sign in as a test user. Verify:
- Cannot see admin features.
- Click "I paid" → roster shows your name.
- Click "Add a guest" → enter name → roster shows guest of you.
- Click "Cancel my spot" → both your entry and your guest still listed (guest has its own cancel button).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: home page pay/cancel/guest flow"
```

---

## Phase 7 — Admin Features

### Task 29: AdminRoute guard

**Files:**
- Create: `src/admin/AdminRoute.tsx`

- [ ] **Step 1: Create `src/admin/AdminRoute.tsx`**

```tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useIsAdmin } from "./useIsAdmin";

export function AdminRoute() {
  const auth = useAuth();
  const isAdmin = useIsAdmin();
  if (auth.status === "loading") return <p className="p-4">…</p>;
  if (auth.status === "signedOut") return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: admin route guard"
```

---

### Task 30: createMatch action + form

**Files:**
- Create: `src/matches/api/createMatch.ts`, `src/pages/admin/CreateMatch.tsx`
- Modify: `src/App.tsx` (add route), `src/components/Header.tsx` (admin nav links)

- [ ] **Step 1: Create `src/matches/api/createMatch.ts`**

```ts
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { MatchDoc } from "../../types/match";
import { deriveLimit } from "../helpers/deriveLimit";

export type CreateMatchInput = {
  date: Date;
  location: string;
  numFields: 1 | 2;
  pricePerPlayer: number;
  paymentLink: string;
  notes: string;
  createdBy: string;
};

export async function createMatch(input: CreateMatchInput): Promise<string> {
  const doc: Omit<MatchDoc, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    date: Timestamp.fromDate(input.date),
    location: input.location,
    numFields: input.numFields,
    playerLimit: deriveLimit(input.numFields),
    pricePerPlayer: input.pricePerPlayer,
    paymentLink: input.paymentLink,
    notes: input.notes,
    status: "open",
    paidCount: 0,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "matches"), doc as any);
  return ref.id;
}
```

- [ ] **Step 2: Create `src/pages/admin/CreateMatch.tsx`**

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/useAuth";
import { createMatch } from "../../matches/api/createMatch";
import { nextThursday } from "../../matches/helpers/nextThursday";

function defaultDateISO() {
  const d = nextThursday();
  // datetime-local input format: YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T20:00`;
}

export function CreateMatchPage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(defaultDateISO());
  const [location, setLocation] = useState("");
  const [numFields, setNumFields] = useState<1 | 2>(2);
  const [price, setPrice] = useState(0);
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (auth.status !== "signedIn") return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      const id = await createMatch({
        date: new Date(date),
        location,
        numFields,
        pricePerPlayer: price,
        paymentLink: link,
        notes,
        createdBy: auth.user.uid,
      });
      navigate(`/admin/match/${id}`);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <main className="mx-auto max-w-md space-y-3 p-4">
      <h2 className="text-xl font-bold">{t("admin.createMatch")}</h2>
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="text-sm">{t("admin.location")}</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            required className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block">
          <span className="text-sm">Date</span>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}
            required className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block">
          <span className="text-sm">{t("admin.fields")}</span>
          <select value={numFields} onChange={(e) => setNumFields(Number(e.target.value) as 1 | 2)}
            className="mt-1 w-full rounded border p-2">
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm">{t("admin.price")}</span>
          <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))}
            required className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block">
          <span className="text-sm">{t("admin.paymentLink")}</span>
          <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
            required className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block">
          <span className="text-sm">{t("admin.notes")}</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded border p-2" />
        </label>
        <button disabled={busy} className="w-full rounded bg-slate-900 p-3 text-white disabled:opacity-50">
          {t("common.save")}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Add route to `src/App.tsx`**

Inside the protected branch, add:
```tsx
import { AdminRoute } from "./admin/AdminRoute";
import { CreateMatchPage } from "./pages/admin/CreateMatch";

<Route element={<AdminRoute />}>
  <Route path="/admin/create" element={<CreateMatchPage />} />
</Route>
```

- [ ] **Step 4: Add admin nav links in `Header.tsx`**

```tsx
import { Link } from "react-router-dom";
import { useIsAdmin } from "../admin/useIsAdmin";

const isAdmin = useIsAdmin();
{isAdmin && <Link to="/admin/create" className="text-sm">{t("admin.createMatch")}</Link>}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: create match admin form"
```

---

### Task 31: ManageMatch — verify toggle

**Files:**
- Create: `src/matches/api/verifyParticipant.ts`, `src/pages/admin/ManageMatch.tsx`
- Modify: `src/App.tsx` (add route)

- [ ] **Step 1: Create `src/matches/api/verifyParticipant.ts`**

```ts
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/client";

export async function verifyParticipant(args: {
  matchId: string;
  participantId: string;
  verified: boolean;
  byUid: string;
}) {
  await updateDoc(doc(db, "matches", args.matchId, "participants", args.participantId), {
    verified: args.verified,
    verifiedBy: args.verified ? args.byUid : null,
  });
}
```

- [ ] **Step 2: Create `src/pages/admin/ManageMatch.tsx` (initial version: verify + cancel)**

```tsx
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMatch } from "../../matches/hooks/useMatch";
import { useParticipants } from "../../matches/hooks/useParticipants";
import { MatchInfo } from "../../components/MatchInfo";
import { verifyParticipant } from "../../matches/api/verifyParticipant";
import { cancelParticipant } from "../../matches/api/cancelParticipant";
import { useAuth } from "../../auth/useAuth";

export function ManageMatchPage() {
  const { id = null } = useParams();
  const { t } = useTranslation();
  const auth = useAuth();
  const { loading, match } = useMatch(id);
  const { participants } = useParticipants(id);

  if (loading) return <p className="p-4">{t("common.loading")}</p>;
  if (!match || auth.status !== "signedIn") return <p className="p-4">404</p>;
  const uid = auth.user.uid;

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <MatchInfo match={match} />
      <ul className="space-y-1">
        {participants.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded bg-white p-2 shadow-sm">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={p.verified}
                onChange={(e) =>
                  verifyParticipant({
                    matchId: match.id, participantId: p.id, verified: e.target.checked, byUid: uid,
                  })
                }
              />
              <span>{p.isGuest ? `${p.guestName} (${t("match.guestOf", { name: p.paidByName })})` : p.paidByName}</span>
            </div>
            <button
              className="text-sm text-red-600"
              onClick={() => cancelParticipant({ matchId: match.id, participantId: p.id })}
            >
              {t("common.cancel")}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 3: Add route to `src/App.tsx`**

Inside `AdminRoute`:
```tsx
import { ManageMatchPage } from "./pages/admin/ManageMatch";
<Route path="/admin/match/:id" element={<ManageMatchPage />} />
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: admin verify + cancel"
```

---

### Task 32: ManageMatch — team assignment

**Files:**
- Create: `src/matches/api/assignTeam.ts`
- Modify: `src/pages/admin/ManageMatch.tsx`

- [ ] **Step 1: Create `src/matches/api/assignTeam.ts`**

```ts
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/client";

export async function assignTeam(args: {
  matchId: string;
  participantId: string;
  team: 1 | 2 | 3 | 4 | null;
}) {
  await updateDoc(doc(db, "matches", args.matchId, "participants", args.participantId), {
    team: args.team,
  });
}
```

- [ ] **Step 2: Add team select to each row in `ManageMatchPage`**

In the participant `<li>`, add a select:
```tsx
import { teamCount } from "../../matches/helpers/teamCount";
import { assignTeam } from "../../matches/api/assignTeam";

const teams = teamCount(match.numFields);
const teamOptions = Array.from({ length: teams }, (_, i) => i + 1);

<select
  value={p.team ?? ""}
  onChange={(e) => assignTeam({
    matchId: match.id, participantId: p.id,
    team: e.target.value === "" ? null : (Number(e.target.value) as 1 | 2 | 3 | 4),
  })}
  className="rounded border p-1 text-sm"
>
  <option value="">—</option>
  {teamOptions.map((n) => <option key={n} value={n}>{n}</option>)}
</select>
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: admin team assignment"
```

---

### Task 33: ManageMatch — close/reopen/cancel/edit

**Files:**
- Create: `src/matches/api/setMatchStatus.ts`, `src/matches/api/updateMatch.ts`
- Modify: `src/pages/admin/ManageMatch.tsx`

- [ ] **Step 1: Create `src/matches/api/setMatchStatus.ts`**

```ts
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/client";
import type { MatchStatus } from "../../types/match";

export async function setMatchStatus(matchId: string, status: MatchStatus): Promise<void> {
  await updateDoc(doc(db, "matches", matchId), { status });
}
```

- [ ] **Step 2: Create `src/matches/api/updateMatch.ts`**

```ts
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/client";
import { deriveLimit } from "../helpers/deriveLimit";

export type UpdateMatchInput = {
  matchId: string;
  patch: Partial<{
    date: Date;
    location: string;
    numFields: 1 | 2;
    pricePerPlayer: number;
    paymentLink: string;
    notes: string;
  }>;
};

export async function updateMatch({ matchId, patch }: UpdateMatchInput): Promise<void> {
  const updates: Record<string, unknown> = { ...patch };
  if (patch.date) updates.date = Timestamp.fromDate(patch.date);
  if (patch.numFields !== undefined) updates.playerLimit = deriveLimit(patch.numFields);
  await updateDoc(doc(db, "matches", matchId), updates);
}
```

- [ ] **Step 3: Add control buttons to `ManageMatchPage`**

Above the participant list:
```tsx
import { setMatchStatus } from "../../matches/api/setMatchStatus";

<div className="flex flex-wrap gap-2">
  {match.status === "open" && (
    <button onClick={() => setMatchStatus(match.id, "closed")}
      className="rounded border px-3 py-1 text-sm">{t("admin.closeMatch")}</button>
  )}
  {match.status === "closed" && (
    <button onClick={() => setMatchStatus(match.id, "open")}
      className="rounded border px-3 py-1 text-sm">{t("admin.reopenMatch")}</button>
  )}
  {match.status !== "cancelled" && (
    <button onClick={() => setMatchStatus(match.id, "cancelled")}
      className="rounded border border-red-400 px-3 py-1 text-sm text-red-700">{t("admin.cancelMatch")}</button>
  )}
</div>
```

- [ ] **Step 4: Add an Edit panel to `ManageMatchPage`**

Above the participant list, add a collapsible form that calls `updateMatch`:

```tsx
import { useState } from "react";
import { updateMatch } from "../../matches/api/updateMatch";

function EditPanel({ match }: { match: import("../../types/match").Match }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pad = (n: number) => String(n).padStart(2, "0");
  const d = match.date.toDate();
  const initialDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const [date, setDate] = useState(initialDate);
  const [location, setLocation] = useState(match.location);
  const [numFields, setNumFields] = useState<1 | 2>(match.numFields);
  const [price, setPrice] = useState(match.pricePerPlayer);
  const [link, setLink] = useState(match.paymentLink);
  const [notes, setNotes] = useState(match.notes);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded border px-3 py-1 text-sm">
        {t("common.save")}
      </button>
    );
  }

  async function save() {
    setBusy(true); setError(null);
    try {
      await updateMatch({
        matchId: match.id,
        patch: {
          date: new Date(date), location, numFields,
          pricePerPlayer: price, paymentLink: link, notes,
        },
      });
      setOpen(false);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-2 rounded border bg-white p-3">
      <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded border p-2" />
      <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded border p-2" />
      <select value={numFields} onChange={(e) => setNumFields(Number(e.target.value) as 1 | 2)} className="w-full rounded border p-2">
        <option value={1}>1</option><option value={2}>2</option>
      </select>
      <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full rounded border p-2" />
      <input type="url" value={link} onChange={(e) => setLink(e.target.value)} className="w-full rounded border p-2" />
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded border p-2" />
      <div className="flex gap-2">
        <button disabled={busy} onClick={save} className="rounded bg-slate-900 px-3 py-1 text-white">{t("common.save")}</button>
        <button onClick={() => setOpen(false)} className="px-3 py-1">{t("common.cancel")}</button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

Render `<EditPanel match={match} />` near the status buttons.

Note on `numFields` change: `updateMatch` recalculates `playerLimit`. If the new limit is **less than** current `paidCount`, an admin should know and decide — for v1, keep this as a manual concern (the rules don't block it). Document this gotcha in the README in Task 40.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: admin close/reopen/cancel/edit match"
```

---

### Task 34: Users list + admin toggle

**Files:**
- Create: `src/pages/admin/UsersList.tsx`
- Modify: `src/App.tsx` (add route)

- [ ] **Step 1: Create `src/pages/admin/UsersList.tsx`**

```tsx
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { db } from "../../firebase/client";

type Row = { id: string; displayName: string; email: string; isAdmin: boolean };

export function UsersListPage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(
    () =>
      onSnapshot(collection(db, "users"), (snap) =>
        setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Row, "id">) }))),
      ),
    [],
  );

  async function toggle(uid: string, current: boolean) {
    await updateDoc(doc(db, "users", uid), { isAdmin: !current });
  }

  return (
    <main className="mx-auto max-w-xl space-y-2 p-4">
      <h2 className="text-xl font-bold">{t("admin.users")}</h2>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded bg-white p-2 shadow-sm">
            <div>
              <p className="font-medium">{r.displayName}</p>
              <p className="text-xs text-slate-500">{r.email}</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={r.isAdmin} onChange={() => toggle(r.id, r.isAdmin)} />
              admin
            </label>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Add route inside `AdminRoute`**

```tsx
import { UsersListPage } from "./pages/admin/UsersList";
<Route path="/admin/users" element={<UsersListPage />} />
```

- [ ] **Step 3: Add header link**

In `Header.tsx`, alongside the create-match link:
```tsx
{isAdmin && <Link to="/admin/users" className="text-sm">{t("admin.users")}</Link>}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: users list with admin toggle"
```

---

## Phase 8 — Production Security Rules

### Task 35: Firestore rules — users

**Files:**
- Modify: `firestore.rules`
- Create: `tests/rules/firestore.rules.test.ts`

- [ ] **Step 1: Install rules-testing dep**

```bash
npm install -D @firebase/rules-unit-testing
```

- [ ] **Step 2: Replace `firestore.rules` with v1 production rules**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() {
      return isSignedIn() &&
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // ----- users -----
    match /users/{uid} {
      allow read: if isSignedIn();

      // Self-create on first sign-in: must be initialized with isAdmin=false.
      allow create: if isSignedIn() && request.auth.uid == uid
        && request.resource.data.isAdmin == false;

      // Self-update locale only.
      allow update: if isSignedIn() && request.auth.uid == uid
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['locale']);

      // Admin can change isAdmin (and other admin-managed fields).
      allow update: if isAdmin();

      allow delete: if false;
    }

    // ----- matches (rules added in Task 36) -----
    // ----- participants (rules added in Task 37) -----
  }
}
```

- [ ] **Step 3: Write rules test for users**

`tests/rules/firestore.rules.test.ts`:
```ts
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import fs from "fs";
import path from "path";
import { describe, it, beforeAll, afterAll, beforeEach } from "vitest";

let env: Awaited<ReturnType<typeof initializeTestEnvironment>>;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "rules-test",
    firestore: {
      rules: fs.readFileSync(path.resolve(__dirname, "../../firestore.rules"), "utf8"),
      host: "localhost",
      port: 8080,
    },
  });
});

afterAll(async () => env.cleanup());
beforeEach(async () => env.clearFirestore());

describe("users rules", () => {
  it("allows self-create with isAdmin=false", async () => {
    const ctx = env.authenticatedContext("u1");
    await assertSucceeds(
      ctx.firestore().collection("users").doc("u1").set({
        displayName: "A", email: "a@b.c", photoURL: "", isAdmin: false, locale: "he",
      }),
    );
  });

  it("blocks self-create with isAdmin=true", async () => {
    const ctx = env.authenticatedContext("u1");
    await assertFails(
      ctx.firestore().collection("users").doc("u1").set({
        displayName: "A", email: "a@b.c", photoURL: "", isAdmin: true, locale: "he",
      }),
    );
  });

  it("allows self-update of locale only", async () => {
    await env.withSecurityRulesDisabled(async (c) =>
      c.firestore().collection("users").doc("u1").set({
        displayName: "A", email: "a@b.c", photoURL: "", isAdmin: false, locale: "he",
      }),
    );
    const ctx = env.authenticatedContext("u1");
    await assertSucceeds(ctx.firestore().collection("users").doc("u1").update({ locale: "en" }));
    await assertFails(ctx.firestore().collection("users").doc("u1").update({ isAdmin: true }));
  });

  it("admin can toggle isAdmin on others", async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await c.firestore().collection("users").doc("admin1").set({ isAdmin: true });
      await c.firestore().collection("users").doc("u2").set({ isAdmin: false });
    });
    const adminCtx = env.authenticatedContext("admin1");
    await assertSucceeds(adminCtx.firestore().collection("users").doc("u2").update({ isAdmin: true }));
  });
});
```

- [ ] **Step 4: Run with emulator running**

```bash
firebase emulators:start &
npm test tests/rules/firestore.rules.test.ts
```
Expected: all assertions pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(rules): production users rules"
```

---

### Task 36: Firestore rules — matches

**Files:**
- Modify: `firestore.rules`
- Modify: `tests/rules/firestore.rules.test.ts`

- [ ] **Step 1: Add rules block for matches**

Inside the `match /databases/{database}/documents {` block, after users:
```
match /matches/{matchId} {
  allow read: if isSignedIn();
  allow create, update, delete: if isAdmin();
}
```

- [ ] **Step 2: Add tests**

Append to the rules test file:
```ts
describe("matches rules", () => {
  it("any signed-in user can read matches", async () => {
    await env.withSecurityRulesDisabled(async (c) =>
      c.firestore().collection("matches").doc("m1").set({ status: "open" }),
    );
    const ctx = env.authenticatedContext("u1");
    await assertSucceeds(ctx.firestore().collection("matches").doc("m1").get());
  });

  it("non-admins cannot create matches", async () => {
    const ctx = env.authenticatedContext("u1");
    await env.withSecurityRulesDisabled(async (c) =>
      c.firestore().collection("users").doc("u1").set({ isAdmin: false }),
    );
    await assertFails(ctx.firestore().collection("matches").doc("m1").set({ status: "open" }));
  });

  it("admin can create matches", async () => {
    await env.withSecurityRulesDisabled(async (c) =>
      c.firestore().collection("users").doc("admin1").set({ isAdmin: true }),
    );
    const ctx = env.authenticatedContext("admin1");
    await assertSucceeds(ctx.firestore().collection("matches").doc("m1").set({ status: "open" }));
  });
});
```

- [ ] **Step 3: Run, verify pass**

```bash
npm test tests/rules/firestore.rules.test.ts
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(rules): matches rules"
```

---

### Task 37: Firestore rules — participants

**Files:**
- Modify: `firestore.rules`
- Modify: `tests/rules/firestore.rules.test.ts`

- [ ] **Step 1: Add rules for participants**

Inside the matches block, nest:
```
match /matches/{matchId}/participants/{partId} {
  allow read: if isSignedIn();

  // Self self-entry: doc id must equal uid, isGuest must be false, paidByUid must equal uid
  allow create: if isSignedIn()
    && request.resource.data.paidByUid == request.auth.uid
    && (
      // self-entry case
      (request.resource.data.isGuest == false && partId == request.auth.uid) ||
      // guest case
      (request.resource.data.isGuest == true && request.resource.data.guestName is string
        && request.resource.data.guestName.size() > 0)
    )
    || isAdmin();

  // Cancel: own self-entry, own guest entry, or admin
  allow delete: if isSignedIn()
    && (resource.data.paidByUid == request.auth.uid || isAdmin());

  // Updates (verify, team) — admin only
  allow update: if isAdmin();
}
```

- [ ] **Step 2: Add tests**

Append:
```ts
describe("participants rules", () => {
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await c.firestore().collection("matches").doc("m1").set({ status: "open" });
      await c.firestore().collection("users").doc("admin1").set({ isAdmin: true });
      await c.firestore().collection("users").doc("u1").set({ isAdmin: false });
    });
  });

  it("user can create their own self-entry at doc id == uid", async () => {
    const ctx = env.authenticatedContext("u1");
    await assertSucceeds(
      ctx.firestore().collection("matches").doc("m1").collection("participants").doc("u1").set({
        paidByUid: "u1", paidByName: "U", isGuest: false, guestName: null,
        team: null, verified: false, verifiedBy: null, paidAt: new Date(),
      }),
    );
  });

  it("user cannot create a self-entry at someone else's uid", async () => {
    const ctx = env.authenticatedContext("u1");
    await assertFails(
      ctx.firestore().collection("matches").doc("m1").collection("participants").doc("other").set({
        paidByUid: "u1", paidByName: "U", isGuest: false, guestName: null,
        team: null, verified: false, verifiedBy: null, paidAt: new Date(),
      }),
    );
  });

  it("user can create a guest entry", async () => {
    const ctx = env.authenticatedContext("u1");
    await assertSucceeds(
      ctx.firestore().collection("matches").doc("m1").collection("participants").doc("g1").set({
        paidByUid: "u1", paidByName: "U", isGuest: true, guestName: "Bob",
        team: null, verified: false, verifiedBy: null, paidAt: new Date(),
      }),
    );
  });

  it("user can delete their own entry, not someone else's", async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await c.firestore().doc("matches/m1/participants/u1").set({ paidByUid: "u1" });
      await c.firestore().doc("matches/m1/participants/u2").set({ paidByUid: "u2" });
    });
    const ctx = env.authenticatedContext("u1");
    await assertSucceeds(ctx.firestore().doc("matches/m1/participants/u1").delete());
    await assertFails(ctx.firestore().doc("matches/m1/participants/u2").delete());
  });

  it("admin can delete anyone", async () => {
    await env.withSecurityRulesDisabled(async (c) => {
      await c.firestore().doc("matches/m1/participants/u9").set({ paidByUid: "u9" });
    });
    const ctx = env.authenticatedContext("admin1");
    await assertSucceeds(ctx.firestore().doc("matches/m1/participants/u9").delete());
  });

  it("only admins can verify (update)", async () => {
    await env.withSecurityRulesDisabled(async (c) =>
      c.firestore().doc("matches/m1/participants/u1").set({ paidByUid: "u1", verified: false }),
    );
    const userCtx = env.authenticatedContext("u1");
    const adminCtx = env.authenticatedContext("admin1");
    await assertFails(userCtx.firestore().doc("matches/m1/participants/u1").update({ verified: true }));
    await assertSucceeds(adminCtx.firestore().doc("matches/m1/participants/u1").update({ verified: true }));
  });
});
```

- [ ] **Step 3: Run, verify pass**

```bash
npm test tests/rules/firestore.rules.test.ts
```
Expected: PASS.

- [ ] **Step 4: Note about transactions**

Important: the join transaction also writes to `matches/{id}` (incrementing `paidCount`). Since the matches rules require admin for any write, **non-admin players cannot run joinMatch as written**. We need to relax matches.update specifically for the count-and-status maintenance fields. Add to the matches block:

```
match /matches/{matchId} {
  allow read: if isSignedIn();
  allow create, delete: if isAdmin();
  // Admin can update anything; signed-in users can only adjust paidCount/status
  // as part of their own join/cancel transaction.
  allow update: if isAdmin() || (
    isSignedIn() &&
    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['paidCount', 'status']) &&
    // Status, if it changes, must remain consistent with the count and limit
    (
      (request.resource.data.status == 'open' && request.resource.data.paidCount < resource.data.playerLimit) ||
      (request.resource.data.status == 'closed' && request.resource.data.paidCount == resource.data.playerLimit) ||
      request.resource.data.status == resource.data.status
    )
  );
}
```

Update tests for matches block to cover: a regular user can `update` only `paidCount`/`status` and only when consistent.

- [ ] **Step 5: Run, verify pass**

```bash
npm test tests/rules/firestore.rules.test.ts
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(rules): participants rules + matches transactional updates"
```

---

### Task 38: End-to-end emulator smoke test of full flow

**Files:**
- Create: `tests/e2e/joinFlow.test.ts`

- [ ] **Step 1: Write test that exercises the actual security rules + transactions**

`tests/e2e/joinFlow.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { addDoc, collection, doc, getDoc, runTransaction, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import fs from "fs";
import path from "path";

let env: Awaited<ReturnType<typeof initializeTestEnvironment>>;

beforeEach(async () => {
  env = await initializeTestEnvironment({
    projectId: "e2e-join",
    firestore: {
      rules: fs.readFileSync(path.resolve(__dirname, "../../firestore.rules"), "utf8"),
      host: "localhost", port: 8080,
    },
  });
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    await c.firestore().collection("users").doc("u1").set({ isAdmin: false });
    await c.firestore().collection("matches").doc("m1").set({
      date: Timestamp.fromMillis(Date.now() + 60_000),
      location: "X", numFields: 1, playerLimit: 12,
      pricePerPlayer: 0, paymentLink: "", notes: "",
      status: "open", paidCount: 0, createdBy: "admin1", createdAt: Timestamp.now(),
    });
  });
});

describe("e2e: regular user can join via transaction", () => {
  it("creates participant and increments count under rules", async () => {
    const u1 = env.authenticatedContext("u1");
    await runTransaction(u1.firestore() as any, async (tx) => {
      const matchSnap = await tx.get(doc(u1.firestore() as any, "matches/m1"));
      const data: any = matchSnap.data();
      tx.set(doc(u1.firestore() as any, "matches/m1/participants/u1"), {
        paidByUid: "u1", paidByName: "U", isGuest: false, guestName: null,
        team: null, verified: false, verifiedBy: null, paidAt: serverTimestamp(),
      });
      tx.update(doc(u1.firestore() as any, "matches/m1"), { paidCount: data.paidCount + 1 });
    });
    const after = await env.withSecurityRulesDisabled(async (c) =>
      (await c.firestore().doc("matches/m1").get()).data(),
    );
    expect(after?.paidCount).toBe(1);
  });
});
```

- [ ] **Step 2: Run, verify pass**

```bash
npm test tests/e2e/joinFlow.test.ts
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test(e2e): join flow under production rules"
```

---

## Phase 9 — Deploy & Ship

### Task 39: Production Firebase project setup

This task is mostly **manual** (Firebase console). Document each step in the README in Task 40.

- [ ] **Step 1: Create the Firebase project (manual)**

In the Firebase console:
1. New project → name `vamos-kaduregel` (or similar)
2. Disable Google Analytics (optional, free tier-friendly)
3. Build → Authentication → Sign-in method → enable Google
4. Build → Firestore Database → Create → Native mode → pick region (e.g. `eur3`)
5. Build → Hosting → Get started

- [ ] **Step 2: Wire local repo to the project**

```bash
firebase login
firebase use --add
# Select the project, alias "default"
```

- [ ] **Step 3: Copy the web app config into `.env.local`**

In Firebase console → Project settings → General → Your apps → Web app (create if needed) → Config. Paste each `apiKey`, `authDomain`, etc. into `.env.local`.

- [ ] **Step 4: Deploy rules**

```bash
npm run deploy:rules
```
Expected: success.

- [ ] **Step 5: Bootstrap the first admin**

In the Firebase console → Firestore Database → users collection → find your user doc → set `isAdmin: true`.

- [ ] **Step 6: Deploy hosting**

```bash
npm run deploy:hosting
```
Expected: deploy URL printed. Open it, sign in, verify you can create a match.

- [ ] **Step 7: Add the deploy URL to repo settings (manual on GitHub)**

In the repo's About section, paste the live URL.

(No commit for this task — all changes were manual / external.)

---

### Task 40: README with setup + run + deploy instructions

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Vamos Kaduregel

Web app for organizing weekly Thursday soccer games for our friends group.
Players sign in with Google, mark themselves as paid via an external payment
link, and admins manage matches and team assignment.

## Stack

- React 18 + Vite + TypeScript + Tailwind
- Firebase (Auth, Firestore, Hosting) — Spark (free) tier
- react-i18next (Hebrew default, Spanish, English; RTL for Hebrew)
- Vitest + React Testing Library + Firebase Emulator Suite

## First-time setup

1. Install Node 20+ and pnpm or npm.
2. Install Firebase CLI: `npm i -g firebase-tools`.
3. Create a Firebase project and a Web App in the Firebase console.
4. Enable Google sign-in (Authentication → Sign-in method).
5. Enable Firestore Database (Native mode).
6. `cp .env.example .env.local` and paste the web app config values.
7. `firebase login && firebase use --add` to point this repo at the project.
8. `npm install`

## Local development

```bash
# Terminal 1
firebase emulators:start

# Terminal 2
VITE_USE_FIREBASE_EMULATORS=true npm run dev
```

The app is at http://localhost:5173. Emulator UI at http://localhost:4000.

## Tests

```bash
npm test                      # unit + component tests (no emulator)
npm run test:emu              # tests that require Firestore emulator (run emulator first)
```

## Deploy

```bash
npm run deploy:rules          # Firestore security rules only
npm run deploy:hosting        # build + deploy frontend
```

## Bootstrapping the first admin

After your first sign-in creates a `users/{yourUid}` doc, edit it in the
Firestore console and set `isAdmin: true`. From then on, admins manage admins
in-app at `/admin/users`.

## Locales

`he` (default, RTL), `es`, `en`. The active locale is detected from the user
profile, then the browser, then defaults to `he`. Switch in the header.

## Gotchas

- **Reducing `numFields` on a match that already has more participants than the
  new limit allows is not blocked by the app.** The match will end up
  "overbooked" relative to its limit. If you reduce fields, manually cancel
  participants first.
- **Refunds are not tracked in the app.** When an admin cancels a participant,
  reconciliation happens out-of-band in the payment app.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: project README"
```

---

## Spec Coverage Map (self-review)

| Spec section | Implemented in |
|---|---|
| Stack & cost | Tasks 1–6 |
| Roles | Task 14 (user doc), Task 27/29 (isAdmin checks) |
| `users/{uid}` | Task 14, Task 35 (rules) |
| `matches/{matchId}` | Task 17 (type), Task 30 (create), Task 33 (status/edit) |
| `matches/.../participants/{id}` | Task 17, Tasks 23–26 |
| Race-safe joining | Tasks 23, 24, 25 |
| Race-safe cancelling | Task 26 |
| Cancellation rules | Task 26 (transaction), Task 27 (UI permissions), Task 37 (rules) |
| Security rules | Tasks 35–37 |
| i18n | Tasks 8–10 |
| RTL | Task 9 |
| Responsive design | Task 28 (BottomSheet), Tailwind across all components |
| Player UX (login/home/pay/cancel/past) | Tasks 13, 16, 21, 22, 27, 28 |
| Admin UX (create/manage/verify/teams/users) | Tasks 30–34 |
| Out-of-band setup | Task 39 (Firebase console), Task 40 (README) |

No placeholders. No "TBD" or "TODO" left in steps. Type signatures and method names are consistent across tasks (`joinMatch`, `addGuest`, `cancelParticipant`, `verifyParticipant`, `assignTeam`, `setMatchStatus`, `updateMatch`, `createMatch`).

---

## Future work (post-v1, not in this plan)

- Real payment integration (Stripe/PIX → Cloud Functions on Blaze with free quota)
- Push or email notifications when a match is created or a slot frees
- Player stats / attendance history
- Editing existing guest entries (today: cancel + re-add)
- Time-zone-aware match time
- E2E browser tests (Playwright)
