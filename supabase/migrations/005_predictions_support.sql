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
