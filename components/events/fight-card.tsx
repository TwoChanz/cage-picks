/**
 * FightCard — Full fight card for an event, grouped by card position
 *
 * Takes an array of fights and groups them into sections:
 * 1. Main Card (the headliners)
 * 2. Prelims (mid-card fights)
 * 3. Early Prelims (opening fights)
 *
 * Each section has a header and renders FightRow for each fight.
 * Empty sections are hidden.
 *
 * When prediction props are provided, each FightRow becomes interactive —
 * users can tap a fighter side to pick their winner.
 */
import { View, Text, StyleSheet } from "react-native"
import { Colors, FontSize, Spacing } from "@/constants/theme"
import { FightRow } from "./fight-row"
import { isFightLocked } from "@/lib/predictions"
import type { FightWithFighters, CardPosition, Prediction } from "@/types/database"

interface FightCardProps {
  fights: FightWithFighters[]
  /** If true, show all fights. If false, show only main card fights. */
  showFull?: boolean
  /** Map of fight_id → Prediction for the current user */
  predictions?: Map<string, Prediction>
  /** Called when user picks a fighter for a fight */
  onPickFighter?: (fightId: string, fighterId: string) => void
}

/** Display labels for each card position */
const SECTION_LABELS: Record<CardPosition, string> = {
  main: "Main Card",
  prelim: "Prelims",
  "early-prelim": "Early Prelims",
}

/** The order sections should appear in */
const SECTION_ORDER: CardPosition[] = ["main", "prelim", "early-prelim"]

export function FightCard({
  fights,
  showFull = false,
  predictions,
  onPickFighter,
}: FightCardProps) {
  // Group fights by their card position
  const grouped = new Map<CardPosition, FightWithFighters[]>()
  for (const fight of fights) {
    const position = fight.card_position as CardPosition
    const list = grouped.get(position) ?? []
    list.push(fight)
    grouped.set(position, list)
  }

  // Determine which sections to show
  const sectionsToShow = showFull
    ? SECTION_ORDER
    : SECTION_ORDER.filter((pos) => pos === "main")

  return (
    <View style={styles.container}>
      {sectionsToShow.map((position) => {
        const sectionFights = grouped.get(position)
        if (!sectionFights?.length) return null

        return (
          <View key={position} style={styles.section}>
            {/* Section header */}
            <View style={styles.sectionHeader}>
              <View style={styles.headerLine} />
              <Text style={styles.sectionTitle}>
                {SECTION_LABELS[position]}
              </Text>
              <View style={styles.headerLine} />
            </View>

            {/* Fights in this section */}
            <View style={styles.fightsList}>
              {sectionFights.map((fight) => {
                const prediction = predictions?.get(fight.id)
                const locked = isFightLocked(fight.status)

                return (
                  <FightRow
                    key={fight.id}
                    fight={fight}
                    pickedFighterId={prediction?.picked_fighter_id ?? null}
                    onPickFighter={
                      onPickFighter
                        ? (fighterId) => onPickFighter(fight.id, fighterId)
                        : undefined
                    }
                    isLocked={locked}
                    isCorrect={prediction?.is_correct}
                  />
                )
              })}
            </View>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  fightsList: {
    gap: Spacing.sm,
  },
})
