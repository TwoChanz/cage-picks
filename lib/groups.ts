/**
 * Groups Data Access Layer
 *
 * All Supabase queries for groups, memberships, and invites live here.
 * Follows the same mock-toggle pattern as lib/fighters.ts and
 * lib/predictions.ts for development when Supabase is paused.
 *
 * MOCK DATA:
 * In mock mode, groups are stored in memory for the current session.
 * They reset when the app reloads. When Supabase is active, set
 * USE_MOCK to false and data persists to the database.
 */
import { supabase } from "@/lib/supabase"
import { slugify } from "@/lib/utils"
import type {
  Group,
  GroupMember,
  GroupInvite,
  GroupRole,
  Profile,
} from "@/types/database"

// ── Toggle for mock vs. live data ──
const USE_MOCK = true

// ── Extended types for UI consumption ──

/** Group with member count and the current user's role */
export interface GroupWithMeta extends Group {
  member_count: number
  current_user_role: GroupRole | null
}

/** Group member with profile data joined in */
export interface GroupMemberWithProfile extends GroupMember {
  profile: Profile
}

// ── Mock data stores ──
const mockGroups: Group[] = [
  {
    id: "g1",
    name: "The Boyz",
    created_by: "mock-profile-1",
    image_url: null,
    created_at: "2025-12-01T00:00:00Z",
    updated_at: "2025-12-01T00:00:00Z",
  },
  {
    id: "g2",
    name: "Fight Club",
    created_by: "mock-profile-2",
    image_url: null,
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-01-15T00:00:00Z",
  },
]

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
]

const mockMembers: GroupMember[] = [
  // The Boyz members
  {
    id: "gm1",
    group_id: "g1",
    profile_id: "mock-profile-1",
    role: "owner",
    joined_at: "2025-12-01T00:00:00Z",
  },
  {
    id: "gm2",
    group_id: "g1",
    profile_id: "mock-profile-2",
    role: "member",
    joined_at: "2025-12-02T00:00:00Z",
  },
  {
    id: "gm3",
    group_id: "g1",
    profile_id: "mock-profile-3",
    role: "member",
    joined_at: "2025-12-05T00:00:00Z",
  },
  // Fight Club members
  {
    id: "gm4",
    group_id: "g2",
    profile_id: "mock-profile-2",
    role: "owner",
    joined_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "gm5",
    group_id: "g2",
    profile_id: "mock-profile-1",
    role: "member",
    joined_at: "2026-01-16T00:00:00Z",
  },
  {
    id: "gm6",
    group_id: "g2",
    profile_id: "mock-profile-4",
    role: "member",
    joined_at: "2026-01-17T00:00:00Z",
  },
]

const mockInvites: GroupInvite[] = [
  {
    id: "inv1",
    group_id: "g1",
    token: "abc123-the-boyz",
    created_by: "mock-profile-1",
    expires_at: null,
    max_uses: null,
    use_count: 2,
    is_active: true,
    created_at: "2025-12-01T00:00:00Z",
  },
]

// ==========================================================================
// GROUP CRUD
// ==========================================================================

/**
 * Fetch all groups the user belongs to, with member counts.
 *
 * Uses the N+1 prevention pattern: one query for group_members (filtered
 * by profile), then one query for the groups themselves.
 */
export async function getGroupsByUser(
  profileId: string
): Promise<GroupWithMeta[]> {
  if (USE_MOCK) {
    const userMemberships = mockMembers.filter(
      (m) => m.profile_id === profileId
    )
    return userMemberships.map((membership) => {
      const group = mockGroups.find((g) => g.id === membership.group_id)!
      const memberCount = mockMembers.filter(
        (m) => m.group_id === membership.group_id
      ).length
      return {
        ...group,
        member_count: memberCount,
        current_user_role: membership.role,
      }
    })
  }

  // Query 1: Get group IDs the user belongs to, with their role
  const { data: memberships, error: memberError } = await supabase
    .from("group_members")
    .select("group_id, role")
    .eq("profile_id", profileId)

  if (memberError || !memberships?.length) {
    if (memberError) console.error("Failed to fetch memberships:", memberError)
    return []
  }

  const groupIds = memberships.map((m) => m.group_id)

  // Query 2: Get the groups + member counts
  const { data: groups, error: groupError } = await supabase
    .from("groups")
    .select("*, group_members(count)")
    .in("id", groupIds)

  if (groupError) {
    console.error("Failed to fetch groups:", groupError)
    return []
  }

  // Stitch together in JS
  const roleMap = new Map(memberships.map((m) => [m.group_id, m.role]))
  return (groups ?? []).map((g: any) => ({
    ...g,
    member_count: g.group_members?.[0]?.count ?? 0,
    current_user_role: roleMap.get(g.id) ?? null,
  }))
}

/**
 * Fetch a single group by its name slug, with member count.
 */
