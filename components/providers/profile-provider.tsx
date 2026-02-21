/**
 * ProfileProvider — Bridges Clerk auth to Supabase
 *
 * Responsibilities:
 * 1. Injects Clerk JWT into the Supabase client via setTokenResolver
 * 2. Ensures a `profiles` row exists for the signed-in user
 * 3. Exposes the profile via useProfile() hook
 * 4. Cleans up on sign-out (clears token resolver + profile state)
 */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
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

export function useProfile(): ProfileContextValue {
  return useContext(ProfileContext)
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Sync profile whenever auth state changes
  const syncProfile = useCallback(async () => {
    if (!isSignedIn || !user) {
      clearTokenResolver()
      setProfile(null)
      setIsLoading(false)
      return
    }

    // Wire Clerk JWT into Supabase fetch
    setTokenResolver(() => getToken({ template: "supabase" }))

    try {
      const synced = await getOrCreateProfile(user.id, {
        username: user.username ?? user.id,
        displayName:
          user.fullName ??
          user.firstName ??
          user.username ??
          "Fighter",
        avatarUrl: user.imageUrl ?? null,
      })
      setProfile(synced)
    } catch (err) {
      console.error("Profile sync failed:", err)
      setProfile(null)
    } finally {
      setIsLoading(false)
    }
  }, [isSignedIn, user, getToken])

  useEffect(() => {
    syncProfile()
  }, [syncProfile])

  const refreshProfile = useCallback(async () => {
    setIsLoading(true)
    await syncProfile()
  }, [syncProfile])

  return (
    <ProfileContext.Provider value={{ profile, isLoading, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}
