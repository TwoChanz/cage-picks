/**
 * Profile Data Access Layer
 *
 * Functions for fetching user stats and prediction history.
 * Stats are computed from the predictions table.
 *
 * MOCK DATA:
 * In mock mode, returns pre-computed stats for the mock user.
 */
import { supabase } from "@/lib/supabase"
import { calculateTitle } from "@/lib/leaderboard"
import type { Prediction } from "@/types/database"

// ── Toggle for mock vs. live data ──
const USE_MOCK = true

// ── Types ──

export interface UserStats {
  total_predictions: number
  correct_predictions: number
  incorrect_predictions: number
  pending_predictions: number
  accuracy: number
  total_points: number
  current_streak: number
  best_streak: number
  title: string
}

export interface PredictionHistoryItem {
  id: string
  event_name: string
  event_date: string
  fighter_picked: string
  opponent: string
  is_correct: boolean | null
  points_earned: number
}

// ── Mock data ──

const MOCK_STATS: Record<string, UserStats> = {
  "mock-profile-1": {
    total_predictions: 30,
    correct_predictions: 24,
    incorrect_predictions: 4,
    pending_predictions: 2,
    accuracy: 80,
    total_points: 42,
    current_streak: 5,
    best_streak: 8,
    title: "The Oracle",
  },
}

const MOCK_HISTORY: Record<string, PredictionHistoryItem[]> = {
  "mock-profile-1": [
    {
      id: "h1",
      event_name: "UFC 314: Makhachev vs. Tsarukyan 2",
      event_date: "2026-03-08T23:00:00Z",
      fighter_picked: "Islam Makhachev",
      opponent: "Arman Tsarukyan",
      is_correct: null,
      points_earned: 0,
    },
    {
      id: "h2",
      event_name: "UFC 314: Makhachev vs. Tsarukyan 2",
      event_date: "2026-03-08T23:00:00Z",
      fighter_picked: "Alex Pereira",
      opponent: "Magomed Ankalaev",
      is_correct: null,
      points_earned: 0,
    },
    {
      id: "h3",
      event_name: "UFC 313: Pereira vs. Ankalaev",
      event_date: "2026-02-08T23:00:00Z",
      fighter_picked: "Alex Pereira",
      opponent: "Magomed Ankalaev",
      is_correct: true,
      points_earned: 1,
    },
    {
      id: "h4",
      event_name: "UFC 313: Pereira vs. Ankalaev",
      event_date: "2026-02-08T23:00:00Z",
      fighter_picked: "Ilia Topuria",
      opponent: "Max Holloway",
      is_correct: true,
      points_earned: 1,
    },
    {
      id: "h5",
      event_name: "UFC 312: Du Plessis vs. Strickland 2",
      event_date: "2026-01-18T23:00:00Z",
      fighter_picked: "Dricus Du Plessis",
      opponent: "Sean Strickland",
      is_correct: true,
      points_earned: 2,
    },
    {
      id: "h6",
      event_name: "UFC 312: Du Plessis vs. Strickland 2",
      event_date: "2026-01-18T23:00:00Z",
      fighter_picked: "Jon Jones",
      opponent: "Tom Aspinall",
      is_correct: false,
      points_earned: 0,
    },
  ],
}

/**
 * Fetch aggregated stats for a user.
 */
export async function getUserStats(
  profileId: string
): Promise<UserStats> {
  if (USE_MOCK) {
    return (
      MOCK_STATS[profileId] ?? {
        total_predictions: 0,
        correct_predictions: 0,
        incorrect_predictions: 0,
        pending_predictions: 0,
        accuracy: 0,
        total_points: 0,
        current_streak: 0,
        best_streak: 0,
        title: "Fight Fan",
      }
    )
  }

  const { data, error } = await supabase
    .from("predictions")
    .select("is_correct, points_earned")
    .eq("profile_id", profileId)
    .is("group_id", null)

  if (error || !data) {
    console.error("Failed to fetch user stats:", error)
    return {
      total_predictions: 0,
      correct_predictions: 0,
      incorrect_predictions: 0,
      pending_predictions: 0,
      accuracy: 0,
      total_points: 0,
      current_streak: 0,
      best_streak: 0,
      title: "Fight Fan",
    }
  }

  const total = data.length
  const correct = data.filter((p) => p.is_correct === true).length
  const incorrect = data.filter((p) => p.is_correct === false).length
  const pending = data.filter((p) => p.is_correct === null).length
  const points = data.reduce((sum, p) => sum + (p.points_earned ?? 0), 0)
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  // Compute streak from most recent predictions
  let currentStreak = 0
  const scored = data.filter((p) => p.is_correct !== null)
  for (let i = scored.length - 1; i >= 0; i--) {
    if (scored[i].is_correct) {
      currentStreak++
    } else {
      break
    }
  }

  const title = calculateTitle(accuracy, 1, 1)

  return {
    total_predictions: total,
    correct_predictions: correct,
    incorrect_predictions: incorrect,
    pending_predictions: pending,
    accuracy,
    total_points: points,
    current_streak: currentStreak,
    best_streak: currentStreak, // Simplified — full impl would track historical best
    title,
  }
}

/**
 * Fetch prediction history for a user, grouped by event.
 */
export async function getPredictionHistory(
  profileId: string
): Promise<PredictionHistoryItem[]> {
  if (USE_MOCK) {
    return MOCK_HISTORY[profileId] ?? []
  }

  const { data, error } = await supabase
    .from("predictions")
    .select(
      `
      id,
      is_correct,
      points_earned,
      picked_fighter_id,
      fight:fights(
        event:events(name, date),
        fighter_a:fighters!fights_fighter_a_id_fkey(name),
        fighter_b:fighters!fights_fighter_b_id_fkey(name),
        fighter_a_id
      )
    `
    )
    .eq("profile_id", profileId)
    .is("group_id", null)
    .order("created_at", { ascending: false })

  if (error || !data) {
    console.error("Failed to fetch prediction history:", error)
    return []
  }

  return (data as any[]).map((pred) => {
    const fight = pred.fight
    const pickedA = pred.picked_fighter_id === fight?.fighter_a_id
    return {
      id: pred.id,
      event_name: fight?.event?.name ?? "Unknown Event",
      event_date: fight?.event?.date ?? "",
      fighter_picked: pickedA
        ? fight?.fighter_a?.name
        : fight?.fighter_b?.name,
      opponent: pickedA
        ? fight?.fighter_b?.name
        : fight?.fighter_a?.name,
      is_correct: pred.is_correct,
      points_earned: pred.points_earned ?? 0,
    }
  })
}
