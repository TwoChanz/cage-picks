# Predictions Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users pick fight winners directly on the event detail screen, with instant tap-to-pick UX, event-level locking, and underdog bonus scoring.

**Architecture:** Predictions are made on the event detail screen by tapping fighters on FightRow components. Data flows through a new `lib/predictions.ts` data layer using Supabase upserts. State is managed locally in the event detail screen with optimistic updates. Props thread through EventCard → FightCard → FightRow.

**Tech Stack:** React Native (Expo SDK 54), Supabase (PostgreSQL + RLS), TypeScript, Expo Router 6.

---

### Task 1: Database Migration — Add `favorite_fighter_id` and Prediction RLS Policies

**Files:**
- Create: `supabase/migrations/004_predictions_support.sql`
- Modify: `types/database.ts:78-96` (Fight interface)

**Step 1: Write the migration SQL**

Create `supabase/migrations/004_predictions_support.sql`:

```sql
-- Add favorite_fighter_id to fights table for underdog scoring
alter table fights
  add column favorite_fighter_id uuid references fighters (id);

-- Add missing RLS policies for prediction updates and deletes
-- (001_initial_schema.sql only has select + insert policies)
create policy "Users can update own predictions"
  on predictions for update using (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
  );

create policy "Users can delete own predictions"
  on predictions for delete using (
    profile_id in (select id from profiles where clerk_user_id = auth.jwt() ->> 'sub')
  );
```

**Step 2: Update the Fight TypeScript interface**

In `types/database.ts`, add `favorite_fighter_id` to the `Fight` interface after `started_at`:

```typescript
favorite_fighter_id: string | null  // Which fighter is the betting favorite (for scoring)
```

**Step 3: Commit**

```bash
git add supabase/migrations/004_predictions_support.sql types/database.ts
git commit -m "feat: add favorite_fighter_id column and prediction update/delete RLS policies"
```

---

### Task 2: Create Predictions Data Layer — `lib/predictions.ts`

**Files:**
- Create: `lib/predictions.ts`

**Step 1: Create `lib/predictions.ts` with all data access functions**

This file follows the same patterns as `lib/events.ts` — all Supabase queries live here, not in components.

```typescript
import { supabase } from "@/lib/supabase"
import type { Prediction } from "@/types/database"

/**
 * Fetch all of a user's predictions for fights in a specific event.
 * Single query: join predictions → fights, filter by event_id.
 */
export async function getEventPredictions(
  profileId: string,
  eventId: string
): Promise<Prediction[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*, fight:fights!fight_id(event_id)")
    .eq("profile_id", profileId)
    .is("group_id", null)

  if (error || !data) return []

  // Filter to only predictions for fights in this event
  return data
    .filter((p: any) => p.fight?.event_id === eventId)
    .map(({ fight, ...prediction }: any) => prediction as Prediction)
}

/**
 * Create or update a prediction. Uses Supabase upsert on the
 * unique constraint (profile_id, fight_id, group_id).
 * group_id is null for public predictions (Phase 2).
 */
export async function upsertPrediction(
  profileId: string,
  fightId: string,
  pickedFighterId: string
): Promise<Prediction | null> {
  const { data, error } = await supabase
    .from("predictions")
    .upsert(
      {
        profile_id: profileId,
        fight_id: fightId,
        group_id: null,
        picked_fighter_id: pickedFighterId,
      },
      { onConflict: "profile_id,fight_id,group_id" }
    )
    .select()
    .single()

  if (error) {
    console.error("Failed to upsert prediction:", error)
    return null
  }
  return data as Prediction
}

/**
 * Delete a prediction (when user deselects a fighter).
 */
export async function deletePrediction(
  profileId: string,
  fightId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("predictions")
    .delete()
    .eq("profile_id", profileId)
    .eq("fight_id", fightId)
    .is("group_id", null)

  if (error) {
    console.error("Failed to delete prediction:", error)
    return false
  }
  return true
}

/**
 * Check if an event's predictions are locked.
 * Locks when current time >= event start time.
 */
export function isEventLocked(eventDate: string): boolean {
  return new Date() >= new Date(eventDate)
}
```

**Step 2: Commit**

```bash
git add lib/predictions.ts
git commit -m "feat: add predictions data layer with upsert, delete, and lock check"
```

---

### Task 3: Create `PredictionBadge` Component

