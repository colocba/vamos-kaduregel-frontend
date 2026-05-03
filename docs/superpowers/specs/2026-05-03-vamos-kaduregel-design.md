# Vamos Kaduregel — Design Spec

**Date:** 2026-05-03
**Status:** Draft (awaiting user review)

## Summary

A mobile- and desktop-friendly web app for a friends group that plays soccer every Thursday at 20:00. Admins create a match each week, players pay via an external payment link and self-mark themselves as paid in the app to claim a roster slot. Admins verify out-of-band that money arrived, then assign players to teams. The app must be free to operate, support Hebrew (default, RTL), Spanish, and English, and handle concurrent payments without overbooking.

## Goals (v1)

- Centralize the weekly subscription flow that today happens ad-hoc on WhatsApp
- Show a live, trustworthy list of who has paid for the upcoming match
- Let admins manage matches (create, verify payments, assign teams, cancel) without leaving the app
- Run on Firebase free (Spark) tier — no recurring cost

## Non-goals (v1)

- Real payment integration (Stripe/PIX/MercadoPago webhook). Payment happens externally; the app is a tracker.
- In-app refund tracking. Admins handle refunds out-of-band in the payment app.
- Push or email notifications. Reactive in-app UI only.
- Player stats or historical aggregations across matches.
- Auto-translation of user-entered free text (location names, notes, guest names render as typed in any locale).
- Editing an existing guest entry (cancel and re-add instead).

## Stack

- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS (mobile-first, native RTL support via `rtl:` variants)
- **i18n:** `react-i18next`
- **Auth:** Firebase Authentication, Google provider only
- **Database:** Cloud Firestore
- **Hosting:** Firebase Hosting
- **No backend / no Cloud Functions** — all logic runs client-side, secured by Firestore Security Rules. This keeps the project on the Spark free tier.
- **Repo layout:** single repository (no separate backend repo).

## Roles

- **Player** — anyone who logs in via Google. Default role.
- **Admin** — a player with `isAdmin: true` on their user doc. Admins are players too; their self-payments auto-verify. The first admin is bootstrapped manually in the Firebase console; subsequent admins are toggled by existing admins from the in-app users list.

## Data model (Firestore)

### `users/{uid}`

- `displayName: string`
- `email: string`
- `photoURL: string`
- `isAdmin: boolean` (default `false`)
- `locale: "he" | "es" | "en"` (defaults to browser language → falls back to `he`)
- `createdAt: timestamp`

User docs are created on first sign-in if missing.

### `matches/{matchId}`

- `date: timestamp` — Thursday at 20:00 local time (admin picks the date; time is fixed)
- `location: string`
- `numFields: 1 | 2`
- `playerLimit: number` — derived: `numFields * 12`
- `pricePerPlayer: number`
- `paymentLink: string` — single shared URL for all players in this match
- `notes: string`
- `status: "open" | "closed" | "cancelled"`
  - `open` — accepting payments
  - `closed` — auto-flipped when `paidCount === playerLimit`; can flip back to `open` if a participant cancels
  - `cancelled` — admin cancelled the whole match
- `paidCount: number` — denormalized count of participant docs, used inside transactions for atomic limit checks
- `createdBy: uid`
- `createdAt: timestamp`

### `matches/{matchId}/participants/{participantId}`

One doc = one roster slot.

- `paidByUid: string` — the user who paid
- `paidByName: string` — denormalized for display (so a roster row renders without a second read)
- `isGuest: boolean`
- `guestName: string | null` — only set when `isGuest === true`
- `team: 1 | 2 | 3 | 4 | null` — admin-assigned (1–2 if `numFields === 1`, 1–4 if `numFields === 2`)
- `verified: boolean` — admin confirmed payment landed; auto-`true` for entries created by an admin
- `verifiedBy: uid | null`
- `paidAt: timestamp`

**Document ID convention:**

- Self-entries (where `paidByUid === auth.uid` and `isGuest === false`): doc ID = the user's uid. This makes "you can't pay for yourself twice" a structural guarantee.
- Guest entries: auto-generated ID.

## Race-safe transactions

All roster mutations run inside Firestore transactions so concurrent users serialize correctly.

### Joining (self-pay or self+guest)

1. Read `matches/{matchId}`.
2. Abort if `status !== "open"`.
3. Compute `slotsBeingClaimed` (1 for self-only, 2 for self+guest).
4. Abort if `paidCount + slotsBeingClaimed > playerLimit`.
5. Create participant doc(s).
6. Increment `paidCount` by `slotsBeingClaimed`.
7. If `paidCount === playerLimit` after the increment, set `status = "closed"`.

Firestore retries on conflicting writes, so two players hitting "I paid" simultaneously when only one slot remains will be ordered: one succeeds, the other gets a "match is full" error and the UI rolls back.

### Cancelling

1. Read `matches/{matchId}`.
2. Delete the participant doc.
3. Decrement `paidCount`.
4. If `status === "closed"` and `paidCount < playerLimit`, flip `status` to `"open"`.

A cancelled slot becomes available immediately to anyone who hits "I paid" next.

## Cancellation rules

"Before the match" means `match.date > now` (i.e., the kickoff time has not passed) and `match.status !== "cancelled"`. After the match starts, the roster freezes.

