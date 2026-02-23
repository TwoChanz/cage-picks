/**
 * Groups Data Access Layer
 *
 * All Supabase queries for groups, group members, invites, and standings.
 * Follows the N+1 prevention pattern from lib/events.ts — batch queries
 * then stitch in JS.
 */
import { supabase } from "@/lib/supabase"
import type {
  Group,
  GroupMember,
  GroupInvite,
  GroupDetail,
  GroupMemberWithProfile,
  GroupStanding,
  GroupCardData,
  Event,
  Profile,
  EventStatus,
} from "@/types/database"

const GROUP_MEMBER_CAP = 25

// ── Event Banner State ──────────────────────────────────────────────────

export type EventBannerState =
  | { type: "no_event" }
  | { type: "picks_open"; event: Event; daysUntilLock: number }
  | { type: "picks_locked"; event: Event }
  | { type: "live"; event: Event; fightsCompleted: number; fightsTotal: number }
  | { type: "between_events"; lastEventName: string | null; nextEventSoon: boolean }

/**
 * Compute the banner state from event data.
 * Pure function — no side effects.
 */
export function computeEventBannerState(
  nextEvent: Event | null,
  fightsCompleted?: number,
  fightsTotal?: number
): EventBannerState {
  if (!nextEvent) {
    return { type: "no_event" }
  }

  const now = new Date()
  const eventDate = new Date(nextEvent.date)

  if (nextEvent.status === "live") {
    return {
      type: "live",
      event: nextEvent,
      fightsCompleted: fightsCompleted ?? 0,
      fightsTotal: fightsTotal ?? 0,
    }
  }

  if (nextEvent.status === "completed") {
    return {
      type: "between_events",
      lastEventName: nextEvent.name,
      nextEventSoon: false,
    }
  }

  // upcoming
  if (now < eventDate) {
    const msUntil = eventDate.getTime() - now.getTime()
    const daysUntilLock = Math.ceil(msUntil / (1000 * 60 * 60 * 24))
    return { type: "picks_open", event: nextEvent, daysUntilLock }
  }

  // Event date has passed but status still "upcoming" — picks locked
  return { type: "picks_locked", event: nextEvent }
}

// ── User's Groups (Social Hub) ──────────────────────────────────────────

/**
 * Fetch all groups the user belongs to with card metadata.
 *
 * QUERY STRATEGY (2 queries + JS stitch):
 * 1. Fetch group_members for this profile (with group join)
 * 2. Fetch member counts and next event in parallel
 */
export async function getUserGroups(profileId: string): Promise<GroupCardData[]> {
  // Query 1: User's group memberships with group data
  const { data: memberships, error: memberError } = await supabase
    .from("group_members")
    .select(`
      *,
      group:groups(*)
    `)
    .eq("profile_id", profileId)

  if (memberError || !memberships?.length) return []

  const groups = memberships.map((m: any) => m.group as Group)
  const groupIds = groups.map((g) => g.id)

  // Query 2: Member counts per group
  const { data: allMembers } = await supabase
    .from("group_members")
    .select("group_id")
    .in("group_id", groupIds)

  const memberCounts = new Map<string, number>()
  for (const m of allMembers ?? []) {
    memberCounts.set(m.group_id, (memberCounts.get(m.group_id) ?? 0) + 1)
  }

  // Query 3: Next upcoming event (single query, reused for all cards)
  const nextEvent = await getNextEventForBanner()

  // Query 4: User's standings in each group for rank
  const rankPromises = groupIds.map(async (groupId) => {
    const standings = await getGroupStandings(groupId)
    const userStanding = standings.find((s) => s.profileId === profileId)
    return { groupId, rank: userStanding?.rank ?? null }
  })
  const ranks = await Promise.all(rankPromises)
  const rankMap = new Map(ranks.map((r) => [r.groupId, r.rank]))

  return groups.map((group) => ({
    ...group,
    memberCount: memberCounts.get(group.id) ?? 0,
    currentUserRank: rankMap.get(group.id) ?? null,
    nextEvent,
    lastEventName: null,
    lastEventRank: null,
  }))
}

// ── Group Detail ────────────────────────────────────────────────────────

/**
 * Fetch a group with all its members and their profile data.
 */
export async function getGroupDetail(
  groupId: string,
  currentProfileId: string
): Promise<GroupDetail | null> {
  // Query 1: Group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single()

  if (groupError || !group) return null

  // Query 2: Members with profiles
  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true })

  if (membersError) return null

  const typedMembers = (members ?? []).map((m: any) => ({
    ...m,
    profile: m.profile as Profile,
  })) as GroupMemberWithProfile[]

  const currentMember = typedMembers.find((m) => m.profile_id === currentProfileId)

  return {
    ...group,
    members: typedMembers,
    memberCount: typedMembers.length,
    currentUserRole: (currentMember?.role as GroupDetail["currentUserRole"]) ?? null,
  }
}

// ── Standings ───────────────────────────────────────────────────────────

/**
 * Fetch group standings via the get_group_standings RPC.
 * Assigns ranks client-side.
 */
export async function getGroupStandings(groupId: string): Promise<GroupStanding[]> {
  const { data, error } = await supabase.rpc("get_group_standings", {
    p_group_id: groupId,
  })

  if (error || !data) return []

  return (data as any[]).map((row, index) => ({
    profileId: row.profile_id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    rank: index + 1,
    totalPoints: Number(row.total_points),
    totalPredictions: Number(row.total_predictions),
    correctPredictions: Number(row.correct_predictions),
    accuracy:
      Number(row.total_predictions) > 0
        ? Math.round(
            (Number(row.correct_predictions) / Number(row.total_predictions)) * 100
          )
        : 0,
  }))
}

