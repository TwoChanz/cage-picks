/**
 * Standings List — ranked member rows for group detail
 *
 * Highlights the current user row. Shows rank, avatar placeholder,
 * name, points, and accuracy percentage.
 */
import { View, Text, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import type { GroupStanding } from "@/types/database"

interface Props {
  standings: GroupStanding[]
  currentProfileId: string
}

export function StandingsList({ standings, currentProfileId }: Props) {
  if (standings.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="podium-outline" size={32} color={Colors.foregroundMuted} />
        <Text style={styles.emptyText}>
          No scores yet — make your picks on the next event!
        </Text>
      </View>
    )
  }

  const totalPoints = standings.reduce((sum, s) => sum + s.totalPoints, 0)

  return (
    <View>
      {standings.map((standing) => {
        const isCurrentUser = standing.profileId === currentProfileId
        return (
          <View
            key={standing.profileId}
            style={[styles.row, isCurrentUser && styles.rowHighlighted]}
          >
            {/* Rank */}
            <Text style={styles.rank}>
              {standing.rank <= 3 ? ["", "1", "2", "3"][standing.rank] : standing.rank}
            </Text>

            {/* Avatar */}
            {standing.avatarUrl ? (
              <Image source={{ uri: standing.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={16} color={Colors.foregroundMuted} />
              </View>
            )}

            {/* Name + accuracy */}
            <View style={styles.nameCol}>
              <Text style={styles.name} numberOfLines={1}>
                {standing.displayName}
                {isCurrentUser ? " (you)" : ""}
              </Text>
              <Text style={styles.accuracy}>
                {standing.accuracy}% accuracy
              </Text>
            </View>

            {/* Points */}
            <Text style={styles.points}>{standing.totalPoints} pts</Text>
          </View>
        )
      })}

      {totalPoints > 0 && (
        <Text style={styles.summary}>
          All-time: {totalPoints} pts across {standings.length} members
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
  },
  rowHighlighted: {
    backgroundColor: Colors.primary + "15",
  },
  rank: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.base,
    fontWeight: "700",
    width: 24,
    textAlign: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  nameCol: {
    flex: 1,
  },
  name: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: "600",
  },
  accuracy: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    marginTop: 1,
  },
  points: {
    color: Colors.accent,
    fontSize: FontSize.base,
    fontWeight: "700",
  },

  // Empty state
  empty: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
    maxWidth: 250,
  },

  // Summary
  summary: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    textAlign: "center",
    marginTop: Spacing.md,
  },
})
