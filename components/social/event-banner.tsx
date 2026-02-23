/**
 * Event Banner — shown on Group Detail
 *
 * 5 states via discriminated union:
 * - no_event: muted text
 * - picks_open: event name + countdown + CTA
 * - picks_locked: event name + lock icon
 * - live: event name + red dot + fight count
 * - between_events: last event + next event teaser
 */
import { View, Text, StyleSheet, Pressable } from "react-native"
import { router, type Href } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import type { EventBannerState } from "@/lib/groups"
import type { Event } from "@/types/database"

interface Props {
  state: EventBannerState
  event: Event | null
}

export function EventBanner({ state, event }: Props) {
  const navigateToEvent = () => {
    if (event?.slug) {
      router.push(`/(tabs)/events/${event.slug}` as Href)
    }
  }

  if (state.type === "no_event") {
    return (
      <View style={styles.container}>
        <Ionicons name="calendar-outline" size={20} color={Colors.foregroundMuted} />
        <Text style={styles.mutedText}>No upcoming events</Text>
      </View>
    )
  }

  if (state.type === "picks_open") {
    return (
      <View style={styles.container}>
        <View style={styles.topLine}>
          <Ionicons name="calendar" size={16} color={Colors.accent} />
          <Text style={styles.eventName} numberOfLines={1}>{state.event.name}</Text>
        </View>
        <Text style={styles.countdownText}>
          Picks lock in {state.daysUntilLock} {state.daysUntilLock === 1 ? "day" : "days"}
        </Text>
        <Pressable style={styles.ctaButton} onPress={navigateToEvent}>
          <Text style={styles.ctaText}>Make Your Picks</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.white} />
        </Pressable>
      </View>
    )
  }

  if (state.type === "picks_locked") {
    return (
      <View style={styles.container}>
        <View style={styles.topLine}>
          <Ionicons name="lock-closed" size={16} color={Colors.foregroundMuted} />
          <Text style={styles.eventName} numberOfLines={1}>{state.event.name}</Text>
        </View>
        <Text style={styles.mutedText}>Picks locked</Text>
      </View>
    )
  }

  if (state.type === "live") {
    return (
      <Pressable style={styles.container} onPress={navigateToEvent}>
        <View style={styles.topLine}>
          <View style={styles.liveDot} />
          <Text style={styles.liveLabel}>LIVE</Text>
          <Text style={styles.eventName} numberOfLines={1}>{state.event.name}</Text>
        </View>
        <Text style={styles.liveDetail}>
          {state.fightsCompleted} of {state.fightsTotal} fights completed
        </Text>
      </Pressable>
    )
  }

  // between_events
  return (
    <View style={styles.container}>
      {state.lastEventName && (
        <Text style={styles.mutedText}>Last: {state.lastEventName}</Text>
      )}
      <Text style={styles.mutedText}>Next event announced soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  eventName: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: "600",
    flex: 1,
  },
  countdownText: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  mutedText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  ctaText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.live,
  },
  liveLabel: {
    color: Colors.live,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  liveDetail: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },
})