**Files:**
- Create: `components/predictions/prediction-badge.tsx`

**Step 1: Create the PredictionBadge component**

Small inline indicator for FightRow showing prediction result after fights are scored.

```typescript
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"

interface PredictionBadgeProps {
  isCorrect: boolean | null  // null = pending (fight not scored yet)
}

export function PredictionBadge({ isCorrect }: PredictionBadgeProps) {
  if (isCorrect === null) {
    return (
      <View style={[styles.badge, styles.pending]}>
        <Ionicons name="time-outline" size={10} color={Colors.foregroundMuted} />
        <Text style={[styles.text, styles.pendingText]}>Locked</Text>
      </View>
    )
  }

  if (isCorrect) {
    return (
      <View style={[styles.badge, styles.correct]}>
        <Ionicons name="checkmark-circle" size={10} color={Colors.success} />
        <Text style={[styles.text, styles.correctText]}>Correct</Text>
      </View>
    )
  }

  return (
    <View style={[styles.badge, styles.incorrect]}>
      <Ionicons name="close-circle" size={10} color={Colors.primary} />
      <Text style={[styles.text, styles.incorrectText]}>Wrong</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: "center",
  },
  text: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  pending: { backgroundColor: Colors.foregroundMuted + "20" },
  pendingText: { color: Colors.foregroundMuted },
  correct: { backgroundColor: Colors.success + "20" },
  correctText: { color: Colors.success },
  incorrect: { backgroundColor: Colors.primary + "20" },
  incorrectText: { color: Colors.primary },
})
```

**Step 2: Commit**

```bash
git add components/predictions/prediction-badge.tsx
git commit -m "feat: add PredictionBadge component for correct/incorrect/pending states"
```

---

### Task 4: Modify `FightRow` — Make Fighters Tappable with Prediction State

**Files:**
- Modify: `components/events/fight-row.tsx`

This is the largest change. FightRow needs to:
1. Accept optional prediction props (so it still works without predictions on the events list).
2. Wrap each fighter side in a `Pressable`.
3. Show a colored border/glow on the picked fighter's side.
4. Show a `PredictionBadge` when locked and a prediction exists.

**Step 1: Update the FightRow interface and component**

Changes to `fight-row.tsx`:

1. Update the import to include `Pressable`:
   - Change: `import { View, Text, StyleSheet, Image } from "react-native"`
   - To: `import { View, Text, StyleSheet, Image, Pressable } from "react-native"`

2. Add import for PredictionBadge:
   ```typescript
   import { PredictionBadge } from "@/components/predictions/prediction-badge"
   ```

3. Update the `FightRowProps` interface:
   ```typescript
   interface FightRowProps {
     fight: FightWithFighters
     prediction?: {
       picked_fighter_id: string
       is_correct: boolean | null
     } | null
     locked?: boolean
     onPickFighter?: (fightId: string, fighterId: string) => void
   }
   ```

4. Update the component signature:
   ```typescript
   export function FightRow({ fight, prediction, locked, onPickFighter }: FightRowProps)
   ```

5. Add derived state after the existing `imageA`/`imageB` lines:
   ```typescript
   const pickedA = prediction?.picked_fighter_id === fighter_a.id
   const pickedB = prediction?.picked_fighter_id === fighter_b.id
   const hasPrediction = pickedA || pickedB
   ```

6. Add a handler function:
   ```typescript
   const handlePick = (fighterId: string) => {
     if (locked || !onPickFighter) return
     onPickFighter(fight.id, fighterId)
   }
   ```

7. Wrap each fighter side in a `Pressable`. The Fighter A side (`<View style={styles.fighterSide}>`) becomes:
   ```typescript
   <Pressable
     style={[styles.fighterSide, pickedA && styles.pickedSide]}
     onPress={() => handlePick(fighter_a.id)}
     disabled={locked || !onPickFighter}
   >
   ```
   (Close the `Pressable` where the `View` currently closes.)

8. Same for Fighter B side — the `<View style={[styles.fighterSide, styles.fighterRight]}>` becomes:
   ```typescript
   <Pressable
     style={[styles.fighterSide, styles.fighterRight, pickedB && styles.pickedSide]}
     onPress={() => handlePick(fighter_b.id)}
     disabled={locked || !onPickFighter}
   >
   ```

