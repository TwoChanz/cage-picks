/**
 * Profile Data Access Layer
 *
 * Bridges Clerk auth to the Supabase `profiles` table. On first login,
 * creates a new profile row keyed by clerk_user_id. On subsequent logins,
 * returns the existing row.
 *
 * Handles the race condition where two concurrent calls could both
 * fail to find a row and both attempt an INSERT — the unique constraint
 * on clerk_user_id causes one to fail with code 23505, so we retry the SELECT.
 */
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/types/database"

interface ProfileDefaults {
  username: string
  displayName: string
  avatarUrl: string | null
}

/**
 * Get or create a profile row for the given Clerk user.
 *
 * 1. SELECT by clerk_user_id
 * 2. If not found, INSERT with defaults from Clerk user object
 * 3. If INSERT hits unique violation (race), retry SELECT
 */
export async function getOrCreateProfile(
  clerkUserId: string,
  defaults: ProfileDefaults
): Promise<Profile> {
  // 1. Try to find existing profile
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .single()

  if (existing) return existing as Profile

  // PGRST116 = "no rows returned" from .single() — expected on first login
  if (selectError && selectError.code !== "PGRST116") {
    throw new Error(`Profile lookup failed: ${selectError.message}`)
  }

  // 2. Insert new profile
  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({
      clerk_user_id: clerkUserId,
      username: defaults.username,
      display_name: defaults.displayName,
      avatar_url: defaults.avatarUrl,
      title: "Fight Fan",
    })
    .select()
    .single()

  if (created) return created as Profile

  // 3. Handle race condition — unique violation means another call won the insert
  if (insertError?.code === "23505") {
    const { data: retried, error: retryError } = await supabase
      .from("profiles")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .single()

    if (retried) return retried as Profile
    throw new Error(`Profile retry failed: ${retryError?.message}`)
  }

  throw new Error(`Profile creation failed: ${insertError?.message}`)
}
