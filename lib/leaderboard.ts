/**
 * Leaderboard Data Access Layer
 *
 * Computes leaderboard rankings from predictions data.
 * LeaderboardEntry is not a database table — it's calculated
 * on-the-fly from the predictions table.
 *
 * MOCK DATA:
 * In mock mode, returns pre-computed leaderboard entries.
 * When Supabase is active, set USE_MOCK to false and rankings
 * are computed from real prediction data.
 */
import { supabase } from "@/lib/supabase"
import type { LeaderboardEntry, Profile } from "@/types/database"
import { LEADERBOARD_TITLES } from "@/types/database"

// ── Toggle for mock vs. live data ──
const USE_MOCK = true

// ── Mock profiles (shared with groups for consistency) ──
const mockProfiles: Profile[] = [
  {
    id: "mock-profile-1",
    clerk_user_id: "user_mock_1",
    username: "cage_king",
    display_name: "Marcus Chen",
    avatar_url: null,
    title: "The Oracle",
    created_at: "2025-11-01T00:00:00Z",
    updated_at: "2025-11-01T00:00:00Z",
  },
  {
    id: "mock-profile-2",
    clerk_user_id: "user_mock_2",
    username: "ko_queen",
    display_name: "Sarah Torres",
    avatar_url: null,
    title: "Analyst",
    created_at: "2025-11-15T00:00:00Z",
    updated_at: "2025-11-15T00:00:00Z",
  },
  {
    id: "mock-profile-3",
    clerk_user_id: "user_mock_3",
    username: "tapout_tim",
    display_name: "Tim Walker",
    avatar_url: null,
    title: "Fight Fan",
    created_at: "2025-12-01T00:00:00Z",
    updated_at: "2025-12-01T00:00:00Z",
  },
  {
    id: "mock-profile-4",
    clerk_user_id: "user_mock_4",
    username: "round1_ricky",
    display_name: "Ricky Nguyen",
    avatar_url: null,
    title: "Casual",
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-01-10T00:00:00Z",
  },
  {
    id: "mock-profile-5",
    clerk_user_id: "user_mock_5",
    username: "armbar_anna",
    display_name: "Anna Petrov",
    avatar_url: null,
    title: "Analyst",
    created_at: "2025-12-15T00:00:00Z",
    updated_at: "2025-12-15T00:00:00Z",
  },
  {
    id: "mock-profile-6",
    clerk_user_id: "user_mock_6",
    username: "just_bleed",
    display_name: "Jake Morrison",
    avatar_url: null,
    title: "Fight Fan",
    created_at: "2026-01-05T00:00:00Z",
    updated_at: "2026-01-05T00:00:00Z",
  },
]

const MOCK_GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    profile: mockProfiles[0],
    total_points: 42,
    total_predictions: 30,
    correct_predictions: 24,
    accuracy: 80,
    rank: 1,
    title: LEADERBOARD_TITLES.ORACLE,
  },
  {
    profile: mockProfiles[1],
    total_points: 35,
    total_predictions: 30,
    correct_predictions: 21,
    accuracy: 70,
    rank: 2,
    title: LEADERBOARD_TITLES.ANALYST,
  },
  {
    profile: mockProfiles[4],
    total_points: 31,
    total_predictions: 28,
    correct_predictions: 19,
    accuracy: 68,
    rank: 3,
    title: LEADERBOARD_TITLES.ANALYST,
  },
  {
    profile: mockProfiles[2],
    total_points: 22,
    total_predictions: 30,
    correct_predictions: 15,
    accuracy: 50,
    rank: 4,
    title: LEADERBOARD_TITLES.FIGHT_FAN,
  },
  {
    profile: mockProfiles[5],
    total_points: 18,
    total_predictions: 25,
    correct_predictions: 12,
    accuracy: 48,
    rank: 5,
    title: LEADERBOARD_TITLES.FIGHT_FAN,
  },
  {
    profile: mockProfiles[3],
    total_points: 10,
    total_predictions: 30,
    correct_predictions: 7,
    accuracy: 23,
    rank: 6,
    title: LEADERBOARD_TITLES.CASUAL,
  },
]

/**
 * Calculate title based on accuracy and streak.
 *
 * Title thresholds from the PRD:
 *   "The Oracle"                     → Top 1% accuracy
 *   "Analyst"                        → Top 10% accuracy
 *   "Fight Fan"                      → Default, mid-pack
 *   "Casual"                         → Bottom 25% accuracy
 *   "Picking With Their Eyes Closed" → Active losing streak of 5+
 */
export function calculateTitle(
  accuracy: number,
  rank: number,
  totalUsers: number,
  losingStreak?: number
): string {
  if (losingStreak && losingStreak >= 5) {
    return LEADERBOARD_TITLES.BLIND
  }

  const percentile = totalUsers > 0 ? (rank / totalUsers) * 100 : 50

  if (percentile <= 1) return LEADERBOARD_TITLES.ORACLE
  if (percentile <= 10) return LEADERBOARD_TITLES.ANALYST
  if (percentile > 75) return LEADERBOARD_TITLES.CASUAL
  return LEADERBOARD_TITLES.FIGHT_FAN
}

