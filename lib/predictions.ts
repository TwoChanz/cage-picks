/**
 * Predictions Data Access Layer
 *
 * All Supabase queries for predictions live here. Follows the same
 * mock-toggle pattern as lib/fighters.ts for development when
 * Supabase is paused.
 *
 * MOCK DATA:
 * In mock mode, predictions are stored in memory for the current
 * session. They reset when the app reloads. When Supabase is active,
 * set USE_MOCK to false and predictions persist to the database.
 */
import { supabase } from "@/lib/supabase"
import type { Prediction } from "@/types/database"

// ── Toggle for mock vs. live data ──
const USE_MOCK = true

// ── In-memory store for mock predictions (keyed by `profileId:fightId`) ──
const mockPredictions = new Map<string, Prediction>()

/**
 * Fetch all predictions a user has made for fights in a given event.
 *
 * Returns a Map keyed by fight_id for O(1) lookup when rendering fight rows.
 *
 * @param profileId - The user's profile ID
 * @param fightIds  - All fight IDs for the event
 */
export async function getUserPredictionsForEvent(
  profileId: string,
  fightIds: string[]
): Promise<Map<string, Prediction>> {
  const result = new Map<string, Prediction>()
  if (!fightIds.length) return result

  if (USE_MOCK) {
    for (const fightId of fightIds) {
      const key = `${profileId}:${fightId}`
      const prediction = mockPredictions.get(key)
      if (prediction) {
        result.set(fightId, prediction)
      }
    }
    return result
  }

  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("profile_id", profileId)
    .in("fight_id", fightIds)
    .is("group_id", null) // Public predictions only (no group context)

  if (error) {
    console.error("Failed to fetch predictions:", error)
    return result
  }

  for (const prediction of data ?? []) {
    result.set(prediction.fight_id, prediction as Prediction)
  }

  return result
}

/**
 * Create or update a prediction for a fight.
 *
 * Uses upsert semantics — if a prediction already exists for this
 * user+fight+group combo, it updates the picked fighter. Predictions
 * for completed/live fights are rejected.
 *
 * @param profileId       - The user's profile ID
 * @param fightId         - The fight to predict
 * @param pickedFighterId - The fighter the user picks to win
 * @param groupId         - Optional group context (null = public)
 */
export async function savePrediction(
  profileId: string,
  fightId: string,
  pickedFighterId: string,
  groupId: string | null = null
): Promise<Prediction | null> {
  if (USE_MOCK) {
    const key = `${profileId}:${fightId}`
    const existing = mockPredictions.get(key)
    const now = new Date().toISOString()

    const prediction: Prediction = {
      id: existing?.id ?? `pred-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      profile_id: profileId,
      fight_id: fightId,
      group_id: groupId,
      picked_fighter_id: pickedFighterId,
      is_correct: null,
      points_earned: 0,
      locked_at: null,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    }

    mockPredictions.set(key, prediction)
    return prediction
  }

  const { data, error } = await supabase
    .from("predictions")
    .upsert(
      {
        profile_id: profileId,
        fight_id: fightId,
        group_id: groupId,
        picked_fighter_id: pickedFighterId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "profile_id,fight_id,group_id",
      }
    )
    .select()
    .single()

  if (error) {
    console.error("Failed to save prediction:", error)
    return null
  }

  return data as Prediction
}

/**
 * Check if a fight can still accept predictions.
 *
 * Predictions are locked once a fight starts (status != 'upcoming').
 */
export function isFightLocked(fightStatus: string): boolean {
  return fightStatus !== "upcoming"
}
