/**
 * FighterCard — List item for the Fighters screen
 *
 * Displays a fighter's name, nickname, record, weight class,
 * win streak indicator, and a favorite toggle. Tapping the card
 * navigates to the fighter detail screen.
 *
 * LAYOUT:
 * +--------------------------------------------------+
 * |  [Icon]  Islam Makhachev              [Heart]     |
 * |          "The Eagle's Protege"                    |
 * |          27-1-0  |  Lightweight  |  15W streak    |
 * +--------------------------------------------------+
 */
import { View, Text, StyleSheet, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
} from "@/constants/theme"
import type { Fighter } from "@/types/database"

interface FighterCardProps {
  fighter: Fighter
  isFavorite: boolean
  onToggleFavorite: (fighterId: string) => void
}

export function FighterCard({
  fighter,
  isFavorite,
  onToggleFavorite,
}: FighterCardProps) {
  const router = useRouter()

  const record = `${fighter.record_wins}-${fighter.record_losses}-${fighter.record_draws}`

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => router.push(`/(tabs)/fighters/${fighter.slug}`)}
    >
      {/* Left section: avatar placeholder */}
      <View style={styles.avatar}>
        <Ionicons
          name="person-circle"
          size={48}
          color={Colors.foregroundMuted}
        />
      </View>

      {/* Center section: fighter info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {fighter.name}
        </Text>

        {fighter.nickname && (
          <Text style={styles.nickname} numberOfLines={1}>
            &quot;{fighter.nickname}&quot;
          </Text>
        )}

        <View style={styles.metaRow}>
          {/* Record */}
          <Text style={styles.record}>{record}</Text>

          {/* Weight class badge */}
          {fighter.weight_class && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{fighter.weight_class}</Text>
            </View>
          )}

          {/* Win streak */}
          {fighter.current_win_streak > 0 && (
            <View style={styles.streakContainer}>
              <Ionicons
                name="flame"
                size={12}
                color={Colors.accent}
              />
              <Text style={styles.streakText}>
                {fighter.current_win_streak}W
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Right section: favorite toggle */}
      <Pressable
        style={styles.favoriteButton}
        onPress={() => onToggleFavorite(fighter.id)}
        hitSlop={12}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={22}
          color={isFavorite ? Colors.primary : Colors.foregroundMuted}
        />
      </Pressable>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  cardPressed: {
    backgroundColor: Colors.surfaceLight,
  },

  // Avatar placeholder
  avatar: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  // Fighter info
  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  name: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
  nickname: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    fontStyle: "italic",
  },

  // Meta row: record, badge, streak
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    flexWrap: "wrap",
  },
  record: {
    color: Colors.foreground,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  streakText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },

  // Favorite button
  favoriteButton: {
    padding: Spacing.xs,
  },
})
