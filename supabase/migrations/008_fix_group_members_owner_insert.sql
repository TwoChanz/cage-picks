-- ============================================================================
-- 008 — Fix group_members INSERT policy for owner role
-- ============================================================================
-- The 007 policy only allowed role='member' inserts, which blocked the group
-- creator from adding themselves as 'owner'. This replaces the policy to
-- allow 'owner' when the user is also the group creator (created_by).
-- ============================================================================

drop policy if exists "Users can join groups as member" on group_members;

create policy "Users can insert own group membership"
  on group_members for insert with check (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
    and (
      role = 'member'
      or (
        role = 'owner'
        and group_id in (
          select id from groups
          where created_by in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
        )
      )
    )
  );
