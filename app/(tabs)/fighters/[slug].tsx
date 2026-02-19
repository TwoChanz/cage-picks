/**
 * Fighter Detail Screen — Full profile for a single fighter
 *
 * Reached by tapping a FighterCard on the list screen.
 * Displays comprehensive fighter information including stats,
 * win method breakdown, and a favorite toggle.
 *
 * LAYOUT:
 * +--------------------------------------------------+
 * |  [person-circle icon]                             |
 * |  Islam Makhachev                                  |
 * |  "The Eagle's Protege"                            |
 * |  27-1-0 (1 NC)                                   |
 * |  [Heart Favorite Toggle]                          |
 * |                                                   |
 * |  ── Stats ──                                      |
 * |  Height: 5'10" (178 cm)                          |
 * |  Reach: 70" (178 cm)                             |
 * |  Stance: Southpaw                                |
 * |  Division: Lightweight                            |
 * |                                                   |
 * |  ── Win Method Breakdown ──                       |
 * |  KO/TKO   ████████░░░░░░  18%                   |
 * |  SUB      ██████████████  41%                    |
 * |  DEC      ██████████████  41%                    |
 * |                                                   |
 * |  ── Win Streak ──                                |
 * |  [flame] 15 fight win streak                     |
 * +--------------------------------------------------+
 *
 * DYNAMIC ROUTING:
 * [slug] in the file name means this is a dynamic route.
 * /fighters/islam-makhachev -> slug = "islam-makhachev"
 */
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native"
import { useLocalSearchParams, useRouter, Stack } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
} from "@/constants/theme"
import { getFighterBySlug } from "@/lib/fighters"
import type { Fighter } from "@/types/database"

export default function FighterDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const [fighter, setFighter] = useState<Fighter | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!slug) return

    getFighterBySlug(slug)
      .then((data) => setFighter(data))
      .catch((err) => console.error("Failed to fetch fighter:", err))
      .finally(() => setIsLoading(false))
  }, [slug])

  // ── Loading state ──
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  // ── Not found state ──
  if (!fighter) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="person-outline"
          size={48}
          color={Colors.foregroundMuted}
        />
        <Text style={styles.notFoundTitle}>Fighter Not Found</Text>
        <Text style={styles.notFoundSubtitle}>
          This fighter doesn&apos;t exist or may have been removed.
        </Text>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Fighters</Text>
        </Pressable>
      </View>
    )
  }

  const record = `${fighter.record_wins}-${fighter.record_losses}-${fighter.record_draws}`
  const hasNc = fighter.record_nc > 0

  return (
    <>
      {/* Dynamic header title */}
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: fighter.name,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.foreground,
          headerBackTitle: "Fighters",
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* ── Hero section ── */}
        <View style={styles.heroSection}>
          <Ionicons
            name="person-circle"
            size={96}
            color={Colors.foregroundMuted}
          />

          <Text style={styles.fighterName}>{fighter.name}</Text>

          {fighter.nickname && (
            <Text style={styles.nickname}>
              &quot;{fighter.nickname}&quot;
            </Text>
          )}

          <Text style={styles.record}>
            {record}
            {hasNc && (
              <Text style={styles.recordNc}>
                {" "}({fighter.record_nc} NC)
              </Text>
            )}
          </Text>

          {/* Favorite toggle */}
          <Pressable
            style={[
              styles.favoriteToggle,
              isFavorite && styles.favoriteToggleActive,
            ]}
            onPress={() => setIsFavorite((prev) => !prev)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? Colors.white : Colors.primary}
            />
            <Text
              style={[
                styles.favoriteToggleText,
                isFavorite && styles.favoriteToggleTextActive,
              ]}
            >
              {isFavorite ? "Favorited" : "Add to Favorites"}
            </Text>
          </Pressable>
        </View>

        {/* ── Stats section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            <StatRow
              label="Division"
              value={fighter.weight_class ?? "Unknown"}
            />
            <StatRow
              label="Height"
              value={
                fighter.height_cm
                  ? `${cmToFeetInches(fighter.height_cm)} (${fighter.height_cm} cm)`
                  : "N/A"
              }
            />
            <StatRow
              label="Reach"
              value={
                fighter.reach_cm
                  ? `${cmToInches(fighter.reach_cm)}" (${fighter.reach_cm} cm)`
                  : "N/A"
              }
            />
            <StatRow
              label="Stance"
              value={fighter.stance ?? "Unknown"}
            />
          </View>
        </View>

        {/* ── Win Method Breakdown ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Win Method Breakdown</Text>
          <View style={styles.breakdownContainer}>
            <BreakdownBar
              label="KO/TKO"
              percentage={fighter.ko_percentage}
              color={Colors.primary}
            />
            <BreakdownBar
              label="Submission"
              percentage={fighter.sub_percentage}
              color={Colors.fighterA}
            />
            <BreakdownBar
              label="Decision"
              percentage={fighter.dec_percentage}
              color={Colors.accent}
            />
          </View>
        </View>

        {/* ── Win Streak ── */}
        {fighter.current_win_streak > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Win Streak</Text>
            <View style={styles.streakCard}>
              <Ionicons name="flame" size={28} color={Colors.accent} />
              <View style={styles.streakInfo}>
                <Text style={styles.streakNumber}>
                  {fighter.current_win_streak}
                </Text>
                <Text style={styles.streakLabel}>fight win streak</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </>
  )
}

// ── Sub-components ──

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  )
}

function BreakdownBar({
  label,
  percentage,
  color,
}: {
  label: string
  percentage: number
  color: string
}) {
  return (
    <View style={styles.barContainer}>
      <View style={styles.barLabelRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barPercentage}>{percentage}%</Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.max(percentage, 2)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  )
}

// ── Utility functions ──

function cmToFeetInches(cm: number): string {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
}

function cmToInches(cm: number): string {
  return Math.round(cm / 2.54).toString()
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing["5xl"],
  },

  // Centered states
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  notFoundTitle: {
    color: Colors.foreground,
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
  notFoundSubtitle: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },

  // Hero section
  heroSection: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing["2xl"],
    gap: Spacing.xs,
  },
  fighterName: {
    color: Colors.foreground,
    fontSize: FontSize["2xl"],
    fontWeight: "800",
    letterSpacing: -0.3,
    marginTop: Spacing.sm,
  },
  nickname: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.base,
    fontStyle: "italic",
  },
  record: {
    color: Colors.foreground,
    fontSize: FontSize.xl,
    fontWeight: "700",
    marginTop: Spacing.xs,
  },
  recordNc: {
    color: Colors.foregroundMuted,
    fontWeight: "400",
  },

  // Favorite toggle button
  favoriteToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  favoriteToggleActive: {
    backgroundColor: Colors.primary,
  },
  favoriteToggleText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  favoriteToggleTextActive: {
    color: Colors.white,
  },

  // Section containers
  section: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },

  // Stats grid
  statsGrid: {
    gap: Spacing.md,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statLabel: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },
  statValue: {
    color: Colors.foreground,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },

  // Win method breakdown bars
  breakdownContainer: {
    gap: Spacing.md,
  },
  barContainer: {
    gap: Spacing.xs,
  },
  barLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barLabel: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },
  barPercentage: {
    color: Colors.foreground,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  barTrack: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },

  // Win streak
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  streakInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
  },
  streakNumber: {
    color: Colors.accent,
    fontSize: FontSize["2xl"],
    fontWeight: "800",
  },
  streakLabel: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.base,
  },
})
