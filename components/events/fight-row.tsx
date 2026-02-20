/**
 * FightRow — A single fight matchup between two fighters
 *
 * LAYOUT (without predictions):
 * ┌──────────────────────────────────────────────┐
 * │  [MAIN EVENT badge if applicable]            │
 * │  Fighter A Name        vs    Fighter B Name  │
 * │  27-1-0               ⚡      22-3-0         │
 * │         Lightweight · 5 Rounds               │
 * └──────────────────────────────────────────────┘
 *
 * LAYOUT (with predictions enabled):
 * ┌──────────────────────────────────────────────┐
 * │  [MAIN EVENT]                                │
 * │  ┌─PickA─────┐   vs   ┌─PickB─────┐        │
 * │  │ Fighter A  │        │ Fighter B  │        │
 * │  │ 27-1-0     │        │   22-3-0   │        │
 * │  │ YOUR PICK ✓│        │            │        │
 * │  └────────────┘        └────────────┘        │
 * │         Lightweight · 5 Rounds               │
 * └──────────────────────────────────────────────┘
 */
import { View, Text, StyleSheet, Pressable, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import { formatRecord } from "@/lib/utils"
import type { FightWithFighters } from "@/types/database"
import { getFighterImage } from "@/lib/fighter-images"

interface FightRowProps {
  fight: FightWithFighters
  /** Which fighter the user picked (null = no pick yet) */
  pickedFighterId?: string | null
  /** Called when user taps a fighter to pick them */
  onPickFighter?: (fighterId: string) => void
  /** Whether this fight is locked (started/completed — no more picks) */
  isLocked?: boolean
  /** Whether the user's prediction was correct (null = not yet scored) */
  isCorrect?: boolean | null
}

export function FightRow({
  fight,
  pickedFighterId,
  onPickFighter,
  isLocked = false,
  isCorrect,
}: FightRowProps) {
  const { fighter_a, fighter_b } = fight
  const hasPredictions = onPickFighter !== undefined
  const pickedA = pickedFighterId === fighter_a.id
  const pickedB = pickedFighterId === fighter_b.id
  const hasPick = pickedA || pickedB

  // Determine result styling for completed fights
  const showResult = isLocked && hasPick && isCorrect !== undefined && isCorrect !== null
  const resultColor = isCorrect ? Colors.success : Colors.primary

  const handlePickA = () => {
    if (!isLocked && onPickFighter) {
      onPickFighter(fighter_a.id)
    }
  }

  const handlePickB = () => {
    if (!isLocked && onPickFighter) {
      onPickFighter(fighter_b.id)
    }
  }

  const imageA = getFighterImage(fighter_a.slug)
  const imageB = getFighterImage(fighter_b.slug)

  const renderAvatar = (image: ReturnType<typeof getFighterImage>, fighter: typeof fighter_a) => {
    if (image) {
      return <Image source={image} style={styles.fighterAvatar} />
    } else if (fighter.image_url) {
      return <Image source={{ uri: fighter.image_url }} style={styles.fighterAvatar} />
    } else {
      return (
        <View style={styles.fighterAvatarPlaceholder}>
          <Ionicons name="person" size={16} color={Colors.foregroundMuted} />
        </View>
      )
    }
  }

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
        {hasPredictions ? (
          <Pressable
            style={({ pressed }) => [
              styles.fighterSide,
              styles.pickable,
              pickedA && styles.pickedSide,
              pickedA && { borderColor: Colors.fighterA + "80" },
              showResult && pickedA && { borderColor: resultColor + "80" },
              isLocked && !pickedA && styles.lockedUnpicked,
              pressed && !isLocked && styles.pickablePressed,
            ]}
            onPress={handlePickA}
            disabled={isLocked}
          >
            <View style={styles.fighterHeader}>
              {renderAvatar(imageA, fighter_a)}
              <View style={styles.fighterInfo}>
                <Text style={[styles.fighterName, pickedA && styles.pickedName]} numberOfLines={1}>
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
              </View>
            </View>
            {fighter_a.nickname && (
              <Text style={styles.nickname} numberOfLines={1}>
                &quot;{fighter_a.nickname}&quot;
              </Text>
            )}
            {pickedA && (
              <View style={styles.pickIndicator}>
                {showResult ? (
                  <Ionicons
                    name={isCorrect ? "checkmark-circle" : "close-circle"}
                    size={12}
                    color={resultColor}
                  />
                ) : isLocked ? (
                  <Ionicons name="lock-closed" size={10} color={Colors.foregroundMuted} />
                ) : null}
                <Text style={[
                  styles.pickLabel,
                  showResult && { color: resultColor },
                ]}>
                  YOUR PICK
                </Text>
              </View>
            )}
          </Pressable>
        ) : (
          <View style={styles.fighterSide}>
            <View style={styles.fighterHeader}>
              {renderAvatar(imageA, fighter_a)}
              <View style={styles.fighterInfo}>
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
              </View>
            </View>
            {fighter_a.nickname && (
              <Text style={styles.nickname} numberOfLines={1}>
                &quot;{fighter_a.nickname}&quot;
              </Text>
            )}
          </View>
        )}

        {/* VS divider */}
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>vs</Text>
        </View>

        {/* Fighter B (right side) */}
        {hasPredictions ? (
          <Pressable
            style={({ pressed }) => [
              styles.fighterSide,
              styles.fighterRight,
              styles.pickable,
              pickedB && styles.pickedSide,
              pickedB && { borderColor: Colors.fighterB + "80" },
              showResult && pickedB && { borderColor: resultColor + "80" },
              isLocked && !pickedB && styles.lockedUnpicked,
              pressed && !isLocked && styles.pickablePressed,
            ]}
            onPress={handlePickB}
            disabled={isLocked}
          >
            <View style={[styles.fighterHeader, styles.fighterHeaderRight]}>
              <View style={styles.fighterInfo}>
                <Text style={[styles.fighterName, styles.textRight, pickedB && styles.pickedName]} numberOfLines={1}>
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
              </View>
              {renderAvatar(imageB, fighter_b)}
            </View>
            {fighter_b.nickname && (
              <Text style={[styles.nickname, styles.textRight]} numberOfLines={1}>
                &quot;{fighter_b.nickname}&quot;
              </Text>
            )}
            {pickedB && (
              <View style={[styles.pickIndicator, styles.pickIndicatorRight]}>
                {showResult ? (
                  <Ionicons
                    name={isCorrect ? "checkmark-circle" : "close-circle"}
                    size={12}
                    color={resultColor}
                  />
                ) : isLocked ? (
                  <Ionicons name="lock-closed" size={10} color={Colors.foregroundMuted} />
                ) : null}
                <Text style={[
                  styles.pickLabel,
                  showResult && { color: resultColor },
                ]}>
                  YOUR PICK
                </Text>
              </View>
            )}
          </Pressable>
        ) : (
          <View style={[styles.fighterSide, styles.fighterRight]}>
            <View style={[styles.fighterHeader, styles.fighterHeaderRight]}>
              <View style={styles.fighterInfo}>
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
              </View>
              {renderAvatar(imageB, fighter_b)}
            </View>
            {fighter_b.nickname && (
              <Text style={[styles.nickname, styles.textRight]} numberOfLines={1}>
                &quot;{fighter_b.nickname}&quot;
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Weight class and round info */}
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
    alignItems: "center",
  },
  fighterSide: {
    flex: 1,
  },
  fighterRight: {
    alignItems: "flex-end",
  },
  fighterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  fighterHeaderRight: {
    justifyContent: "flex-end",
  },
  fighterInfo: {
    flex: 1,
  },
  fighterAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
  },
  fighterAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  fighterName: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  nickname: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    fontStyle: "italic",
    marginTop: 2,
  },
  record: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  textRight: {
    textAlign: "right",
  },

  // Prediction interaction styles
  pickable: {
    borderWidth: 1,
    borderColor: Colors.transparent,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginHorizontal: -Spacing.xs,
  },
  pickablePressed: {
    backgroundColor: Colors.surfaceLight,
  },
  pickedSide: {
    backgroundColor: Colors.surfaceLight,
  },
  pickedName: {
    color: Colors.foreground,
  },
  lockedUnpicked: {
    opacity: 0.5,
  },

  // Pick indicator
  pickIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: Spacing.xs,
  },
  pickIndicatorRight: {
    justifyContent: "flex-end",
  },
  pickLabel: {
    color: Colors.foregroundMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
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
