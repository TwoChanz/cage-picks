/**
 * Profile Screen — Shows user info and sign-out button
 *
 * This is functional now (not just a placeholder) because it
 * needs to show the signed-in user and allow sign-out.
 */
import { View, Text, StyleSheet, Pressable } from "react-native"
import { useUser, useAuth } from "@clerk/clerk-expo"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"

export default function ProfileScreen() {
  const { user } = useUser()
  const { signOut } = useAuth()

  return (
    <View style={styles.container}>
      {/* User info card */}
      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={32} color={Colors.foregroundMuted} />
        </View>

        <Text style={styles.name}>
          {user?.firstName ?? user?.username ?? "Fighter"}
        </Text>
        <Text style={styles.email}>
          {user?.primaryEmailAddress?.emailAddress ?? ""}
        </Text>
        <Text style={styles.title}>Fight Fan</Text>
      </View>

      {/* Stats placeholder */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <Text style={styles.subtitle}>
          Prediction stats will appear here after Phase 4
        </Text>
      </View>

      {/* Sign out button */}
      <Pressable
        style={({ pressed }) => [
          styles.signOutButton,
          pressed && styles.signOutButtonPressed,
        ]}
        onPress={() => signOut()}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors.primary} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  name: {
    color: Colors.foreground,
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
  email: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  title: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: "600",
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: Spacing.lg,
  },
  signOutButtonPressed: {
    backgroundColor: Colors.surfaceLight,
  },
  signOutText: {
    color: Colors.primary,
    fontSize: FontSize.base,
    fontWeight: "600",
  },
})
