/**
 * LeaderboardRow — Individual row in the leaderboard
 *
 * Shows rank, profile info, points, accuracy, and title.
 * Top 3 get special podium styling with medal colors.
 *
 * LAYOUT:
 * +--------------------------------------------------+
 * |  #1  Marcus Chen          42 pts  ·  80%         |
 * |       "The Oracle"                               |
 * +--------------------------------------------------+
 */
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
} from "@/constants/theme"
import { LEADERBOARD_TITLES } from "@/types/database"
import type { LeaderboardEntry } from "@/types/database"

interface LeaderboardRowProps {
  entry: LeaderboardEntry
  isCurrentUser: boolean
}

// Medal colors for top 3
const MEDAL_COLORS: Record<number, string> = {
  1: "#FFD700", // Gold
  2: "#C0C0C0", // Silver
  3: "#CD7F32", // Bronze
}

const MEDAL_ICONS: Record<number, string> = {
  1: "trophy",
  2: "medal",
  3: "medal-outline",
}

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
      return Colors.foregroundMuted
  }
}

export function LeaderboardRow({ entry, isCurrentUser }: LeaderboardRowProps) {
  const medalColor = MEDAL_COLORS[entry.rank]
  const isTopThree = entry.rank <= 3

  return (
    <View
      style={[
        styles.row,
        isCurrentUser && styles.currentUserRow,
        isTopThree && styles.topThreeRow,
      ]}
    >
      {/* Rank */}
      <View style={styles.rankContainer}>
        {isTopThree ? (
          <Ionicons
            name={MEDAL_ICONS[entry.rank] as any}
            size={24}
            color={medalColor}
          />
        ) : (
          <Text style={styles.rankText}>{entry.rank}</Text>
        )}
      </View>

      {/* Profile info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.name, isCurrentUser && styles.currentUserName]}
            numberOfLines={1}
          >
            {entry.profile.display_name}
          </Text>
          {isCurrentUser && <Text style={styles.youLabel}>You</Text>}
        </View>
        <Text style={[styles.title, { color: getTitleColor(entry.title) }]}>
          {entry.title}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={[styles.points, isTopThree && { color: medalColor }]}>
          {entry.total_points} pts
        </Text>
        <Text style={styles.accuracy}>{entry.accuracy}% acc</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  currentUserRow: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  topThreeRow: {
    paddingVertical: Spacing.lg,
  },

  rankContainer: {
    width: 32,
    alignItems: "center",
  },
  rankText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.base,
    fontWeight: "700",
  },

  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  name: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: "600",
    flexShrink: 1,
  },
  currentUserName: {
    color: Colors.primaryLight,
  },
  youLabel: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    fontStyle: "italic",
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    marginTop: 2,
  },

  stats: {
    alignItems: "flex-end",
  },
  points: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  accuracy: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
})
