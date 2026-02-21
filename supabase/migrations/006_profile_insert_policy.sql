-- Allow authenticated users to insert their own profile row.
-- The Clerk JWT's "sub" claim must match the clerk_user_id being inserted.
create policy "Users can insert own profile"
  on profiles for insert with check (
    clerk_user_id = auth.jwt() ->> 'sub'
  );
