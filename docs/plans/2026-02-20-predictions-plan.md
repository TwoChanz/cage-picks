# Predictions v1.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the predictions feature so users can pick fight winners, with server-side lock enforcement, favorite/underdog scoring via snapshot, and automatic score calculation via Postgres trigger.

**Architecture:** The front-end prediction UI (tappable FightRows, optimistic updates, pick counter) is already built and functional with mock data. This plan adds the database schema changes (favorite_fighter_id, was_favorite_at_pick, server-side locking, score trigger), updates the TypeScript types, wires the data layer to real Supabase queries, adds deselection, and smoke-tests end-to-end.

**Tech Stack:** React Native (Expo SDK 54), Supabase (PostgreSQL + RLS), TypeScript, Expo Router 6. No test framework is configured — verification is manual via Expo dev server.

---

### Task 1: Database Migration — Schema + RLS + Score Trigger

**Files:**
- Create: `supabase/migrations/005_predictions_support.sql`

**Context:** The `fights` table exists in `001_initial_schema.sql` (line 115-135). The `predictions` table exists at line 226-239. Existing RLS policies for predictions only cover SELECT and INSERT (lines 330-342). We need to add columns, new RLS policies with time-based lock enforcement, and a scoring trigger.

**Step 1: Create the migration file**

Create `supabase/migrations/005_predictions_support.sql` with the following content:

```sql
-- ============================================================================
-- 005 — Predictions Support
-- ============================================================================
-- Adds favorite_fighter_id to fights, was_favorite_at_pick to predictions,
-- server-side lock enforcement via RLS, and automatic score calculation.
-- ============================================================================

-- ── 1. Add favorite_fighter_id to fights ──
-- Indicates the betting favorite for underdog scoring. NULL = pick'em (1 pt each).
alter table fights
  add column favorite_fighter_id uuid references fighters (id);

-- ── 2. Add was_favorite_at_pick to predictions ──
-- Snapshot of whether the picked fighter was the favorite at pick time.
-- Used for scoring so line movement doesn't change point values retroactively.
-- Default false for any existing rows (treat as non-favorite / pick'em).
alter table predictions
  add column was_favorite_at_pick boolean not null default false;

-- ── 3. RLS: Server-side lock enforcement ──
-- Predictions can only be inserted/updated/deleted before the event starts.
-- This is the source of truth — client-side lock is just UX.

-- Helper: check if the fight's event has not started yet
create or replace function fight_event_not_started(p_fight_id uuid)
returns boolean as $$
  select exists (
    select 1
    from fights f
    join events e on e.id = f.event_id
    where f.id = p_fight_id
      and now() < e.date
  );
$$ language sql stable security definer;

-- Update the existing INSERT policy to add time-based lock
-- First drop the old one, then recreate with time check
drop policy if exists "Users can insert own predictions" on predictions;

create policy "Users can insert own predictions"
  on predictions for insert with check (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
    and fight_event_not_started(fight_id)
  );

-- UPDATE policy: own predictions + not locked
create policy "Users can update own predictions"
  on predictions for update using (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
    and fight_event_not_started(fight_id)
  );

-- DELETE policy: own predictions + not locked
create policy "Users can delete own predictions"
  on predictions for delete using (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
    and fight_event_not_started(fight_id)
  );

-- ── 4. Score calculation trigger ──
-- When fights.winner_id is set or changed, compute is_correct and points_earned
-- for all predictions on that fight.
--
-- Scoring rules:
--   correct pick + was_favorite_at_pick = true  → 1 point
--   correct pick + was_favorite_at_pick = false → 2 points
--   incorrect pick                              → 0 points
--   winner_id set to NULL (reversed/cancelled)  → reset to NULL / 0

create or replace function score_predictions_for_fight()
returns trigger as $$
begin
  -- Only act when winner_id changes (set, changed, or cleared)
  if (OLD.winner_id is distinct from NEW.winner_id) then
    if NEW.winner_id is not null then
      -- Score all predictions for this fight
      update predictions
      set
        is_correct = (picked_fighter_id = NEW.winner_id),
        points_earned = case
          when picked_fighter_id = NEW.winner_id and was_favorite_at_pick then 1
          when picked_fighter_id = NEW.winner_id and not was_favorite_at_pick then 2
          else 0
        end,
        updated_at = now()
      where fight_id = NEW.id;
    else
      -- Winner cleared (result reversed) — reset all predictions
      update predictions
      set
        is_correct = null,
        points_earned = 0,
        updated_at = now()
      where fight_id = NEW.id;
    end if;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_score_predictions
  after update of winner_id on fights
  for each row
  execute function score_predictions_for_fight();
```

**Step 2: Apply the migration**

Run in Supabase SQL editor or via CLI:
```bash
supabase db push
```

If using the Supabase dashboard, paste the SQL into the SQL editor and execute.

**Step 3: Commit**

