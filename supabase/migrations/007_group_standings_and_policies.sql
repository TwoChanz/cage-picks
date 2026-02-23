-- ============================================================================
-- 007 — Group Standings & Missing RLS Policies
-- ============================================================================
-- Adds missing RLS policies for group operations (join, invite, owner
-- management) and an RPC function for computing group standings.
-- ============================================================================

-- ── 1. group_members INSERT policy ──
-- Users can add themselves to a group (role must be 'member', not 'owner').
-- Owner row is inserted server-side during group creation.
create policy "Users can join groups as member"
  on group_members for insert with check (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
    and role = 'member'
  );

-- ── 2. groups UPDATE policy (owner only) ──
create policy "Group owner can update group"
  on groups for update using (
    created_by in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
  );

-- ── 3. groups DELETE policy (owner only) ──
create policy "Group owner can delete group"
  on groups for delete using (
    created_by in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
  );

-- ── 4. group_invites INSERT policy (group members can create) ──
create policy "Group members can create invites"
  on group_invites for insert with check (
    created_by in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
    and group_id in (
      select group_id from group_members
      where profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );

-- ── 5. group_invites UPDATE policy (for use_count increment on join) ──
create policy "Group members can update invite use_count"
  on group_invites for update using (
    group_id in (
      select group_id from group_members
      where profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
    )
  );

-- ── 6. Index for standings query performance ──
-- Predictions with group_id IS NULL are the global picks (count everywhere).
create index idx_predictions_profile_null_group
  on predictions (profile_id) where group_id is null;

-- ── 7. get_group_standings RPC ──
-- Computes standings for a group by joining group_members → profiles →
-- predictions (WHERE group_id IS NULL). Returns ranked list by total_points.
create or replace function get_group_standings(p_group_id uuid)
returns table (
  profile_id uuid,
  display_name text,
  avatar_url text,
  total_points bigint,
  total_predictions bigint,
  correct_predictions bigint
) as $$
  select
    p.id as profile_id,
    p.display_name,
    p.avatar_url,
    coalesce(sum(pr.points_earned), 0) as total_points,
    count(pr.id) as total_predictions,
    count(pr.id) filter (where pr.is_correct = true) as correct_predictions
  from group_members gm
  join profiles p on p.id = gm.profile_id
  left join predictions pr on pr.profile_id = p.id and pr.group_id is null
  where gm.group_id = p_group_id
  group by p.id, p.display_name, p.avatar_url
  order by total_points desc, correct_predictions desc;
$$ language sql stable security definer;

-- ── 8. get_global_rank RPC ──
-- Returns a user's global rank among all users with predictions.
create or replace function get_global_rank(p_profile_id uuid)
returns table (
  rank bigint,
  total bigint
) as $$
  with scored as (
    select
      profile_id,
      coalesce(sum(points_earned), 0) as total_points,
      rank() over (order by coalesce(sum(points_earned), 0) desc) as rnk
    from predictions
    where group_id is null
    group by profile_id
  )
  select
    (select rnk from scored where profile_id = p_profile_id) as rank,
    (select count(*) from scored) as total;
$$ language sql stable security definer;
