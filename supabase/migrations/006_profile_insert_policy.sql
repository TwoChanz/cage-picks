-- ============================================================================
-- 006 — Profile INSERT Policy
-- ============================================================================
-- Allows authenticated users to insert their own profile row.
-- The profiles table had SELECT and UPDATE policies but was missing INSERT,
-- which blocked the Clerk-to-Supabase profile sync on first login.
-- ============================================================================

create policy "Users can insert own profile"
  on profiles for insert with check (
    clerk_user_id = auth.jwt() ->> 'sub'
  );