```bash
git add supabase/migrations/005_predictions_support.sql
git commit -m "feat: add predictions support migration (favorite, snapshot, RLS lock, score trigger)"
```

---

### Task 2: Update TypeScript Types

**Files:**
- Modify: `types/database.ts:78-96` (Fight interface)
- Modify: `types/database.ts:155-166` (Prediction interface)

**Context:** These types must match the database schema after migration 005 runs. The Fight interface needs `favorite_fighter_id`. The Prediction interface needs `was_favorite_at_pick`.

**Step 1: Add `favorite_fighter_id` to the Fight interface**

In `types/database.ts`, add after `started_at: string | null` (line 93):

```typescript
favorite_fighter_id: string | null  // Which fighter is the betting favorite (null = pick'em)
```

**Step 2: Add `was_favorite_at_pick` to the Prediction interface**

In `types/database.ts`, add after `picked_fighter_id: string` (line 160):

```typescript
was_favorite_at_pick: boolean       // Snapshot: was picked fighter the favorite at pick time?
```

**Step 3: Commit**

```bash
git add types/database.ts
git commit -m "feat: add favorite_fighter_id and was_favorite_at_pick to database types"
```

---

### Task 3: Update Data Layer — `lib/predictions.ts`

**Files:**
- Modify: `lib/predictions.ts`

**Context:** This file currently has `USE_MOCK = true`, `getUserPredictionsForEvent`, `savePrediction`, and `isFightLocked`. We need to:
1. Add `deletePrediction` function for deselection.
2. Update `savePrediction` to accept and pass `wasFavoriteAtPick`.
3. Update mock data to include `was_favorite_at_pick`.
4. Keep `USE_MOCK = true` for now (toggle to false when Supabase is active).

**Step 1: Add `was_favorite_at_pick` to the mock prediction builder and savePrediction**

In `savePrediction`, add a `wasFavoriteAtPick` parameter after `pickedFighterId`:

```typescript
export async function savePrediction(
  profileId: string,
  fightId: string,
  pickedFighterId: string,
  wasFavoriteAtPick: boolean = false,
  groupId: string | null = null
): Promise<Prediction | null> {
```

Update the mock prediction object inside `savePrediction` (around line 90-101) to include:
```typescript
was_favorite_at_pick: wasFavoriteAtPick,
```

Update the Supabase upsert payload (around line 107-115) to include:
```typescript
was_favorite_at_pick: wasFavoriteAtPick,
```

**Step 2: Add `deletePrediction` function**

Add this function after `savePrediction`:

```typescript
/**
 * Delete a prediction (deselect a pick).
 *
 * @param profileId - The user's profile ID
 * @param fightId   - The fight to remove the pick from
 */
export async function deletePrediction(
  profileId: string,
  fightId: string
): Promise<boolean> {
  if (USE_MOCK) {
    const key = `${profileId}:${fightId}`
    return mockPredictions.delete(key)
  }

  const { error } = await supabase
    .from("predictions")
    .delete()
    .eq("profile_id", profileId)
    .eq("fight_id", fightId)
    .is("group_id", null)

  if (error) {
    console.error("Failed to delete prediction:", error)
    return false
  }
  return true
}
```

**Step 3: Commit**

```bash
git add lib/predictions.ts
git commit -m "feat: add deletePrediction and was_favorite_at_pick to predictions data layer"
```

---

### Task 4: Add Deselection to Event Detail Screen

**Files:**
- Modify: `app/(tabs)/events/[slug].tsx`

**Context:** The event detail screen at `app/(tabs)/events/[slug].tsx` currently imports `savePrediction` (line 33-35) and handles picks in `handlePickFighter` (line 84-116). It does NOT support deselection — tapping the same fighter just re-saves the same pick. We need to detect "same fighter tapped again" and call `deletePrediction` instead.

**Step 1: Add `deletePrediction` to imports**

Update the import from `@/lib/predictions` (line 33-35) to include `deletePrediction`:

```typescript
import {
  getUserPredictionsForEvent,
  savePrediction,
  deletePrediction,
} from "@/lib/predictions"
```

**Step 2: Update `handlePickFighter` to support deselection and `was_favorite_at_pick`**

Replace the `handlePickFighter` callback (lines 84-116) with:

