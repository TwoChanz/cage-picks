/**
 * Auth Screen — Sign In / Sign Up
 *
 * In the web version, Clerk provided pre-built <SignIn /> and <SignUp />
 * components. In React Native, Clerk provides useSignIn() and useSignUp()
 * hooks, and we build our own UI.
 *
 * For the MVP, we use Clerk's OAuth providers (Google, Apple) for
 * one-tap sign-in. This is the simplest auth flow for users —
 * no passwords, no email verification.
 *
 * Note: Clerk's Expo SDK also supports <SignedIn>/<SignedOut> components
 * for conditional rendering, which we use in the root layout.
 */
import { View, Text, StyleSheet, Pressable, Platform } from "react-native"
import { useSSO } from "@clerk/clerk-expo"
import { useRouter } from "expo-router"
import * as Linking from "expo-linking"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"

export default function AuthScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      {/* Hero section */}
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Ionicons name="flash" size={32} color={Colors.primary} />
        </View>

        <Text style={styles.title}>FightNight OS</Text>
        <Text style={styles.tagline}>
          Track fights. Follow favorites. Run the night.
        </Text>
      </View>

      {/* Auth buttons */}
      <View style={styles.buttonGroup}>
        <SSOButton
          strategy="oauth_google"
          icon="logo-google"
          label="Continue with Google"
        />
        <SSOButton
          strategy="oauth_apple"
          icon="logo-apple"
          label="Continue with Apple"
        />
      </View>

      {/* Features list */}
      <View style={styles.features}>
        <FeatureRow icon="calendar-outline" text="Live event tracking & countdowns" />
        <FeatureRow icon="people-outline" text="Create groups with your crew" />
        <FeatureRow icon="flash-outline" text="Predict fight winners" />
        <FeatureRow icon="trophy-outline" text="Earn titles on the leaderboard" />
      </View>
    </View>
  )
}

/**
 * SSO Button — triggers OAuth sign-in with a provider (Google, Apple, etc.)
 */
function SSOButton({
  strategy,
  icon,
  label,
}: {
  strategy: "oauth_google" | "oauth_apple"
  icon: React.ComponentProps<typeof Ionicons>["name"]
  label: string
}) {
  const { startSSOFlow } = useSSO()
  const router = useRouter()

  const handlePress = async () => {
    try {
      // On web, Clerk needs a redirect URL for the OAuth callback.
      // On native, expo-auth-session handles this via deep links.
      const redirectUrl = Platform.OS === "web"
        ? `${window.location.origin}/sso-callback`
        : Linking.createURL("/sso-callback")

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
        redirectUrlComplete: Platform.OS === "web"
          ? `${window.location.origin}/sso-callback`
          : undefined,
      })
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })
        router.replace("/(tabs)/events")
      }
    } catch (err) {
      // User cancelled or error occurred — just stay on auth screen
      console.log("SSO error:", err)
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.ssoButton,
        pressed && styles.ssoButtonPressed,
      ]}
      onPress={handlePress}
    >
      <Ionicons name={icon} size={20} color={Colors.foreground} />
      <Text style={styles.ssoButtonText}>{label}</Text>
    </Pressable>
  )
}

/**
 * Feature row — small icon + text for the features list
 */
function FeatureRow({
  icon,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"]
  text: string
}) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name={icon} size={18} color={Colors.primary} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing["2xl"],
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.primary,
    fontSize: FontSize["3xl"],
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.base,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  buttonGroup: {
    gap: Spacing.md,
    marginBottom: Spacing["3xl"],
  },
  ssoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  ssoButtonPressed: {
    backgroundColor: Colors.surfaceLight,
  },
  ssoButtonText: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: "600",
  },
  features: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },
})
