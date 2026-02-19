/**
 * EventCard — The primary card for displaying a UFC event
 *
 * This is the main component on the Events screen. It composes all
 * the sub-components we built (CountdownTimer, FightCard, RemindMe,
 * AddToCalendar) into a single cohesive card.
 *
 * LAYOUT:
 * ┌─────────────────────────────────────────────────────┐
 * │  UFC 314: Makhachev vs. Tsarukyan 2                 │
 * │  📍 T-Mobile Arena, Las Vegas, NV                   │
 * │  📅 Sat, Mar 8 · 6:00 PM                           │
 * │                                                     │
 * │  [ 18 ] : [ 05 ] : [ 32 ] : [ 17 ]                │
 * │   days     hrs      min      sec                    │
 * │                                                     │
 * │  [🔔 Remind Me]  [📅 Calendar]                     │
 * │                                                     │
 * │  ── Main Card ───────────────────────               │
 * │  Makhachev      vs      Tsarukyan                  │
 * │    27-1-0                  22-3-0                   │
 * │         Lightweight · 5 Rounds                      │
 * │                                                     │
 * │  ... more fights ...                                │
 * │                                                     │
 * │         [ View Full Card → ]                        │
 * └─────────────────────────────────────────────────────┘
 */
import { View, Text, StyleSheet, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import { formatEventDate } from "@/lib/utils"
import { CountdownTimer } from "./countdown-timer"
import { FightCard } from "./fight-card"
import { RemindMeToggle } from "./remind-me-toggle"
import { AddToCalendarButton } from "./add-to-calendar-button"
import type { EventWithFights } from "@/lib/events"
import type { Prediction } from "@/types/database"

interface EventCardProps {
  event: EventWithFights
  /** Show full fight card (all sections) or just main card preview */
  showFullCard?: boolean
  /** Map of fight_id → Prediction for the current user */
  predictions?: Map<string, Prediction>
  /** Called when user picks a fighter for a fight */
  onPickFighter?: (fightId: string, fighterId: string) => void
}

export function EventCard({
  event,
  showFullCard = false,
  predictions,
  onPickFighter,
}: EventCardProps) {
  const router = useRouter()

  return (
    <View style={styles.card}>
      {/* ── Event Name ── */}
      <Text style={styles.eventName}>{event.name}</Text>

      {/* ── Location and Date ── */}
      <View style={styles.metaRow}>
        {event.location && (
          <View style={styles.metaItem}>
            <Ionicons
              name="location-outline"
              size={14}
              color={Colors.foregroundMuted}
            />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <Ionicons
            name="time-outline"
            size={14}
            color={Colors.foregroundMuted}
          />
          <Text style={styles.metaText}>{formatEventDate(event.date)}</Text>
        </View>
      </View>

      {/* ── Countdown Timer ── */}
      <View style={styles.countdownWrapper}>
        <CountdownTimer
          targetDate={event.date}
          eventStatus={event.status}
        />
      </View>

      {/* ── Action Buttons (Remind Me + Calendar) ── */}
      <View style={styles.actionRow}>
        <RemindMeToggle
          eventSlug={event.slug}
          eventName={event.name}
          eventDate={event.date}
        />
        <AddToCalendarButton
          eventName={event.name}
          eventDate={event.date}
          eventLocation={event.location}
        />
      </View>

      {/* ── Fight Card ── */}
      {event.fights.length > 0 && (
        <View style={styles.fightCardWrapper}>
          <FightCard
            fights={event.fights}
            showFull={showFullCard}
            predictions={predictions}
            onPickFighter={onPickFighter}
          />
        </View>
      )}

      {/* ── "View Full Card" link (only on list view, not detail) ── */}
      {!showFullCard && event.fights.length > 0 && (
        <Pressable
          style={({ pressed }) => [
            styles.viewFullButton,
            pressed && styles.viewFullButtonPressed,
          ]}
          onPress={() => router.push(`/(tabs)/events/${event.slug}`)}
        >
          <Text style={styles.viewFullText}>View Full Card</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.primary}
          />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },

  // Event name
  eventName: {
    color: Colors.foreground,
    fontSize: FontSize.xl,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  // Location & date
  metaRow: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  metaText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },

  // Countdown
  countdownWrapper: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },

  // Action buttons
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },

  // Fight card
  fightCardWrapper: {
    marginTop: Spacing.lg,
  },

  // View full card button
  viewFullButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  viewFullButtonPressed: {
    opacity: 0.6,
  },
  viewFullText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
})
