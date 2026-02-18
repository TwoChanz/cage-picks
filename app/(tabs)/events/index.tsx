/**
 * Events List Screen — The main dashboard
 *
 * Shows the next 3-5 upcoming UFC events in a scrollable list.
 * Each event shows its countdown, fight card preview, and action buttons.
 *
 * DATA FLOW:
 * 1. Screen mounts → useEffect triggers
 * 2. getUpcomingEvents() queries Supabase (2 DB calls)
 * 3. Data arrives → state updates → FlatList renders EventCards
 *
 * WHY FlatList INSTEAD OF ScrollView?
 * FlatList only renders items that are visible on screen (virtualization).
 * If you have 20 events, ScrollView renders all 20 at once (slow).
 * FlatList only renders the 3-4 visible ones (fast). For large lists,
 * this is a massive performance difference.
 */
import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { Colors, FontSize, Spacing } from "@/constants/theme"
import { getUpcomingEvents, type EventWithFights } from "@/lib/events"
import { EventCard } from "@/components/events/event-card"

export default function EventsScreen() {
  const [events, setEvents] = useState<EventWithFights[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  /**
   * Fetch events from Supabase.
   * Called on mount and when the user pulls to refresh.
   */
  const fetchEvents = useCallback(async () => {
    try {
      const data = await getUpcomingEvents(5)
      setEvents(data)
    } catch (err) {
      console.error("Failed to fetch events:", err)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchEvents().finally(() => setIsLoading(false))
  }, [fetchEvents])

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchEvents()
    setIsRefreshing(false)
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    )
  }

  // ── Empty state ──
  if (events.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No Upcoming Events</Text>
        <Text style={styles.emptySubtitle}>
          Check back soon for the next UFC card
        </Text>
      </View>
    )
  }

  // ── Events list ──
  return (
    <FlatList
      data={events}
      keyExtractor={(event) => event.id}
      renderItem={({ item }) => (
        <EventCard event={item} showFullCard={false} />
      )}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    />
  )
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  separator: {
    height: Spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  loadingText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
  },
  emptyTitle: {
    color: Colors.foreground,
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
})
