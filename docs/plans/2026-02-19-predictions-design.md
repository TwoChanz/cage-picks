# Predictions Feature Design (Rules v1.0)

## Summary

Users make fight predictions directly on the event detail screen by tapping a fighter on each fight row. Picks lock when the event starts. Correct picks earn 1 point (favorite/pick'em) or 2 points (underdog). Scoring is enforced server-side via Postgres triggers.

## UX Flow

1. User opens an event detail screen and sees the fight card.
2. Each FightRow is tappable on either fighter's side. Tapping a fighter selects them as the user's pick with a visual highlight (accent border/glow).
3. Tapping the same fighter again deselects the pick.
4. A prediction header at the top shows "X/Y picks" with a prompt to tap fighters.
5. All picks for an event lock when the first fight starts (based on `event.date`). After lock, picks display as read-only with correct/incorrect badges as results come in.

## Scoring

- Correct pick on the favorite: 1 point
- Correct pick on the underdog: 2 points
- Pick'em (no favorite set): 1 point for correct pick
- Incorrect pick: 0 points
- Draw / No Contest / Cancelled: 0 points, no refunds
- Determined by `favorite_fighter_id` column on the `fights` table (admin-set).
- Scoring uses `was_favorite_at_pick` snapshot, never the current `favorite_fighter_id` value.

## Database Changes

Migration: `005_predictions_support.sql`

### fights table
- Add `favorite_fighter_id` (nullable UUID, FK to `fighters.id`). Indicates the betting favorite. Null = pick'em.

### predictions table
- Add `was_favorite_at_pick` (BOOLEAN NOT NULL). Snapshot of whether the picked fighter was the favorite at the time the pick was made. Used for scoring — ensures line movement doesn't retroactively change point values.

### Server-side lock enforcement (RLS)
- INSERT policy: reject when `now() >= event.date` (joined through `fights → events`).
- UPDATE policy: same time-based check + own-predictions check.
- DELETE policy: same time-based check + own-predictions check.
- Client-side lock check remains for UX (disable tapping), but server is the source of truth.

### Score calculation trigger
- Trigger on `fights` table: when `winner_id` is set or changed, automatically compute `is_correct` and `points_earned` for ALL predictions on that fight.
- Logic: if `picked_fighter_id = winner_id` → `is_correct = true`, `points_earned = was_favorite_at_pick ? 1 : 2`. Otherwise `is_correct = false`, `points_earned = 0`.
- If `winner_id` is set to NULL (result reversed/cancelled), reset `is_correct = NULL` and `points_earned = 0`.

## Data Layer — `lib/predictions.ts`

Existing functions (already implemented with mock support):

- `getUserPredictionsForEvent(profileId, fightIds)` — Fetch all user picks for event fights. Returns `Map<string, Prediction>`.
- `savePrediction(profileId, fightId, pickedFighterId, groupId?)` — Upsert a pick. **Updated to include `was_favorite_at_pick`.**
- `isFightLocked(fightStatus)` — Check if fight status prevents new picks.

New functions:

- `deletePrediction(profileId, fightId)` — Remove a pick (deselect).

## Components (Already Implemented)

### `FightRow` (modified)
- Tappable fighter sides with Pressable wrappers.
- Shows "YOUR PICK" indicator with lock/result icons.
- Props: `pickedFighterId`, `onPickFighter`, `isLocked`, `isCorrect`.

### `FightCard` + `EventCard` (modified)
- Thread prediction props (Map, onPickFighter) down to FightRow.

### Event Detail Screen `[slug].tsx` (modified)
- Prediction header with pick counter.
- Optimistic updates with Map-based state.
- **Needs: deselection support (tap same fighter to remove pick).**

## State Management

- Local `useState<Map<string, Prediction>>` in the event detail screen.
- Fetched on mount via `getUserPredictionsForEvent`.
- Optimistic updates: UI updates immediately on tap, Supabase upsert runs in background.
- On error, revert the optimistic update and show Alert.

## Lock Logic

- Client-side: compare `event.date` to `new Date()` for UX disabling.
- Server-side: RLS policies reject writes after event start time (source of truth).
- `isFightLocked(fight.status)` checks individual fight status for per-fight locking.

## Out of Scope (Future Phases)

- Group predictions (Phase 3 — uses existing `group_id` on predictions)
- Leaderboard (Phase 4 — aggregates points_earned across predictions)
- Method/round predictions
- Live fight status updates
- PredictionSummary collapsible banner (deferred — current header is sufficient)
- PredictionBadge standalone component (deferred — FightRow already handles result display inline)
