-- ============================================================================
-- 010 — Optimize RLS policies: wrap auth calls in (select ...)
-- ============================================================================
-- Supabase re-evaluates auth.jwt() and auth.role() per-row unless wrapped
-- in a subselect. This migration recreates all affected policies with the
-- (select auth.jwt()) pattern for better query performance.
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
-- ============================================================================

-- ── profiles ──

drop policy if exists "Profiles are viewable by authenticated users" on profiles;
create policy "Profiles are viewable by authenticated users"
  on profiles for select using ((select auth.role()) = 'authenticated');

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update using (
    clerk_user_id = (select auth.jwt() ->> 'sub')
  );

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
  on profiles for insert with check (
    clerk_user_id = (select auth.jwt() ->> 'sub')
  );

-- ── fighter_favorites ──

drop policy if exists "Users can view own favorites" on fighter_favorites;
create policy "Users can view own favorites"
  on fighter_favorites for select using (
    profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
  );

drop policy if exists "Users can insert own favorites" on fighter_favorites;
create policy "Users can insert own favorites"
  on fighter_favorites for insert with check (
    profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
  );

drop policy if exists "Users can delete own favorites" on fighter_favorites;
create policy "Users can delete own favorites"
  on fighter_favorites for delete using (
    profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
  );

-- ── groups ──

drop policy if exists "Users can view their groups" on groups;
create policy "Users can view their groups"
  on groups for select using (
    id in (
      select group_id from group_members
      where profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
    )
  );

drop policy if exists "Authenticated users can create groups" on groups;
create policy "Authenticated users can create groups"
  on groups for insert with check (
    created_by in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
  );

drop policy if exists "Group owner can update group" on groups;
create policy "Group owner can update group"
  on groups for update using (
    created_by in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
  );

drop policy if exists "Group owner can delete group" on groups;
create policy "Group owner can delete group"
  on groups for delete using (
    created_by in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
  );

-- ── group_members ──

drop policy if exists "Group members can view their group members" on group_members;
create policy "Group members can view their group members"
  on group_members for select using (
    group_id in (
      select group_id from group_members gm
      where gm.profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
    )
  );

drop policy if exists "Users can insert own group membership" on group_members;
create policy "Users can insert own group membership"
  on group_members for insert with check (
    profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
    and (
      role = 'member'
      or (
        role = 'owner'
        and group_id in (
          select id from groups
          where created_by in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
        )
      )
    )
  );

-- ── group_invites ──

drop policy if exists "Group members can create invites" on group_invites;
create policy "Group members can create invites"
  on group_invites for insert with check (
    created_by in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
    and group_id in (
      select group_id from group_members
      where profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
    )
  );

drop policy if exists "Group members can update invite use_count" on group_invites;
create policy "Group members can update invite use_count"
  on group_invites for update using (
    group_id in (
      select group_id from group_members
      where profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
    )
  );

-- ── predictions ──

drop policy if exists "Users can view predictions in their groups" on predictions;
create policy "Users can view predictions in their groups"
  on predictions for select using (
    group_id is null
    or group_id in (
      select group_id from group_members
      where profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
    )
  );

drop policy if exists "Users can insert own predictions" on predictions;
create policy "Users can insert own predictions"
  on predictions for insert with check (
    profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
    and fight_event_not_started(fight_id)
  );

drop policy if exists "Users can update own predictions" on predictions;
create policy "Users can update own predictions"
  on predictions for update using (
    profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
    and fight_event_not_started(fight_id)
  );

drop policy if exists "Users can delete own predictions" on predictions;
create policy "Users can delete own predictions"
  on predictions for delete using (
    profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
    and fight_event_not_started(fight_id)
  );

-- ── meetup_nudges ──

drop policy if exists "Meetup nudges visible to group members" on meetup_nudges;
create policy "Meetup nudges visible to group members"
  on meetup_nudges for select using (
    group_id in (
      select group_id from group_members
      where profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
    )
  );

-- ── meetup_responses ──

drop policy if exists "Meetup responses visible to group members" on meetup_responses;
create policy "Meetup responses visible to group members"
  on meetup_responses for select using (
    nudge_id in (
      select id from meetup_nudges
      where group_id in (
        select group_id from group_members
        where profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
      )
    )
  );

drop policy if exists "Users can insert own meetup response" on meetup_responses;
create policy "Users can insert own meetup response"
  on meetup_responses for insert with check (
    profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
  );

drop policy if exists "Users can update own meetup response" on meetup_responses;
create policy "Users can update own meetup response"
  on meetup_responses for update using (
    profile_id in (select id from profiles where clerk_user_id = (select auth.jwt() ->> 'sub'))
  );