export async function getGroupBySlug(
  slug: string,
  profileId: string
): Promise<GroupWithMeta | null> {
  if (USE_MOCK) {
    const group = mockGroups.find((g) => slugify(g.name) === slug)
    if (!group) return null

    const memberCount = mockMembers.filter(
      (m) => m.group_id === group.id
    ).length
    const membership = mockMembers.find(
      (m) => m.group_id === group.id && m.profile_id === profileId
    )
    return {
      ...group,
      member_count: memberCount,
      current_user_role: membership?.role ?? null,
    }
  }

  // Supabase doesn't have a slug column on groups, so we derive it
  // For production, you'd add a slug column or use the ID in the URL
  const { data: groups, error } = await supabase
    .from("groups")
    .select("*, group_members(count)")

  if (error || !groups) return null

  const group = groups.find((g: any) => slugify(g.name) === slug)
  if (!group) return null

  const { data: membership } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", (group as any).id)
    .eq("profile_id", profileId)
    .single()

  return {
    ...(group as any),
    member_count: (group as any).group_members?.[0]?.count ?? 0,
    current_user_role: membership?.role ?? null,
  }
}

/**
 * Create a new group. The creator is automatically added as the owner.
 */
export async function createGroup(
  profileId: string,
  name: string
): Promise<Group | null> {
  if (USE_MOCK) {
    const now = new Date().toISOString()
    const newGroup: Group = {
      id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      created_by: profileId,
      image_url: null,
      created_at: now,
      updated_at: now,
    }
    mockGroups.push(newGroup)

    // Auto-add creator as owner
    mockMembers.push({
      id: `gm-${Date.now()}`,
      group_id: newGroup.id,
      profile_id: profileId,
      role: "owner",
      joined_at: now,
    })

    return newGroup
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({ name, created_by: profileId })
    .select()
    .single()

  if (groupError || !group) {
    console.error("Failed to create group:", groupError)
    return null
  }

  // Add creator as owner
  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    profile_id: profileId,
    role: "owner",
  })

  if (memberError) {
    console.error("Failed to add owner to group:", memberError)
  }

  return group as Group
}

// ==========================================================================
// GROUP MEMBERSHIP
// ==========================================================================

/**
 * Fetch all members of a group, with profile data joined in.
 */
export async function getGroupMembers(
  groupId: string
): Promise<GroupMemberWithProfile[]> {
  if (USE_MOCK) {
    return mockMembers
      .filter((m) => m.group_id === groupId)
      .map((m) => ({
        ...m,
        profile: mockProfiles.find((p) => p.id === m.profile_id)!,
      }))
      .sort((a, b) => {
        // Owners first, then alphabetical
        if (a.role === "owner" && b.role !== "owner") return -1
        if (b.role === "owner" && a.role !== "owner") return 1
        return a.profile.display_name.localeCompare(b.profile.display_name)
      })
  }

  const { data, error } = await supabase
    .from("group_members")
    .select("*, profile:profiles(*)")
    .eq("group_id", groupId)
    .order("role", { ascending: true }) // owner first

  if (error) {
    console.error("Failed to fetch group members:", error)
    return []
  }

  return (data ?? []) as GroupMemberWithProfile[]
}

/**
 * Join a group as a regular member.
 */
export async function joinGroup(
  groupId: string,
  profileId: string
): Promise<boolean> {
  if (USE_MOCK) {
    const alreadyMember = mockMembers.some(
      (m) => m.group_id === groupId && m.profile_id === profileId
    )
    if (alreadyMember) return false

    mockMembers.push({
      id: `gm-${Date.now()}`,
      group_id: groupId,
      profile_id: profileId,
      role: "member",
      joined_at: new Date().toISOString(),
    })
    return true
  }

  const { error } = await supabase.from("group_members").insert({
    group_id: groupId,
    profile_id: profileId,
    role: "member",
  })

  if (error) {
    console.error("Failed to join group:", error)
    return false
  }
  return true
}

/**
 * Leave a group. Owners cannot leave — they must transfer ownership first.
 */
export async function leaveGroup(
  groupId: string,
  profileId: string
): Promise<boolean> {
  if (USE_MOCK) {
    const idx = mockMembers.findIndex(
      (m) => m.group_id === groupId && m.profile_id === profileId
    )
    if (idx === -1) return false
    if (mockMembers[idx].role === "owner") return false
    mockMembers.splice(idx, 1)
    return true
  }

  // Check role first — don't let owners leave
  const { data: member } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("profile_id", profileId)
    .single()

  if (member?.role === "owner") return false

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("profile_id", profileId)

  if (error) {
    console.error("Failed to leave group:", error)
    return false
  }
  return true
}

/**
 * Update a member's role (promote to owner or demote to member).
 * Only the current owner can do this.
 */