- A player can cancel **their own self-entry** while `match.date > now`, in any status (`open` or `closed`).
- A player can cancel **any guest they paid for** while `match.date > now`.
- An admin can cancel **any participant** (self, others, or guests) while `match.date > now`.
- Refunds: out of scope. The roster reflects current state; money is reconciled by admins externally.
- Cancelling a participant can flip a closed match back to open (handled by the cancellation transaction above).

## Security rules (sketch)

- All reads on `matches` and `matches/*/participants` require an authenticated user.
- `users/{uid}` read: any authenticated user can read any user doc (needed to render names and admin badges); writes are restricted: a user can update their own `locale`; only admins can toggle `isAdmin` on any user.
- `matches/*` writes: admin only.
- `matches/*/participants/*` create:
  - Self-entry: `paidByUid == auth.uid`, `isGuest == false`, doc ID == `auth.uid`, `verified` matches admin status of caller.
  - Guest-entry: `paidByUid == auth.uid`, `isGuest == true`, `guestName` non-empty.
  - Admin can create on anyone's behalf.
- `matches/*/participants/*` delete:
  - Allowed if `paidByUid == auth.uid` (own self-entry or your own guest), OR caller is admin.
- `matches/*/participants/*` update (e.g., team assignment, verified flag): admin only.
- All count/status maintenance happens client-side inside transactions; rules enforce that the committed state is internally consistent (e.g., `paidCount` can only change by ±1 or ±2 per write, `status === "closed"` requires `paidCount === playerLimit`).

## Internationalization

- Library: `react-i18next`.
- Default locale: **Hebrew (`he`)**. Also supported: **Spanish (`es`)**, **English (`en`)**.
- Translation files: `src/i18n/locales/{he,es,en}.json`.
- App name **"Vamos Kaduregel"** is a fixed string and never translated.
- Locale resolution at runtime: `users/{uid}.locale` → browser language (if it matches a supported locale) → `he`.
- The user doc's `locale` field is persisted: (1) on first sign-in, with the resolved value (so the user keeps the same language across devices); (2) whenever the user changes the language via the header switcher.
- Locale switcher lives in the app header.
- **RTL handling for Hebrew:**
  - `<html dir="rtl" lang="he">` when locale is `he`; `dir="ltr"` otherwise.
  - Use CSS logical properties and Tailwind `rtl:` variants throughout — no hardcoded `left`/`right`.
- Date and number formatting use `Intl.DateTimeFormat` / `Intl.NumberFormat` with the active locale.

## Responsive design

- **Mobile-first**, scaled up to desktop with Tailwind breakpoints. One layout, no device-specific code paths.
- Touch targets ≥ 44px.
- Modals/forms render as bottom sheets on mobile (`sm:` and below) and centered modals on `md+`.
- Tested at: ~360–430px (phone), ~768px (tablet), ~1280px+ (desktop).

## Player UX

1. **Login screen** — single Google sign-in button.
2. **Home / next match**:
   - Match info: date (formatted per locale), 20:00, location, price per player, admin notes.
   - `[Open payment link]` — opens external URL in a new tab.
   - `[I paid]` — runs the join transaction. Disabled if match is `closed` or `cancelled`.
   - `[Pay for a guest]` — modal asks for guest name, then runs the join transaction with `slotsBeingClaimed = 2` (self + guest). Only offered if the player has not yet paid for themselves; otherwise becomes `[Add a guest]` (claims one slot for the guest only — same transaction with `slotsBeingClaimed = 1` and `isGuest === true`). `[Add a guest]` is repeatable — a player can sponsor multiple guests by triggering it once per guest. Each press creates a separate guest participant doc.
   - **Roster list** — every participant: name (or guest name + "guest of X"), ✓ if verified, team number if assigned. Live via Firestore listener.
   - `[Cancel my spot]` on the player's own entry; `[Cancel guest: name]` on each of their guests.
3. **Past matches** — paginated list, click into a match to see its final roster and team assignments.
4. **Language switcher** in header.

## Admin UX

Admins see everything players see, plus:

1. **Create match** form — date picker (defaults to next Thursday), location, `numFields` (1 or 2), price, payment link, notes.
2. **Manage match** screen — for the active match:
   - Participant list with: ✓ verified toggle, team dropdown (1–2 or 1–4), × cancel.
   - Buttons: `[Close match]`, `[Reopen match]`, `[Cancel match]`, `[Edit match details]`.
3. **Users list** — all signed-up users; toggle `isAdmin` per user.

## Out-of-band setup (manual, one-time)

- Create the Firebase project (Spark plan).
- Enable Google sign-in in Firebase Auth.
- Deploy Firestore in Native mode.
- Set the first admin: in the Firebase console, edit `users/{firstAdminUid}` and set `isAdmin: true`. From then on, admins manage admins in-app.
- Configure Firebase Hosting and connect the deploy pipeline.

## Open questions / future work

- **Notifications.** Today the WhatsApp group is the channel; in v2 we may want push notifications for "match created", "spot freed up after a cancellation", or "you haven't paid yet, match is on Thursday".
- **Real payment integration.** A Stripe/PIX webhook would auto-verify payments and remove the admin verification step. Requires Cloud Functions (Blaze plan, but with a free quota).
- **Stats.** Per-player attendance/payment streaks, head-to-head team records.
- **Editing guest entries.** Currently cancel + re-add; could become a real edit if it gets annoying.
- **Time zones.** Currently the match time is a single fixed local-time value. If players ever travel, we may need explicit time-zone handling.