9. Add the PredictionBadge below the info row (before the closing `</View>` of the container), only when locked and a prediction exists:
   ```typescript
   {locked && hasPrediction && (
     <PredictionBadge isCorrect={prediction!.is_correct} />
   )}
   ```

10. Add these new styles to the StyleSheet:
    ```typescript
    pickedSide: {
      backgroundColor: Colors.accent + "15",
      borderRadius: BorderRadius.sm,
      borderWidth: 1,
      borderColor: Colors.accent + "50",
    },
    ```

**Step 2: Commit**

```bash
git add components/events/fight-row.tsx
git commit -m "feat: make FightRow tappable with prediction highlight and badge"
```

---

### Task 5: Thread Prediction Props Through `FightCard` and `EventCard`

**Files:**
- Modify: `components/events/fight-card.tsx`
- Modify: `components/events/event-card.tsx`

**Step 1: Update `FightCard` to pass prediction props through to `FightRow`**

In `fight-card.tsx`:

1. Add import for `Prediction`:
   ```typescript
   import type { Prediction } from "@/types/database"
   ```

2. Update the `FightCardProps` interface:
   ```typescript
   interface FightCardProps {
     fights: FightWithFighters[]
     showFull?: boolean
     predictions?: Prediction[]
     locked?: boolean
     onPickFighter?: (fightId: string, fighterId: string) => void
   }
   ```

3. Update the component signature:
   ```typescript
   export function FightCard({ fights, showFull = false, predictions, locked, onPickFighter }: FightCardProps)
   ```

4. In the `FightRow` render (line 68), pass prediction props:
   ```typescript
   <FightRow
     key={fight.id}
     fight={fight}
     prediction={predictions?.find((p) => p.fight_id === fight.id)}
     locked={locked}
     onPickFighter={onPickFighter}
   />
   ```

**Step 2: Update `EventCard` to accept and pass prediction props**

In `event-card.tsx`:

1. Add import for `Prediction`:
   ```typescript
   import type { Prediction } from "@/types/database"
   ```

2. Update the `EventCardProps` interface:
   ```typescript
   interface EventCardProps {
     event: EventWithFights
     showFullCard?: boolean
     predictions?: Prediction[]
     locked?: boolean
     onPickFighter?: (fightId: string, fighterId: string) => void
   }
   ```

3. Update the component signature:
   ```typescript
   export function EventCard({ event, showFullCard = false, predictions, locked, onPickFighter }: EventCardProps)
   ```

4. Pass props through to `FightCard` (line 101):
   ```typescript
   <FightCard
     fights={event.fights}
     showFull={showFullCard}
     predictions={predictions}
     locked={locked}
     onPickFighter={onPickFighter}
   />
   ```

**Step 3: Commit**

```bash
git add components/events/fight-card.tsx components/events/event-card.tsx
git commit -m "feat: thread prediction props through FightCard and EventCard"
```

---

### Task 6: Create `PredictionSummary` Component

**Files:**
- Create: `components/predictions/prediction-summary.tsx`

**Step 1: Create the PredictionSummary component**

Collapsible banner at the top of the event detail screen showing pick count and summary.

```typescript
import { useState } from "react"
import { View, Text, StyleSheet, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import type { Prediction, FightWithFighters } from "@/types/database"

interface PredictionSummaryProps {
  predictions: Prediction[]
  fights: FightWithFighters[]
  locked: boolean
}

export function PredictionSummary({ predictions, fights, locked }: PredictionSummaryProps) {
  const [expanded, setExpanded] = useState(false)

  const totalFights = fights.length
  const totalPicks = predictions.length
  const correctPicks = predictions.filter((p) => p.is_correct === true).length
  const scoredPicks = predictions.filter((p) => p.is_correct !== null).length
  const totalPoints = predictions.reduce((sum, p) => sum + p.points_earned, 0)

  // Build a map of fight_id → fighter names for the summary list
  const fightMap = new Map(fights.map((f) => [f.id, f]))

  const getPickedFighterName = (prediction: Prediction): string => {
    const fight = fightMap.get(prediction.fight_id)
    if (!fight) return "Unknown"
    if (prediction.picked_fighter_id === fight.fighter_a.id) return fight.fighter_a.name
    if (prediction.picked_fighter_id === fight.fighter_b.id) return fight.fighter_b.name
    return "Unknown"
  }

  if (totalPicks === 0) return null

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={() => setExpanded(!expanded)}>
        <View style={styles.headerLeft}>
          <Ionicons
            name={locked ? "lock-closed" : "create-outline"}
            size={14}
            color={locked ? Colors.foregroundMuted : Colors.accent}
          />
          <Text style={styles.headerText}>
            {totalPicks}/{totalFights} fights picked
          </Text>
          {locked && scoredPicks > 0 && (
            <Text style={styles.scoreText}>
              · {correctPicks}/{scoredPicks} correct · {totalPoints} pts
            </Text>
          )}
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.foregroundMuted}
        />
      </Pressable>

      {expanded && (
        <View style={styles.picksList}>
          {predictions.map((prediction) => (
            <View key={prediction.id} style={styles.pickItem}>
              <Text style={styles.pickName}>{getPickedFighterName(prediction)}</Text>
              {prediction.is_correct === true && (
                <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
              )}
              {prediction.is_correct === false && (
                <Ionicons name="close-circle" size={12} color={Colors.primary} />
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  headerText: {
    color: Colors.foreground,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  scoreText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
  },
  picksList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  pickItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  pickName: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
  },
})
```

