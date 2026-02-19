/**
 * Event Detail Screen — Full fight card with predictions
 *
 * This screen is reached by tapping "View Full Card" on an EventCard.
 * It shows the full fight card (Main Card, Prelims, Early Prelims)
 * with interactive prediction picking — tap a fighter to pick them.
 *
 * PREDICTIONS FLOW:
 * 1. On mount, load the event + any existing user predictions
 * 2. User taps fighter sides to pick winners
 * 3. Each pick is saved immediately (optimistic local state + async persist)
 * 4. Locked fights (live/completed) can't be changed
 *
 * DYNAMIC ROUTING:
 * The [slug] in the file name means this is a dynamic route.
 * /events/ufc-314 → slug = "ufc-314"
 */
import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native"
import { useLocalSearchParams, useRouter, Stack } from "expo-router"
import { useUser } from "@clerk/clerk-expo"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import { getEventBySlug, type EventWithFights } from "@/lib/events"
import {
  getUserPredictionsForEvent,
  savePrediction,
} from "@/lib/predictions"
import {
  getNudgesForEvent,
  respondToNudge,
  type NudgeWithResponses,
} from "@/lib/meetups"
import { getGroupsByUser } from "@/lib/groups"
import { EventCard } from "@/components/events/event-card"
import { NudgeCard } from "@/components/events/nudge-card"
import type { Prediction, MeetupResponseType } from "@/types/database"

/** Mock profile ID for development when Clerk auth isn't available */
const MOCK_PROFILE_ID = "mock-user-001"

export default function EventDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const { user } = useUser()
  const [event, setEvent] = useState<EventWithFights | null>(null)
  const [predictions, setPredictions] = useState<Map<string, Prediction>>(
    new Map()
  )
  const [nudges, setNudges] = useState<NudgeWithResponses[]>([])
  const [groupNames, setGroupNames] = useState<Map<string, string>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  const profileId = user?.id ?? MOCK_PROFILE_ID

  useEffect(() => {
    if (!slug) return

    async function loadEventAndPredictions() {
      try {
        const eventData = await getEventBySlug(slug!)
        setEvent(eventData)

        if (eventData) {
          const fightIds = eventData.fights.map((f) => f.id)
          const [userPredictions, eventNudges, userGroups] =
            await Promise.all([
              getUserPredictionsForEvent(profileId, fightIds),
              getNudgesForEvent(eventData.id, profileId),
              getGroupsByUser(profileId),
            ])
          setPredictions(userPredictions)
          setNudges(eventNudges)
          setGroupNames(
            new Map(userGroups.map((g) => [g.id, g.name]))
          )
        }
      } catch (err) {
        console.error("Failed to load event:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadEventAndPredictions()
  }, [slug, profileId])

  /**
   * Handle fighter pick — optimistic update + async save.
   * Updates local state immediately for responsive UI, then persists.
   */
  const handlePickFighter = useCallback(
    async (fightId: string, fighterId: string) => {
      // Optimistic update: immediately reflect the pick in UI
      setPredictions((prev) => {
        const next = new Map(prev)
        const existing = prev.get(fightId)
        next.set(fightId, {
          id: existing?.id ?? `temp-${fightId}`,
          profile_id: profileId,
          fight_id: fightId,
          group_id: null,
          picked_fighter_id: fighterId,
          is_correct: null,
          points_earned: 0,
          locked_at: null,
          created_at: existing?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        return next
      })

      // Persist in background
      const saved = await savePrediction(profileId, fightId, fighterId)
      if (saved) {
        setPredictions((prev) => {
          const next = new Map(prev)
          next.set(fightId, saved)
          return next
        })
      }
    },
    [profileId]
  )

  /**
   * Handle meetup nudge response (In / Out / Maybe).
   */
  const handleNudgeRespond = useCallback(
    async (nudgeId: string, response: MeetupResponseType) => {
      const result = await respondToNudge(nudgeId, profileId, response)
      if (result) {
        // Refresh nudges to show updated responses
        if (event) {
          const updatedNudges = await getNudgesForEvent(event.id, profileId)
          setNudges(updatedNudges)
        }
      }
    },
    [profileId, event]
  )

  // Count picks for the progress indicator
  const totalFights = event?.fights.length ?? 0
  const totalPicks = predictions.size

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
        {/* Prediction prompt */}
        {totalFights > 0 && (
          <View style={styles.predictionHeader}>
            <View style={styles.predictionPrompt}>
              <Ionicons name="hand-left-outline" size={16} color={Colors.accent} />
              <Text style={styles.predictionPromptText}>
                Tap a fighter to pick your winner
              </Text>
            </View>
            <View style={styles.pickCounter}>
              <Text style={styles.pickCounterText}>
                {totalPicks}/{totalFights} picks
              </Text>
              {totalPicks === totalFights && totalFights > 0 && (
                <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              )}
            </View>
          </View>
        )}

        <EventCard
          event={event}
          showFullCard={true}
          predictions={predictions}
          onPickFighter={handlePickFighter}
        />

        {/* Meetup nudges — "Who's watching?" */}
        {nudges.length > 0 && (
          <View style={styles.nudgeSection}>
            <Text style={styles.nudgeSectionTitle}>Watch Party</Text>
            {nudges.map((nudge) => (
              <NudgeCard
                key={nudge.id}
                nudge={nudge}
                groupName={groupNames.get(nudge.group_id) ?? "Group"}
                currentProfileId={profileId}
                onRespond={handleNudgeRespond}
              />
            ))}
          </View>
        )}
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
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },

  // Prediction header
  predictionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  predictionPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  predictionPromptText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    fontStyle: "italic",
  },
  pickCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  pickCounterText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },

  // Nudge section
  nudgeSection: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  nudgeSectionTitle: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
})
