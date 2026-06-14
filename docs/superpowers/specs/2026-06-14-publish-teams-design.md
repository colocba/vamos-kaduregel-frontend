# Publish vs. Save teams — design

## Problem

The admin teams board has one action, "Save teams", which both persists team
assignments and (implicitly) exposes them to players, since the player-facing
view shows teams as soon as any participant has a `team`. Admins want to
arrange and save teams privately first, then explicitly reveal them.

## Requirements

1. **Save teams** — persist the current team assignments to the database.
   Players must NOT see the teams as a result of saving alone.
2. **Publish teams** — make the saved teams visible to subscribed players.

## Decisions

- Post-publish saves apply **live**: once published, "Save teams" edits are
  immediately visible to players. To hide while reshuffling, the admin clicks
  **Unpublish** first. (One source of truth, no separate draft copy.)

## Data model

- Add `teamsPublished: boolean` to `MatchDoc` (`src/types/match.ts`).
- Default to `false` in `normalizeMatch` so existing/old matches start
  unpublished. The admin clicks Publish once for the current match (acceptable
  one-time migration for this app).

## API (`src/matches/api/`)

- New `setTeamsPublished(matchId, published)` — mirrors `setMatchStatus`:
  `updateDoc(doc(db,"matches",matchId), { teamsPublished })`.
- `setParticipantTeams` unchanged (writes `team` field).

Firestore rules already allow `isAdmin()` to update the match doc — no rules
change needed.

## UI — `TeamsBoard.tsx`

### Admin view (header actions)
- **Save teams** — unchanged: persists assignments, does not touch the flag.
- **Publish teams** — saves current assignments, then sets
  `teamsPublished = true` (save → publish in sequence, so published always
  matches what's on screen). Disabled while a publish/save is in flight.
- **Unpublish** — shown only when `teamsPublished` is true; sets the flag false.
- **Status badge** — "Published" / "Hidden" so the admin knows current
  visibility at a glance.

### Player (non-admin) view
- Gate the rendered teams on `match.teamsPublished` instead of "any participant
  has a team". When not published, show the existing `viewTeamsHint` placeholder.

## i18n (he / es / en)

Add: `match.publishTeams`, `match.unpublishTeams`, `match.teamsPublished`
(badge), `match.teamsHidden` (badge).

## Out of scope

- Separate private draft vs. published copy of teams.
- Any change to how teams are stored on participants.
