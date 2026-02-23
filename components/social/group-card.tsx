/**
 * Group Card — shown on the Social hub
 *
 * Displays: group name, rank, member count, event context line.
 * Pressable → navigates to group detail.
 */
import { View, Text, StyleSheet, Pressable } from "react-native"
import { router, type Href } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import type { GroupCardData } from "@/types/database"

interface Props {
  group: GroupCardData
}

export function GroupCard({ group }: Props) {
  const handlePress = () => {
    router.push(`/(tabs)/social/group/${group.id}` as Href)
  }

  // Determine event context line
  const getContextLine = (): { text: string; icon: React.ComponentProps<typeof Ionicons>["name"]; color: string } => {
    if (!group.nextEvent) {
      return { text: "No upcoming events", icon: "calendar-outline", color: Colors.foregroundMuted }
    }

    const eventDate = new Date(group.nextEvent.date)
    const now = new Date()

    if (group.nextEvent.status === "live") {
      return { text: `${group.nextEvent.name} — LIVE`, icon: "radio-outline", color: Colors.live }
    }

    if (group.nextEvent.status === "completed") {
      return {
        text: group.lastEventName
          ? `Last: ${group.lastEventName}`
          : "Between events",
        icon: "checkmark-circle-outline",
        color: Colors.foregroundMuted,
      }
    }

    if (now < eventDate) {
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        text: `Picks open — ${daysUntil}d until lock`,
        icon: "time-outline",
        color: Colors.accent,
      }
    }

    return { text: "Picks locked", icon: "lock-closed-outline", color: Colors.foregroundMuted }
  }

  const context = getContextLine()

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
    >
      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={1}>{group.name}</Text>
        {group.currentUserRank !== null && (
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{group.currentUserRank}</Text>
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="people-outline" size={14} color={Colors.foregroundMuted} />
        <Text style={styles.metaText}>
          {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
        </Text>
      </View>

      <View style={styles.contextRow}>
        <Ionicons name={context.icon} size={14} color={context.color} />
        <Text style={[styles.contextText, { color: context.color }]} numberOfLines={1}>
          {context.text}
        </Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardPressed: {
    backgroundColor: Colors.surfaceLight,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: "700",
    flex: 1,
    marginRight: Spacing.sm,
  },
  rankBadge: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  rankText: {
    color: Colors.primaryLight,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  metaText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },
  contextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  contextText: {
    fontSize: FontSize.sm,
    flex: 1,
  },
})
