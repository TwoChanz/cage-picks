/**
 * Leaderboard Screen — Placeholder for Phase 4
 *
 * Will show: group leaderboard, public rankings, dynamic titles/badges.
 */
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"

export default function LeaderboardScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <Ionicons name="trophy-outline" size={48} color={Colors.foregroundMuted} />
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>
          See who calls fights and who picks with their eyes closed
        </Text>
        <Text style={styles.phase}>Coming in Phase 4</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing["3xl"],
    width: "100%",
    maxWidth: 320,
  },
  title: {
    color: Colors.foreground,
    fontSize: FontSize.xl,
    fontWeight: "700",
    marginTop: Spacing.md,
  },
  subtitle: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  phase: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: "600",
    marginTop: Spacing.lg,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
})
