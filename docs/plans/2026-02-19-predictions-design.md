# Predictions Feature Design

## Summary

Users make fight predictions directly on the event detail screen by tapping a fighter on each fight row. Picks lock when the event starts. Correct picks earn 1 point (favorite) or 2 points (underdog).

## UX Flow

1. User opens an event detail screen and sees the fight card.
2. Each FightRow is tappable on either fighter's side. Tapping a fighter selects them as the user's pick with a visual highlight (accent border/glow).
3. Tapping the same fighter again deselects the pick.
4. A collapsible PredictionSummary banner at the top of the event detail screen shows "X/Y fights picked" with a compact list of selections.
5. All picks for an event lock when the first fight starts (based on `event.date`). After lock, picks display as read-only with correct/incorrect badges as results come in.

## Scoring

- Correct pick on the favorite: 1 point
- Correct pick on the underdog: 2 points
- Incorrect pick: 0 points
- Determined by a `favorite_fighter_id` column on the `fights` table (admin-set).

## Database Changes

Add `favorite_fighter_id` (nullable UUID, FK to `fighters.id`) to the `fights` table. This indicates which fighter is the betting favorite. If null, both fighters earn 1 point on a correct pick (pick'em).

Migration: `004_add_favorite_fighter.sql`

## Data Layer — `lib/predictions.ts`

Functions following the existing N+1 prevention pattern:

- `getEventPredictions(profileId, eventId)` — Fetch all user picks for an event. Single query joining predictions with fights filtered by event_id.
- `upsertPrediction(profileId, fightId, pickedFighterId)` — Create or update a pick using Supabase upsert on the `(profile_id, fight_id, group_id)` unique constraint. group_id is null for public predictions.
- `deletePrediction(profileId, fightId)` — Remove a pick (deselect).
- `isEventLocked(eventDate)` — Pure function comparing event date to current time.

## Components

### Modified: `FightRow`

- Accepts `prediction` prop (the user's current pick for this fight, if any).
- Accepts `onPickFighter(fightId, fighterId)` callback.
- Accepts `locked` boolean to disable interaction after event starts.
- Visual states: unpicked (default), picked-fighter-a (left highlight), picked-fighter-b (right highlight), correct (green badge), incorrect (red badge), pending (fight not yet scored).

### New: `PredictionSummary`

- Sits at the top of the event detail screen.
- Shows pick count ("8/14 fights picked"), compact list of picks (fighter names).
- Collapsible. Shows locked/unlocked status.
- After event: shows score summary (points earned, accuracy percentage).

### New: `PredictionBadge`

- Small inline indicator on FightRow for post-lock display.
- States: pending (gray), correct (green checkmark), incorrect (red X).

## State Management

- Local `useState` in the event detail screen holds predictions array.
- Fetched on mount via `getEventPredictions`.
- Optimistic updates: UI updates immediately on tap, Supabase upsert runs in the background.
- On error, revert the optimistic update and show a brief toast/alert.

## Lock Logic

- Compare `event.date` (first fight start time) to `new Date()`.
- If current time >= event date, all FightRows render as locked (non-tappable).
- The `locked_at` field on the prediction row is set to the event start time when the event begins (can be handled by a Supabase trigger or edge function later).

## Out of Scope (Future Phases)

- Group predictions (Phase 3 — uses the existing `group_id` on predictions)
- Leaderboard (Phase 4 — aggregates points_earned across predictions)
- Method/round predictions
- Live fight status updates