export async function updateMemberRole(
  groupId: string,
  targetProfileId: string,
  newRole: GroupRole
): Promise<boolean> {
  if (USE_MOCK) {
    const member = mockMembers.find(
      (m) => m.group_id === groupId && m.profile_id === targetProfileId
    )
    if (!member) return false
    member.role = newRole
    return true
  }

  const { error } = await supabase
    .from("group_members")
    .update({ role: newRole })
    .eq("group_id", groupId)
    .eq("profile_id", targetProfileId)

  if (error) {
    console.error("Failed to update member role:", error)
    return false
  }
  return true
}

/**
 * Remove a member from a group. Only owners can remove members.
 */
export async function removeMember(
  groupId: string,
  targetProfileId: string
): Promise<boolean> {
  if (USE_MOCK) {
    const idx = mockMembers.findIndex(
      (m) => m.group_id === groupId && m.profile_id === targetProfileId
    )
    if (idx === -1) return false
    if (mockMembers[idx].role === "owner") return false
    mockMembers.splice(idx, 1)
    return true
  }

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("profile_id", targetProfileId)

  if (error) {
    console.error("Failed to remove member:", error)
    return false
  }
  return true
}

// ==========================================================================
// GROUP INVITES
// ==========================================================================

/**
 * Create a new invite link for a group.
 */
export async function createInvite(
  groupId: string,
  profileId: string
): Promise<GroupInvite | null> {
  if (USE_MOCK) {
    const now = new Date().toISOString()
    const invite: GroupInvite = {
      id: `inv-${Date.now()}`,
      group_id: groupId,
      token: `${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`,
      created_by: profileId,
      expires_at: null,
      max_uses: null,
      use_count: 0,
      is_active: true,
      created_at: now,
    }
    mockInvites.push(invite)
    return invite
  }

  const { data, error } = await supabase
    .from("group_invites")
    .insert({
      group_id: groupId,
      created_by: profileId,
    })
    .select()
    .single()

  if (error) {
    console.error("Failed to create invite:", error)
    return null
  }

  return data as GroupInvite
}

/**
 * Look up an invite by its shareable token.
 * Returns the invite with the group name for display.
 */
export async function getInviteByToken(
  token: string
): Promise<(GroupInvite & { group_name: string }) | null> {
  if (USE_MOCK) {
    const invite = mockInvites.find(
      (i) => i.token === token && i.is_active
    )
    if (!invite) return null

    const group = mockGroups.find((g) => g.id === invite.group_id)
    return { ...invite, group_name: group?.name ?? "Unknown" }
  }

  const { data, error } = await supabase
    .from("group_invites")
    .select("*, group:groups(name)")
    .eq("token", token)
    .eq("is_active", true)
    .single()

  if (error || !data) return null

  return {
    ...(data as any),
    group_name: (data as any).group?.name ?? "Unknown",
  }
}

/**
 * Accept an invite — join the group and increment use_count.
 */
export async function acceptInvite(
  token: string,
  profileId: string
): Promise<boolean> {
  if (USE_MOCK) {
    const invite = mockInvites.find(
      (i) => i.token === token && i.is_active
    )
    if (!invite) return false

    // Check max uses
    if (invite.max_uses !== null && invite.use_count >= invite.max_uses) {
      return false
    }

    const joined = await joinGroup(invite.group_id, profileId)
    if (joined) {
      invite.use_count += 1
    }
    return joined
  }

  // Look up the invite
  const { data: invite, error: inviteError } = await supabase
    .from("group_invites")
    .select("*")
    .eq("token", token)
    .eq("is_active", true)
    .single()

  if (inviteError || !invite) return false

  // Check max uses
  if (invite.max_uses !== null && invite.use_count >= invite.max_uses) {
    return false
  }

  // Join the group
  const joined = await joinGroup(invite.group_id, profileId)
  if (!joined) return false

  // Increment use count
  await supabase
    .from("group_invites")
    .update({ use_count: invite.use_count + 1 })
    .eq("id", invite.id)

  return true
}

/**
 * Deactivate an invite link.
 */
export async function revokeInvite(inviteId: string): Promise<boolean> {
  if (USE_MOCK) {
    const invite = mockInvites.find((i) => i.id === inviteId)
    if (!invite) return false
    invite.is_active = false
    return true
  }

  const { error } = await supabase
    .from("group_invites")
    .update({ is_active: false })
    .eq("id", inviteId)

  if (error) {
    console.error("Failed to revoke invite:", error)
    return false
  }
  return true
}

/**
 * Get the active invite for a group (create one if none exists).
 * Most groups will have a single reusable invite link.
 */
export async function getOrCreateInvite(
  groupId: string,
  profileId: string
): Promise<GroupInvite | null> {
  if (USE_MOCK) {
    const existing = mockInvites.find(
      (i) => i.group_id === groupId && i.is_active
    )
    if (existing) return existing
    return createInvite(groupId, profileId)
  }

  // Try to find existing active invite
  const { data: existing } = await supabase
    .from("group_invites")
    .select("*")
    .eq("group_id", groupId)
    .eq("is_active", true)
    .limit(1)
    .single()

  if (existing) return existing as GroupInvite

  return createInvite(groupId, profileId)
}