// ── Group CRUD ──────────────────────────────────────────────────────────

/**
 * Create a new group. Inserts the group, owner membership, and initial invite.
 * Returns the created group or null on failure.
 */
export async function createGroup(
  profileId: string,
  name: string
): Promise<Group | null> {
  // 1. Create group
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ name, created_by: profileId })
    .select()
    .single()

  if (groupError || !group) {
    console.error("Failed to create group:", groupError)
    return null
  }

  // 2. Add creator as owner member
  const { error: memberError } = await supabase
    .from("group_members")
    .insert({ group_id: group.id, profile_id: profileId, role: "owner" })

  if (memberError) {
    console.error("Failed to add owner to group:", memberError)
    // Clean up the group
    await supabase.from("groups").delete().eq("id", group.id)
    return null
  }

  // 3. Create initial invite
  await supabase
    .from("group_invites")
    .insert({ group_id: group.id, created_by: profileId })

  return group as Group
}

/**
 * Join a group using an invite token.
 * Validates the invite, checks member cap, inserts member, increments use_count.
 */
export async function joinGroupByToken(
  profileId: string,
  token: string
): Promise<{ group: Group } | { error: string }> {
  // 1. Find the invite
  const { data: invite, error: inviteError } = await supabase
    .from("group_invites")
    .select("*, group:groups(*)")
    .eq("token", token)
    .eq("is_active", true)
    .single()

  if (inviteError || !invite) {
    return { error: "Invalid or expired invite code" }
  }

  // 2. Check if invite has max_uses limit
  if (invite.max_uses && invite.use_count >= invite.max_uses) {
    return { error: "This invite has reached its maximum uses" }
  }

  // 3. Check if invite is expired
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { error: "This invite has expired" }
  }

  const groupId = invite.group_id

  // 4. Check member cap
  const { count } = await supabase
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId)

  if (count !== null && count >= GROUP_MEMBER_CAP) {
    return { error: "This group is full (~25 members max)" }
  }

  // 5. Check if already a member
  const { data: existing } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", groupId)
    .eq("profile_id", profileId)
    .single()

  if (existing) {
    return { error: "You're already in this group" }
  }

  // 6. Insert member
  const { error: joinError } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, profile_id: profileId, role: "member" })

  if (joinError) {
    console.error("Failed to join group:", joinError)
    return { error: "Failed to join group. Please try again." }
  }

  // 7. Increment use_count
  await supabase
    .from("group_invites")
    .update({ use_count: invite.use_count + 1 })
    .eq("id", invite.id)

  return { group: (invite as any).group as Group }
}

/**
 * Get or create an active invite for a group.
 */
export async function getOrCreateGroupInvite(
  groupId: string,
  profileId: string
): Promise<GroupInvite | null> {
  // Try to find existing active invite
  const { data: existing } = await supabase
    .from("group_invites")
    .select("*")
    .eq("group_id", groupId)
    .eq("is_active", true)
    .limit(1)
    .single()

  if (existing) return existing as GroupInvite

  // Create a new one
  const { data: invite, error } = await supabase
    .from("group_invites")
    .insert({ group_id: groupId, created_by: profileId })
    .select()
    .single()

  if (error) {
    console.error("Failed to create invite:", error)
    return null
  }

  return invite as GroupInvite
}

/**
 * Rename a group (owner only — enforced by RLS).
 */
export async function renameGroup(
  groupId: string,
  newName: string
): Promise<boolean> {
  const { error } = await supabase
    .from("groups")
    .update({ name: newName, updated_at: new Date().toISOString() })
    .eq("id", groupId)

  if (error) {
    console.error("Failed to rename group:", error)
    return false
  }
  return true
}

/**
 * Delete a group (owner only — enforced by RLS).
 * Cascades delete to group_members and group_invites via FK constraints.
 */
export async function deleteGroup(groupId: string): Promise<boolean> {
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId)

  if (error) {
    console.error("Failed to delete group:", error)
    return false
  }
  return true
}

// ── Event Helpers ───────────────────────────────────────────────────────

/**
 * Fetch the next upcoming event or most recent completed event.
 * Used for the event banner in group detail.
 */
export async function getNextEventForBanner(): Promise<Event | null> {
  // Try upcoming first
  const { data: upcoming } = await supabase
    .from("events")
    .select("*")
    .in("status", ["upcoming", "live"])
    .order("date", { ascending: true })
    .limit(1)
    .single()

  if (upcoming) return upcoming as Event

  // Fall back to most recent completed
  const { data: completed } = await supabase
    .from("events")
    .select("*")
    .eq("status", "completed")
    .order("date", { ascending: false })
    .limit(1)
    .single()

  return (completed as Event) ?? null
}

/**
 * Get fight completion stats for a live event.
 */
export async function getEventFightStats(
  eventId: string
): Promise<{ completed: number; total: number }> {
  const { data: fights } = await supabase
    .from("fights")
    .select("status")
    .eq("event_id", eventId)

  if (!fights) return { completed: 0, total: 0 }

  return {
    completed: fights.filter((f: any) => f.status === "completed").length,
    total: fights.length,
  }
}

// ── Global Rank ─────────────────────────────────────────────────────────

/**
 * Fetch the user's global rank among all predictors.
 */
export async function getGlobalRank(
  profileId: string
): Promise<{ rank: number; total: number } | null> {
  const { data, error } = await supabase.rpc("get_global_rank", {
    p_profile_id: profileId,
  })

  if (error || !data?.length) return null

  const row = data[0]
  if (!row.rank) return null

  return {
    rank: Number(row.rank),
    total: Number(row.total),
  }
}
