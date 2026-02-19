/**
 * Profile Screen — User info, stats, prediction history, sign-out
 *
 * Shows the signed-in user's info, prediction stats grid,
 * recent prediction history, and sign-out button.
 *
 * DATA FLOW:
 * 1. Screen mounts → fetches user stats + prediction history
 * 2. Stats grid shows accuracy, points, streak, title
 * 3. History list shows recent picks with correct/incorrect indicators
 */
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native"
import { useUser, useAuth } from "@clerk/clerk-expo"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import {
  getUserStats,
  getPredictionHistory,
  type UserStats,
  type PredictionHistoryItem,
} from "@/lib/profile"
import { LEADERBOARD_TITLES } from "@/types/database"

// Mock profile ID for development
const MOCK_PROFILE_ID = "mock-profile-1"

function getTitleColor(title: string): string {
  switch (title) {
    case LEADERBOARD_TITLES.ORACLE:
      return "#FFD700"
    case LEADERBOARD_TITLES.ANALYST:
      return Colors.accent
    case LEADERBOARD_TITLES.CASUAL:
      return Colors.foregroundMuted
    case LEADERBOARD_TITLES.BLIND:
      return Colors.primary
    default:
      return Colors.accent
  }
}

export default function ProfileScreen() {
  const { user } = useUser()
  const { signOut } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [history, setHistory] = useState<PredictionHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getUserStats(MOCK_PROFILE_ID),
      getPredictionHistory(MOCK_PROFILE_ID),
    ])
      .then(([s, h]) => {
        setStats(s)
        setHistory(h)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
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

        {stats && (
          <View style={styles.titleBadge}>
            <Text
              style={[styles.titleText, { color: getTitleColor(stats.title) }]}
            >
              {stats.title}
            </Text>
          </View>
        )}
      </View>

      {/* Stats grid */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Stats</Text>

        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={Colors.primary}
            style={{ marginVertical: Spacing.lg }}
          />
        ) : stats ? (
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.correct_predictions}/{stats.total_predictions}
              </Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.accent }]}>
                {stats.current_streak}
              </Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>No stats yet</Text>
        )}
      </View>

      {/* Prediction history */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Picks</Text>

        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={Colors.primary}
            style={{ marginVertical: Spacing.lg }}
          />
        ) : history.length > 0 ? (
          <View style={styles.historyList}>
            {history.map((item, index) => (
              <View key={item.id}>
                {/* Show event name header when it changes */}
                {(index === 0 ||
                  item.event_name !== history[index - 1].event_name) && (
                  <Text style={styles.eventHeader}>{item.event_name}</Text>
                )}

                <View style={styles.historyRow}>
                  {/* Result indicator */}
                  <View style={styles.resultIcon}>
                    {item.is_correct === null ? (
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color={Colors.foregroundMuted}
                      />
                    ) : item.is_correct ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={Colors.success}
                      />
                    ) : (
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={Colors.primary}
                      />
                    )}
                  </View>

                  {/* Pick info */}
                  <View style={styles.pickInfo}>
                    <Text style={styles.pickFighter}>
                      {item.fighter_picked}
                    </Text>
                    <Text style={styles.pickOpponent}>
                      vs {item.opponent}
                    </Text>
                  </View>

                  {/* Points */}
                  {item.is_correct !== null && (
                    <Text
                      style={[
                        styles.pickPoints,
                        item.is_correct
                          ? { color: Colors.success }
                          : { color: Colors.foregroundMuted },
                      ]}
                    >
                      {item.is_correct ? `+${item.points_earned}` : "0"}
                    </Text>
                  )}
                  {item.is_correct === null && (
                    <Text style={styles.pickPending}>Pending</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            No predictions yet. Pick some winners!
          </Text>
        )}
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing["5xl"],
  },

  // Cards
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
  titleBadge: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  titleText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
  },

  // Section titles
  sectionTitle: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    width: "100%",
  },
  statItem: {
    flex: 1,
    minWidth: "40%",
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  statValue: {
    color: Colors.foreground,
    fontSize: FontSize["2xl"],
    fontWeight: "800",
  },
  statLabel: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    fontWeight: "600",
    marginTop: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // History
  historyList: {
    width: "100%",
  },
  eventHeader: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  resultIcon: {
    width: 24,
    alignItems: "center",
  },
  pickInfo: {
    flex: 1,
  },
  pickFighter: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: "600",
  },
  pickOpponent: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },
  pickPoints: {
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  pickPending: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    fontStyle: "italic",
  },

  // Empty state
  emptyText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
  },

  // Sign out
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