**Step 2: Commit**

```bash
git add components/predictions/prediction-summary.tsx
git commit -m "feat: add PredictionSummary collapsible banner component"
```

---

### Task 7: Integrate Predictions into the Event Detail Screen

**Files:**
- Modify: `app/(tabs)/events/[slug].tsx`

This is where everything comes together. The event detail screen needs to:
1. Get the user's profile ID (from Clerk).
2. Fetch predictions on mount.
3. Handle pick/deselect with optimistic updates.
4. Render the PredictionSummary banner.
5. Pass prediction state through to EventCard.

**Step 1: Update the event detail screen**

Full replacement of `app/(tabs)/events/[slug].tsx`:

```typescript
import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native"
import { useLocalSearchParams, useRouter, Stack } from "expo-router"
import { useUser } from "@clerk/clerk-expo"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing } from "@/constants/theme"
import { getEventBySlug, type EventWithFights } from "@/lib/events"
import {
  getEventPredictions,
  upsertPrediction,
  deletePrediction,
  isEventLocked,
} from "@/lib/predictions"
import { EventCard } from "@/components/events/event-card"
import { PredictionSummary } from "@/components/predictions/prediction-summary"
import type { Prediction } from "@/types/database"

export default function EventDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()
  const { user } = useUser()
  const [event, setEvent] = useState<EventWithFights | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const locked = event ? isEventLocked(event.date) : false

  // Fetch event data
  useEffect(() => {
    if (!slug) return

    getEventBySlug(slug)
      .then((data) => setEvent(data))
      .catch((err) => console.error("Failed to fetch event:", err))
      .finally(() => setIsLoading(false))
  }, [slug])

  // Fetch predictions once we have the event and user
  useEffect(() => {
    if (!event || !user?.id) return

    getEventPredictions(user.id, event.id)
      .then((data) => setPredictions(data))
      .catch((err) => console.error("Failed to fetch predictions:", err))
  }, [event?.id, user?.id])

  // Handle fighter pick/deselect
  const handlePickFighter = useCallback(
    async (fightId: string, fighterId: string) => {
      if (locked || !user?.id) return

      const existing = predictions.find((p) => p.fight_id === fightId)

      // If tapping the same fighter again, deselect
      if (existing?.picked_fighter_id === fighterId) {
        // Optimistic delete
        setPredictions((prev) => prev.filter((p) => p.fight_id !== fightId))
        const success = await deletePrediction(user.id, fightId)
        if (!success) {
          // Revert on failure
          setPredictions((prev) => [...prev, existing])
          Alert.alert("Error", "Failed to remove pick. Please try again.")
        }
        return
      }

      // Optimistic upsert
      const optimistic: Prediction = {
        id: existing?.id ?? `temp-${fightId}`,
        profile_id: user.id,
        fight_id: fightId,
        group_id: null,
        picked_fighter_id: fighterId,
        is_correct: null,
        points_earned: 0,
        locked_at: null,
        created_at: existing?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setPredictions((prev) => {
        const without = prev.filter((p) => p.fight_id !== fightId)
        return [...without, optimistic]
      })

      const result = await upsertPrediction(user.id, fightId, fighterId)
      if (!result) {
        // Revert on failure
        setPredictions((prev) => {
          const without = prev.filter((p) => p.fight_id !== fightId)
          return existing ? [...without, existing] : without
        })
        Alert.alert("Error", "Failed to save pick. Please try again.")
      } else {
        // Replace optimistic with real data
        setPredictions((prev) =>
          prev.map((p) => (p.fight_id === fightId ? result : p))
        )
      }
    },
    [locked, user?.id, predictions]
  )

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
        {/* Prediction summary banner */}
        {predictions.length > 0 && (
          <PredictionSummary
            predictions={predictions}
            fights={event.fights}
            locked={locked}
          />
        )}

        <EventCard
          event={event}
          showFullCard={true}
          predictions={predictions}
          locked={locked}
          onPickFighter={handlePickFighter}
        />
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
```

