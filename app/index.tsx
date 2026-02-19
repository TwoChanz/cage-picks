/**
 * Root Index — entry point redirect
 *
 * Expo Router needs a route at the root index (`/`).
 * This screen checks Clerk auth state and redirects:
 * - Signed in → /(tabs)/events
 * - Not signed in → /auth
 */
import { Redirect } from "expo-router"
import { useAuth } from "@clerk/clerk-expo"

export default function Index() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href="/(tabs)/events" />
  }

  return <Redirect href="/auth" />
}
