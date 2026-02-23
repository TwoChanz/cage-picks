/**
 * Profile Data Access Layer
 *
 * Bridges Clerk authentication to the Supabase profiles table.
 * On first sign-in, creates a profile row linked to the Clerk user ID.
 * On subsequent sign-ins, returns the existing profile.
 */
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/types/database"

interface ProfileDefaults {
  username: string
  displayName: string
  avatarUrl?: string | null
}

/**
 * Get the user's profile, creating one if it doesn't exist.
 *
 * Flow:
 * 1. SELECT by clerk_user_id
 * 2. If not found, INSERT a new row
 * 3. If INSERT hits unique constraint (race condition), retry SELECT
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

  // Only continue to INSERT if the error was "no rows" (PGRST116)
  if (selectError && selectError.code !== "PGRST116") {
    throw new Error(`Failed to fetch profile: ${selectError.message}`)
  }

  // 2. Create new profile
  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({
      clerk_user_id: clerkUserId,
      username: defaults.username,
      display_name: defaults.displayName,
      avatar_url: defaults.avatarUrl ?? null,
    })
    .select()
    .single()

  if (created) return created as Profile

  // 3. Handle race condition — another request created the profile first
  if (insertError?.code === "23505") {
    const { data: retried, error: retryError } = await supabase
      .from("profiles")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .single()

    if (retried) return retried as Profile
    throw new Error(`Failed to fetch profile after conflict: ${retryError?.message}`)
  }

  throw new Error(`Failed to create profile: ${insertError?.message}`)
}