**Important note about `user.id`:** Clerk's `user.id` is the Clerk user ID (a string like `user_xxx`). The predictions table uses `profile_id` which is the UUID from our `profiles` table. The event detail screen will need to resolve the Clerk user ID to a profile ID. Two approaches:

- **Option A (quick):** Add a helper `getProfileByClerkId(clerkUserId)` to `lib/predictions.ts` and call it on mount.
- **Option B (existing pattern):** Check if there's already a profile context/provider. If not, create one.

Check how the app currently resolves the Clerk user to a profile. If no pattern exists, add `getProfileByClerkId` to `lib/predictions.ts`:

```typescript
export async function getProfileByClerkId(clerkUserId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", clerkUserId)
    .single()

  if (error || !data) return null
  return data.id
}
```

Then in the event detail screen, resolve `user.id` → `profileId` before fetching predictions. Update the `useEffect` for predictions:

```typescript
const [profileId, setProfileId] = useState<string | null>(null)

useEffect(() => {
  if (!user?.id) return
  getProfileByClerkId(user.id).then(setProfileId)
}, [user?.id])

useEffect(() => {
  if (!event || !profileId) return
  getEventPredictions(profileId, event.id)
    .then((data) => setPredictions(data))
    .catch((err) => console.error("Failed to fetch predictions:", err))
}, [event?.id, profileId])
```

And use `profileId` instead of `user.id` in `handlePickFighter`.

**Step 2: Commit**

```bash
git add app/(tabs)/events/[slug].tsx lib/predictions.ts
git commit -m "feat: integrate predictions into event detail screen with optimistic updates"
```

---

### Task 8: Verify and Smoke Test

**Step 1: Start Expo and verify no TypeScript/build errors**

```bash
npx expo start
```

Open the app on a device/simulator. Navigate to an event detail screen. Verify:
- Fight rows render correctly (no regressions).
- If not logged in, fight rows are not tappable (no `onPickFighter` passed when no user).
- If logged in, tapping a fighter highlights their side with the accent border.
- Tapping the same fighter deselects.
- Tapping the other fighter in the same fight switches the pick.
- The PredictionSummary banner appears after making at least one pick.
- The banner shows correct count (e.g., "3/14 fights picked").
- Expanding the banner shows fighter names.

**Step 2: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during predictions smoke test"
```

---

## File Summary

| Action | Path | Description |
|--------|------|-------------|
| Create | `supabase/migrations/004_predictions_support.sql` | Add `favorite_fighter_id`, prediction update/delete RLS |
| Create | `lib/predictions.ts` | Data access layer for predictions |
| Create | `components/predictions/prediction-badge.tsx` | Correct/incorrect/pending badge |
| Create | `components/predictions/prediction-summary.tsx` | Collapsible picks summary banner |
| Modify | `types/database.ts` | Add `favorite_fighter_id` to Fight interface |
| Modify | `components/events/fight-row.tsx` | Make fighters tappable, show prediction state |
| Modify | `components/events/fight-card.tsx` | Thread prediction props to FightRow |
| Modify | `components/events/event-card.tsx` | Thread prediction props to FightCard |
| Modify | `app/(tabs)/events/[slug].tsx` | Orchestrate predictions state and handlers |

## Dependency Order

```
Task 1 (migration + types)
  └→ Task 2 (data layer)
       └→ Task 3 (PredictionBadge)
            └→ Task 4 (FightRow modifications)
                 └→ Task 5 (FightCard + EventCard threading)
                      └→ Task 6 (PredictionSummary)
                           └→ Task 7 (Event detail integration)
                                └→ Task 8 (Smoke test)
```
