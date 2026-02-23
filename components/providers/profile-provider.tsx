/**
 * ProfileProvider — Bridges Clerk Auth to Supabase Profile
 *
 * This context:
 * 1. Injects Clerk's JWT into the Supabase client (via setTokenResolver)
 * 2. Ensures a profile row exists in Supabase on first sign-in
 * 3. Exposes the profile to all child components via useProfile()
 *
 * Must be rendered inside <ClerkLoaded> so Clerk hooks are available.
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useAuth, useUser } from "@clerk/clerk-expo"
import { setTokenResolver, clearTokenResolver } from "@/lib/supabase"
import { getOrCreateProfile } from "@/lib/profile"
import type { Profile } from "@/types/database"

interface ProfileContextValue {
  profile: Profile | null
  isLoading: boolean
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  isLoading: true,
  refreshProfile: async () => {},
})

export function useProfile() {
  return useContext(ProfileContext)
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Sync token resolver with auth state
  useEffect(() => {
    if (isSignedIn) {
      setTokenResolver(() => getToken({ template: "supabase" }))
    } else {
      clearTokenResolver()
      setProfile(null)
      setIsLoading(false)
    }
  }, [isSignedIn, getToken])

  // Sync profile when signed in
  const syncProfile = useCallback(async () => {
    if (!isSignedIn || !user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const result = await getOrCreateProfile(user.id, {
        username: user.username ?? user.id.slice(0, 16),
        displayName:
          user.fullName ??
          user.firstName ??
          user.username ??
          "Fighter",
        avatarUrl: user.imageUrl ?? null,
      })
      setProfile(result)
    } catch (err) {
      console.error("Profile sync failed:", err)
    } finally {
      setIsLoading(false)
    }
  }, [isSignedIn, user])

  useEffect(() => {
    syncProfile()
  }, [syncProfile])

  return (
    <ProfileContext.Provider
      value={{ profile, isLoading, refreshProfile: syncProfile }}
    >
      {children}
    </ProfileContext.Provider>
  )
}
