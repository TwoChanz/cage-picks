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
 */
import { View, Text, StyleSheet } from "react-native"
import { Colors, FontSize, Spacing } from "@/constants/theme"
import { FightRow } from "./fight-row"
import type { FightWithFighters, CardPosition } from "@/types/database"

interface FightCardProps {
  fights: FightWithFighters[]
  /** If true, show all fights. If false, show only main card fights. */
  showFull?: boolean
}

/** Display labels for each card position */
const SECTION_LABELS: Record<CardPosition, string> = {
  main: "Main Card",
  prelim: "Prelims",
  "early-prelim": "Early Prelims",
}

/** The order sections should appear in */
const SECTION_ORDER: CardPosition[] = ["main", "prelim", "early-prelim"]

export function FightCard({ fights, showFull = false }: FightCardProps) {
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
              {sectionFights.map((fight) => (
                <FightRow key={fight.id} fight={fight} />
              ))}
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
