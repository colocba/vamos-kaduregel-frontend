# Vamos Kaduregel

Web app for organizing weekly Thursday soccer games for our friends group.
Players sign in with Google, mark themselves as paid via an external payment
link, and admins manage matches and team assignment.

## Stack

- React + Vite + TypeScript + Tailwind CSS
- Firebase (Auth, Firestore, Hosting) — Spark (free) tier
- react-i18next (Hebrew default with RTL, Spanish, English)
- Vitest + React Testing Library + Firebase Emulator Suite

## First-time setup

1. Install Node 20+ and npm.
2. Install Firebase CLI: `npm install -g firebase-tools`.
3. Create a Firebase project in the Firebase console.
4. Add a Web App to the project (Project settings → General → Your apps).
5. Enable Google sign-in: Authentication → Sign-in method → Google.
6. Create the Firestore database: Build → Firestore Database → Native mode.
7. Copy `.env.example` to `.env.local` and paste the web app config values.
8. Point this repo at the project: `firebase login && firebase use --add`.
9. `npm install`

## Local development

The app runs against the Firebase Emulator Suite for local development. The
emulators (Auth + Firestore) require Java to be installed (`brew install
openjdk` on macOS).

```bash
# Terminal 1
firebase emulators:start

# Terminal 2
VITE_USE_FIREBASE_EMULATORS=true npm run dev
```

The app is at <http://localhost:5173>. Emulator UI at <http://localhost:4000>.

To exercise the app end-to-end without seeding manually, use the Auth
emulator UI to add a fake user, then sign in with that user in the app.

## Tests

```bash
npm test                # unit + component tests (no emulator required)
npm run test:emu        # all tests including emulator-backed ones
                        # (must have firebase emulators:start running)
```

Note: emulator-backed tests are gated on `VITE_USE_FIREBASE_EMULATORS=true`.
Under regular `npm test` they skip silently. CI must run `npm run test:emu`
against a live emulator to actually exercise transaction and rules logic.

## Deploy

```bash
npm run deploy:rules    # Firestore security rules only
npm run deploy:hosting  # build + deploy frontend to Firebase Hosting
```

## Bootstrapping the first admin

After your first sign-in creates a `users/{yourUid}` doc, edit it in the
Firestore console and set `isAdmin: true`. From then on, admins manage
admins in-app at `/admin/users`.

## Locales

`he` (default, RTL), `es`, `en`. The active locale is detected from the user
profile, then the browser, then defaults to `he`. Switch via the language
picker in the header.

## Gotchas

- **Reducing `numFields` on a match that already has more participants
  than the new limit allows is not blocked by the app.** The match will end
  up "overbooked" relative to its limit. If you reduce fields, manually
  cancel participants first.
- **Refunds are not tracked in the app.** When an admin cancels a
  participant, money reconciliation happens out-of-band in the payment
  app.

## Project structure

```
src/
├── auth/            # AuthProvider, useAuth, sign-in/out, ProtectedRoute, ensureUserDoc
├── admin/           # useIsAdmin, AdminRoute
├── components/      # Header, MatchInfo, RosterList, PayButtons, GuestNameModal, BottomSheet, LanguageSwitcher
├── firebase/        # client, emulator hookup
├── i18n/            # i18next init, direction helpers, locales/{he,es,en}.json
├── matches/
│   ├── api/         # createMatch, joinMatch, addGuest, cancelParticipant, verifyParticipant, assignTeam, setMatchStatus, updateMatch
│   ├── helpers/     # deriveLimit, teamCount, isUpcoming, nextThursday
│   └── hooks/       # useNextMatch, useMatch, usePastMatches, useParticipants
├── pages/           # Login, Home, PastMatches, PastMatchDetail, NotFound, admin/*
├── types/           # user, match, participant
└── test/            # Vitest setup
tests/
├── rules/           # Firestore security rules tests
└── e2e/             # End-to-end transaction tests under production rules
```