```typescript
const handlePickFighter = useCallback(
  async (fightId: string, fighterId: string) => {
    const existing = predictions.get(fightId)

    // ── Deselect: tapping the same fighter removes the pick ──
    if (existing?.picked_fighter_id === fighterId) {
      // Optimistic delete
      setPredictions((prev) => {
        const next = new Map(prev)
        next.delete(fightId)
        return next
      })

      const success = await deletePrediction(profileId, fightId)
      if (!success) {
        // Revert on failure
        setPredictions((prev) => {
          const next = new Map(prev)
          next.set(fightId, existing)
          return next
        })
      }
      return
    }

    // ── Determine was_favorite_at_pick ──
    const fight = event?.fights.find((f) => f.id === fightId)
    const wasFavoriteAtPick = fight?.favorite_fighter_id === fighterId

    // ── Upsert: new pick or switching fighter ──
    // Optimistic update
    setPredictions((prev) => {
      const next = new Map(prev)
      next.set(fightId, {
        id: existing?.id ?? `temp-${fightId}`,
        profile_id: profileId,
        fight_id: fightId,
        group_id: null,
        picked_fighter_id: fighterId,
        was_favorite_at_pick: wasFavoriteAtPick,
        is_correct: null,
        points_earned: 0,
        locked_at: null,
        created_at: existing?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      return next
    })

    // Persist in background
    const saved = await savePrediction(profileId, fightId, fighterId, wasFavoriteAtPick)
    if (saved) {
      setPredictions((prev) => {
        const next = new Map(prev)
        next.set(fightId, saved)
        return next
      })
    } else {
      // Revert on failure
      setPredictions((prev) => {
        const next = new Map(prev)
        if (existing) {
          next.set(fightId, existing)
        } else {
          next.delete(fightId)
        }
        return next
      })
    }
  },
  [profileId, event?.fights, predictions]
)
```

**Step 3: Commit**

```bash
git add app/(tabs)/events/[slug].tsx
git commit -m "feat: add deselection and was_favorite_at_pick to event detail predictions"
```

---

### Task 5: Add Favorite Indicator to FightRow

**Files:**
- Modify: `components/events/fight-row.tsx`

**Context:** FightRow (`components/events/fight-row.tsx`) renders each fight matchup. It currently has no visual indicator for which fighter is the favorite. We need a small "FAV" badge next to the favored fighter's name so users know which pick is worth 1 vs 2 points. The `FightWithFighters` type extends `Fight`, which will now include `favorite_fighter_id`.

**Step 1: Add favorite indicator rendering**

In the FightRow component body (after the `const hasPick = pickedA || pickedB` line, around line 53), add:

```typescript
const isFavA = fight.favorite_fighter_id === fighter_a.id
const isFavB = fight.favorite_fighter_id === fighter_b.id
```

Then add a small "FAV" text element next to each fighter's record. For Fighter A, after the record `<Text>` element (around line 126-132 in the Pressable branch, and line 168-175 in the non-Pressable branch), add:

```typescript
{isFavA && <Text style={styles.favBadge}>FAV</Text>}
```

Do the same for Fighter B at the equivalent location (after the record Text for fighter_b).

**Step 2: Add the `favBadge` style**

Add to the StyleSheet:

```typescript
favBadge: {
  color: Colors.accent,
  fontSize: 9,
  fontWeight: "800",
  letterSpacing: 0.5,
  marginTop: 2,
},
```

**Step 3: Commit**

```bash
git add components/events/fight-row.tsx
git commit -m "feat: add FAV badge to FightRow for favorite fighter indicator"
```

---

### Task 6: Smoke Test

**Steps:**

1. Start the dev server:
   ```bash
   npx expo start
   ```

2. Open the app on a device/simulator. Navigate to an event detail screen.

3. Verify these behaviors:
   - Fight rows render correctly with no regressions.
   - Tapping a fighter highlights their side with "YOUR PICK" indicator.
   - Tapping the same fighter again **deselects** the pick (removes highlight).
   - Tapping the other fighter in the same fight **switches** the pick.
   - The pick counter at top updates correctly (e.g., "3/14 picks").
   - If a fight has `favorite_fighter_id` set, the "FAV" badge appears next to that fighter's record.
   - If no TypeScript errors appear in the Metro bundler output.

4. If any fixes are needed, apply them and commit:
   ```bash
   git add -A
   git commit -m "fix: address issues found during predictions smoke test"
   ```

---

## File Summary

| Action | Path | Description |
|--------|------|-------------|
| Create | `supabase/migrations/005_predictions_support.sql` | Schema changes, RLS lock enforcement, score trigger |
| Modify | `types/database.ts` | Add `favorite_fighter_id` to Fight, `was_favorite_at_pick` to Prediction |
| Modify | `lib/predictions.ts` | Add `deletePrediction`, `wasFavoriteAtPick` param to `savePrediction` |
| Modify | `app/(tabs)/events/[slug].tsx` | Deselection support, `was_favorite_at_pick` computation |
| Modify | `components/events/fight-row.tsx` | FAV badge indicator for favorite fighter |

## Dependency Order

```
Task 1 (migration)
  └→ Task 2 (TypeScript types)
       └→ Task 3 (data layer)
            └→ Task 4 (event detail deselection)
            └→ Task 5 (FightRow FAV badge)
                 └→ Task 6 (smoke test)
```

Tasks 4 and 5 are independent of each other and can be done in parallel after Task 3.
