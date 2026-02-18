/**
 * FightRow — A single fight matchup between two fighters
 *
 * LAYOUT:
 * ┌──────────────────────────────────────────────┐
 * │  [MAIN EVENT badge if applicable]            │
 * │  Fighter A Name        vs    Fighter B Name  │
 * │  27-1-0               ⚡      22-3-0         │
 * │         Lightweight · 5 Rounds               │
 * └──────────────────────────────────────────────┘
 *
 * The fighter names are left-aligned and right-aligned with "vs" centered.
 * Main events get a highlighted badge and subtle glow.
 */
import { View, Text, StyleSheet } from "react-native"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import { formatRecord } from "@/lib/utils"
import type { FightWithFighters } from "@/types/database"

interface FightRowProps {
  fight: FightWithFighters
}

export function FightRow({ fight }: FightRowProps) {
  const { fighter_a, fighter_b } = fight

  return (
    <View style={[styles.container, fight.is_main_event && styles.mainEvent]}>
      {/* Main Event badge */}
      {fight.is_main_event && (
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>MAIN EVENT</Text>
          </View>
          {fight.scheduled_rounds === 5 && (
            <Text style={styles.roundsBadge}>5 RDS</Text>
          )}
        </View>
      )}

      {/* Fighter matchup */}
      <View style={styles.matchup}>
        {/* Fighter A (left side) */}
        <View style={styles.fighterSide}>
          <Text style={styles.fighterName} numberOfLines={1}>
            {fighter_a.name}
          </Text>
          <Text style={styles.record}>
            {formatRecord(
              fighter_a.record_wins,
              fighter_a.record_losses,
              fighter_a.record_draws,
              fighter_a.record_nc
            )}
          </Text>
          {fighter_a.nickname && (
            <Text style={styles.nickname} numberOfLines={1}>
              &quot;{fighter_a.nickname}&quot;
            </Text>
          )}
        </View>

        {/* VS divider */}
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>vs</Text>
        </View>

        {/* Fighter B (right side) */}
        <View style={[styles.fighterSide, styles.fighterRight]}>
          <Text style={[styles.fighterName, styles.textRight]} numberOfLines={1}>
            {fighter_b.name}
          </Text>
          <Text style={[styles.record, styles.textRight]}>
            {formatRecord(
              fighter_b.record_wins,
              fighter_b.record_losses,
              fighter_b.record_draws,
              fighter_b.record_nc
            )}
          </Text>
          {fighter_b.nickname && (
            <Text style={[styles.nickname, styles.textRight]} numberOfLines={1}>
              &quot;{fighter_b.nickname}&quot;
            </Text>
          )}
        </View>
      </View>

      {/* Weight class and round info (below the matchup) */}
      <View style={styles.infoRow}>
        {fight.weight_class && (
          <Text style={styles.infoText}>{fight.weight_class}</Text>
        )}
        {!fight.is_main_event && fight.scheduled_rounds && (
          <Text style={styles.infoText}>
            · {fight.scheduled_rounds} Rounds
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mainEvent: {
    borderColor: Colors.primary + "40",
    // Subtle red glow for main events (shadow works on iOS, elevation on Android)
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },

  // Badge row
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.primary + "25",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  roundsBadge: {
    color: Colors.foregroundMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Fighter matchup
  matchup: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  fighterSide: {
    flex: 1,
  },
  fighterRight: {
    alignItems: "flex-end",
  },
  fighterName: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  record: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  nickname: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontStyle: "italic",
    marginTop: 2,
  },
  textRight: {
    textAlign: "right",
  },

  // VS divider
  vsContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  vsText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    fontWeight: "600",
    fontStyle: "italic",
  },

  // Info row
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  infoText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
  },
})