/**
 * Fetch the global leaderboard — all users ranked by total points.
 */
export async function getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
  if (USE_MOCK) {
    return MOCK_GLOBAL_LEADERBOARD
  }

  // Aggregate predictions per profile: sum points, count correct/total
  const { data, error } = await supabase
    .from("predictions")
    .select("profile_id, points_earned, is_correct")
    .is("group_id", null) // Global predictions only

  if (error) {
    console.error("Failed to fetch leaderboard:", error)
    return []
  }

  // Aggregate in JS (better than complex SQL for now)
  const statsMap = new Map<
    string,
    { points: number; total: number; correct: number }
  >()

  for (const pred of data ?? []) {
    const existing = statsMap.get(pred.profile_id) ?? {
      points: 0,
      total: 0,
      correct: 0,
    }
    existing.points += pred.points_earned ?? 0
    existing.total += 1
    if (pred.is_correct) existing.correct += 1
    statsMap.set(pred.profile_id, existing)
  }

  // Fetch profile info for all users with predictions
  const profileIds = Array.from(statsMap.keys())
  if (!profileIds.length) return []

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", profileIds)

  if (profileError) {
    console.error("Failed to fetch profiles:", profileError)
    return []
  }

  const profileMap = new Map(
    (profiles ?? []).map((p: any) => [p.id, p as Profile])
  )

  // Build leaderboard entries sorted by points
  const entries: LeaderboardEntry[] = Array.from(statsMap.entries())
    .map(([profileId, stats]) => ({
      profile: profileMap.get(profileId)!,
      total_points: stats.points,
      total_predictions: stats.total,
      correct_predictions: stats.correct,
      accuracy:
        stats.total > 0
          ? Math.round((stats.correct / stats.total) * 100)
          : 0,
      rank: 0,
      title: "",
    }))
    .filter((e) => e.profile)
    .sort((a, b) => b.total_points - a.total_points)

  // Assign ranks and titles
  entries.forEach((entry, i) => {
    entry.rank = i + 1
    entry.title = calculateTitle(
      entry.accuracy,
      entry.rank,
      entries.length
    )
  })

  return entries
}

/**
 * Fetch the leaderboard for a specific group.
 * Only counts predictions made within that group context.
 */
export async function getGroupLeaderboard(
  groupId: string
): Promise<LeaderboardEntry[]> {
  if (USE_MOCK) {
    // Return a subset of the global leaderboard for mock
    // (groups g1 and g2 share some members)
    const groupMembers: Record<string, string[]> = {
      g1: ["mock-profile-1", "mock-profile-2", "mock-profile-3"],
      g2: ["mock-profile-2", "mock-profile-1", "mock-profile-4"],
    }

    const memberIds = groupMembers[groupId] ?? []
    return MOCK_GLOBAL_LEADERBOARD.filter((entry) =>
      memberIds.includes(entry.profile.id)
    ).map((entry, i) => ({ ...entry, rank: i + 1 }))
  }

  const { data, error } = await supabase
    .from("predictions")
    .select("profile_id, points_earned, is_correct")
    .eq("group_id", groupId)

  if (error) {
    console.error("Failed to fetch group leaderboard:", error)
    return []
  }

  const statsMap = new Map<
    string,
    { points: number; total: number; correct: number }
  >()

  for (const pred of data ?? []) {
    const existing = statsMap.get(pred.profile_id) ?? {
      points: 0,
      total: 0,
      correct: 0,
    }
    existing.points += pred.points_earned ?? 0
    existing.total += 1
    if (pred.is_correct) existing.correct += 1
    statsMap.set(pred.profile_id, existing)
  }

  const profileIds = Array.from(statsMap.keys())
  if (!profileIds.length) return []

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", profileIds)

  if (profileError) return []

  const profileMap = new Map(
    (profiles ?? []).map((p: any) => [p.id, p as Profile])
  )

  const entries: LeaderboardEntry[] = Array.from(statsMap.entries())
    .map(([profileId, stats]) => ({
      profile: profileMap.get(profileId)!,
      total_points: stats.points,
      total_predictions: stats.total,
      correct_predictions: stats.correct,
      accuracy:
        stats.total > 0
          ? Math.round((stats.correct / stats.total) * 100)
          : 0,
      rank: 0,
      title: "",
    }))
    .filter((e) => e.profile)
    .sort((a, b) => b.total_points - a.total_points)

  entries.forEach((entry, i) => {
    entry.rank = i + 1
    entry.title = calculateTitle(
      entry.accuracy,
      entry.rank,
      entries.length
    )
  })

  return entries
}
