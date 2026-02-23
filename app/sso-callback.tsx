/**
 * SSO Callback — Handles the OAuth redirect from Google/Apple sign-in
 *
 * On web, after Google/Apple authenticates the user, Clerk redirects
 * back to /sso-callback. The Clerk SDK automatically processes the
 * callback URL parameters. This page just waits for the auth state
 * to update and then redirects to the main app.
 */
import { useEffect } from "react"
import { View, Text, ActivityIndicator, StyleSheet } from "react-native"
import { useAuth } from "@clerk/clerk-expo"
import { useRouter } from "expo-router"
import { Colors, FontSize, Spacing } from "@/constants/theme"

export default function SSOCallbackScreen() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn) {
      router.replace("/(tabs)/events")
    } else {
      // Give Clerk a moment to process the callback params
      const timeout = setTimeout(() => {
        router.replace("/auth")
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [isLoaded, isSignedIn])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Signing you in...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
  },
  text: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.base,
  },
})
