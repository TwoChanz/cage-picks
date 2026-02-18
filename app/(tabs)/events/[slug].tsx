/**
 * Event Detail Screen — Full fight card for a single event
 *
 * This screen is reached by tapping "View Full Card" on an EventCard.
 * It shows the same EventCard component but with showFullCard={true},
 * which displays ALL fight sections (Main Card, Prelims, Early Prelims).
 *
 * DYNAMIC ROUTING:
 * The [slug] in the file name means this is a dynamic route.
 * /events/ufc-314 → slug = "ufc-314"
 * /events/ufc-315 → slug = "ufc-315"
 *
 * This is the same concept as Next.js's [slug]/page.tsx but in Expo Router.
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
import { Colors, FontSize, Spacing } from "@/constants/theme"
import { getEventBySlug, type EventWithFights } from "@/lib/events"
import { EventCard } from "@/components/events/event-card"

export default function EventDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const [event, setEvent] = useState<EventWithFights | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    getEventBySlug(slug)
      .then((data) => setEvent(data))
      .catch((err) => console.error("Failed to fetch event:", err))
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
  if (!event) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="calendar-outline"
          size={48}
          color={Colors.foregroundMuted}
        />
        <Text style={styles.notFoundTitle}>Event Not Found</Text>
        <Text style={styles.notFoundSubtitle}>
          This event doesn&apos;t exist or may have been removed.
        </Text>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Events</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <>
      {/* Dynamic header title */}
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: event.name,
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.foreground,
          headerBackTitle: "Events",
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <EventCard event={event} showFullCard={true} />
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
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
    borderRadius: 12,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
})
