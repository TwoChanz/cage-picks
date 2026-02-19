/**
 * Meetup Nudges Data Access Layer
 *
 * Handles watch party coordination within groups. Before a fight card,
 * a nudge goes out asking "Who's watching?" Group members respond
 * with In / Out / Maybe.
 *
 * MOCK DATA:
 * In mock mode, nudges and responses are stored in memory.
 */
import { supabase } from "@/lib/supabase"
import type {
  MeetupNudge,
  MeetupResponse,
  MeetupResponseType,
  Profile,
} from "@/types/database"

// ── Toggle for mock vs. live data ──
const USE_MOCK = true

// ── Extended types ──

export interface MeetupResponseWithProfile extends MeetupResponse {
  profile: Profile
}

export interface NudgeWithResponses extends MeetupNudge {
  responses: MeetupResponseWithProfile[]
}

// ── Mock data ──

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
]

const mockNudges: MeetupNudge[] = [
  {
    id: "nudge-1",
    group_id: "g1",
    event_id: "evt-1",
    created_at: "2026-02-15T00:00:00Z",
  },
]

const mockResponses: MeetupResponse[] = [
  {
    id: "mr-1",
    nudge_id: "nudge-1",
    profile_id: "mock-profile-1",
    response: "in",
    created_at: "2026-02-15T01:00:00Z",
    updated_at: "2026-02-15T01:00:00Z",
  },
  {
    id: "mr-2",
    nudge_id: "nudge-1",
    profile_id: "mock-profile-2",
    response: "maybe",
    created_at: "2026-02-15T02:00:00Z",
    updated_at: "2026-02-15T02:00:00Z",
  },
]

/**
 * Get all nudges for a specific event across the user's groups.
 * Returns nudges with their responses and profile data.
 */
export async function getNudgesForEvent(
  eventId: string,
  profileId: string
): Promise<NudgeWithResponses[]> {
  if (USE_MOCK) {
    return mockNudges
      .filter((n) => n.event_id === eventId)
      .map((nudge) => ({
        ...nudge,
        responses: mockResponses
          .filter((r) => r.nudge_id === nudge.id)
          .map((r) => ({
            ...r,
            profile: mockProfiles.find((p) => p.id === r.profile_id)!,
          })),
      }))
  }

  // Get user's group IDs first
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("profile_id", profileId)

  if (!memberships?.length) return []

  const groupIds = memberships.map((m) => m.group_id)

  const { data: nudges, error } = await supabase
    .from("meetup_nudges")
    .select("*")
    .eq("event_id", eventId)
    .in("group_id", groupIds)

  if (error || !nudges?.length) return []

  const nudgeIds = nudges.map((n: any) => n.id)

  const { data: responses } = await supabase
    .from("meetup_responses")
    .select("*, profile:profiles(*)")
    .in("nudge_id", nudgeIds)

  const responseMap = new Map<string, MeetupResponseWithProfile[]>()
  for (const r of (responses ?? []) as MeetupResponseWithProfile[]) {
    const existing = responseMap.get(r.nudge_id) ?? []
    existing.push(r)
    responseMap.set(r.nudge_id, existing)
  }

  return (nudges as MeetupNudge[]).map((nudge) => ({
    ...nudge,
    responses: responseMap.get(nudge.id) ?? [],
  }))
}

/**
 * Create or get a nudge for a group + event combination.
 * Each group can only have one nudge per event (enforced by unique constraint).
 */
export async function getOrCreateNudge(
  groupId: string,
  eventId: string
): Promise<MeetupNudge | null> {
  if (USE_MOCK) {
    const existing = mockNudges.find(
      (n) => n.group_id === groupId && n.event_id === eventId
    )
    if (existing) return existing

    const nudge: MeetupNudge = {
      id: `nudge-${Date.now()}`,
      group_id: groupId,
      event_id: eventId,
      created_at: new Date().toISOString(),
    }
    mockNudges.push(nudge)
    return nudge
  }

  // Try upsert (insert or return existing)
  const { data, error } = await supabase
    .from("meetup_nudges")
    .upsert(
      { group_id: groupId, event_id: eventId },
      { onConflict: "group_id,event_id" }
    )
    .select()
    .single()

  if (error) {
    console.error("Failed to get/create nudge:", error)
    return null
  }

  return data as MeetupNudge
}

/**
 * Respond to a meetup nudge (In / Out / Maybe).
 * Updates if the user already responded.
 */
export async function respondToNudge(
  nudgeId: string,
  profileId: string,
  response: MeetupResponseType
): Promise<MeetupResponse | null> {
  if (USE_MOCK) {
    const existing = mockResponses.find(
      (r) => r.nudge_id === nudgeId && r.profile_id === profileId
    )
    const now = new Date().toISOString()

    if (existing) {
      existing.response = response
      existing.updated_at = now
      return existing
    }

    const newResponse: MeetupResponse = {
      id: `mr-${Date.now()}`,
      nudge_id: nudgeId,
      profile_id: profileId,
      response,
      created_at: now,
      updated_at: now,
    }
    mockResponses.push(newResponse)
    return newResponse
  }

  const { data, error } = await supabase
    .from("meetup_responses")
    .upsert(
      {
        nudge_id: nudgeId,
        profile_id: profileId,
        response,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "nudge_id,profile_id" }
    )
    .select()
    .single()

  if (error) {
    console.error("Failed to respond to nudge:", error)
    return null
  }

  return data as MeetupResponse
}

/**
 * Send a nudge notification to all group members for an event.
 * This creates the nudge and triggers push notifications.
 */
export async function sendNudge(
  groupId: string,
  eventId: string
): Promise<MeetupNudge | null> {
  const nudge = await getOrCreateNudge(groupId, eventId)
  // In production, this would also trigger push notifications
  // to all group members via lib/notifications.ts
  return nudge
}
