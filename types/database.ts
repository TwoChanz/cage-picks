/**
 * FightNight OS — Database Types
 *
 * These TypeScript types match the database tables defined in
 * supabase/migrations/001_initial_schema.sql
 *
 * WHY DO WE NEED THESE?
 * When we fetch data from Supabase, TypeScript doesn't automatically
 * know what columns the data has. These types tell TypeScript the
 * exact shape so it can catch mistakes like:
 *   - Accessing a column that doesn't exist (typos)
 *   - Passing the wrong type (string where number expected)
 *   - Forgetting required fields
 */

// --------------------------------------------------------------------------
// PROFILES
// --------------------------------------------------------------------------
export interface Profile {
  id: string
  clerk_user_id: string
  username: string
  display_name: string
  avatar_url: string | null
  title: string                 // Dynamic title like "The Oracle", "Fight Fan"
  created_at: string
  updated_at: string
}

// --------------------------------------------------------------------------
// EVENTS
// --------------------------------------------------------------------------
export type EventStatus = "upcoming" | "live" | "completed"

export interface Event {
  id: string
  name: string                  // "UFC 310: Pantoja vs. Asakura"
  slug: string                  // "ufc-310"
  date: string                  // ISO datetime string
  location: string | null
  status: EventStatus
  image_url: string | null
  created_at: string
  updated_at: string
}

// --------------------------------------------------------------------------
// FIGHTERS
// --------------------------------------------------------------------------
export interface Fighter {
  id: string
  name: string
  nickname: string | null
  slug: string
  weight_class: string | null
  record_wins: number
  record_losses: number
  record_draws: number
  record_nc: number             // No contests
  height_cm: number | null
  reach_cm: number | null
  stance: string | null         // "Orthodox" | "Southpaw" | "Switch"
  ko_percentage: number
  sub_percentage: number
  dec_percentage: number
  current_win_streak: number
  image_url: string | null
  created_at: string
  updated_at: string
}

// --------------------------------------------------------------------------
// FIGHTS
// --------------------------------------------------------------------------
export type FightStatus = "upcoming" | "live" | "completed" | "cancelled"
export type CardPosition = "main" | "prelim" | "early-prelim"

export interface Fight {
  id: string
  event_id: string
  fighter_a_id: string
  fighter_b_id: string
  card_position: CardPosition
  fight_order: number
  is_main_event: boolean
  weight_class: string | null
  scheduled_rounds: number       // 3 or 5
  status: FightStatus
  winner_id: string | null       // Null until scored
  method: string | null          // "KO/TKO", "Submission", "Decision", etc.
  round: number | null           // What round it ended
  time: string | null            // "4:32" time in round
  started_at: string | null
  favorite_fighter_id: string | null  // Which fighter is the betting favorite (null = pick'em)
  created_at: string
  updated_at: string
}

/**
 * A fight with fighter data joined in.
 * Used when displaying fight cards — we need to show both fighter names,
 * records, etc. alongside the fight info.
 */
export interface FightWithFighters extends Fight {
  fighter_a: Fighter
  fighter_b: Fighter
}

// --------------------------------------------------------------------------
// FIGHTER FAVORITES
// --------------------------------------------------------------------------
export interface FighterFavorite {
  id: string
  profile_id: string
  fighter_id: string
  created_at: string
}

// --------------------------------------------------------------------------
// GROUPS
// --------------------------------------------------------------------------
export interface Group {
  id: string
  name: string
  created_by: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export type GroupRole = "owner" | "member"

export interface GroupMember {
  id: string
  group_id: string
  profile_id: string
  role: GroupRole
  joined_at: string
}

export interface GroupInvite {
  id: string
  group_id: string
  token: string
  created_by: string
  expires_at: string | null
  max_uses: number | null
  use_count: number
  is_active: boolean
  created_at: string
}

// --------------------------------------------------------------------------
// PREDICTIONS
// --------------------------------------------------------------------------
export interface Prediction {
  id: string
  profile_id: string
  fight_id: string
  group_id: string | null        // Null = public prediction
  picked_fighter_id: string
  was_favorite_at_pick: boolean       // Snapshot: was picked fighter the favorite at pick time?
  is_correct: boolean | null     // Null until fight scored
  points_earned: number
  locked_at: string | null
  created_at: string
  updated_at: string
}

// --------------------------------------------------------------------------
// MEETUP NUDGES & RESPONSES
// --------------------------------------------------------------------------
export interface MeetupNudge {
  id: string
  group_id: string
  event_id: string
  created_at: string
}

export type MeetupResponseType = "in" | "out" | "maybe"

export interface MeetupResponse {
  id: string
  nudge_id: string
  profile_id: string
  response: MeetupResponseType
  created_at: string
  updated_at: string
}

// --------------------------------------------------------------------------
// GROUP COMPOSITE TYPES (computed from joins, not standalone tables)
// --------------------------------------------------------------------------

export interface GroupMemberWithProfile extends GroupMember {
  profile: Profile
}

export interface GroupDetail extends Group {
  members: GroupMemberWithProfile[]
  memberCount: number
  currentUserRole: GroupRole | null
}

export interface GroupStanding {
  profileId: string
  displayName: string
  avatarUrl: string | null
  rank: number
  totalPoints: number
  totalPredictions: number
  correctPredictions: number
  accuracy: number
}

export interface GroupCardData extends Group {
  memberCount: number
  currentUserRank: number | null
  nextEvent: Event | null
  lastEventName: string | null
  lastEventRank: number | null
}

// --------------------------------------------------------------------------
// LEADERBOARD (computed, not a table — calculated from predictions)
// --------------------------------------------------------------------------

/**
 * Leaderboard entry — computed from the predictions table.
 * Not stored in the database; calculated on-the-fly or cached.
 */
export interface LeaderboardEntry {
  profile: Profile
  total_points: number
  total_predictions: number
  correct_predictions: number
  accuracy: number               // Percentage (0-100)
  rank: number
  title: string                  // Dynamic title based on accuracy
}

/**
 * Title thresholds from the PRD:
 *   "The Oracle"                     → Top 1% accuracy, current event
 *   "Analyst"                        → Top 10% accuracy
 *   "Fight Fan"                      → Default, mid-pack
 *   "Casual"                         → Bottom 25% accuracy
 *   "Picking With Their Eyes Closed" → Active losing streak of 5+
 */
export const LEADERBOARD_TITLES = {
  ORACLE: "The Oracle",
  ANALYST: "Analyst",
  FIGHT_FAN: "Fight Fan",
  CASUAL: "Casual",
  BLIND: "Picking With Their Eyes Closed",
} as const
