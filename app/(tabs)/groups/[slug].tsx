/**
 * Group Detail Screen
 *
 * Shows group info, member list, invite link sharing, and
 * management actions (leave, remove members, promote).
 *
 * DATA FLOW:
 * 1. Screen mounts with slug from URL params
 * 2. getGroupBySlug() fetches group meta
 * 3. getGroupMembers() fetches members with profiles
 * 4. FlatList renders MemberRow components
 */
import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
  Share,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import {
  getGroupBySlug,
  getGroupMembers,
  getOrCreateInvite,
  leaveGroup,
  removeMember,
  updateMemberRole,
  type GroupWithMeta,
  type GroupMemberWithProfile,
} from "@/lib/groups"
import { MemberRow } from "@/components/groups/member-row"

// Mock profile ID for development
const MOCK_PROFILE_ID = "mock-profile-1"

export default function GroupDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const router = useRouter()

  const [group, setGroup] = useState<GroupWithMeta | null>(null)
  const [members, setMembers] = useState<GroupMemberWithProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!slug) return

    const groupData = await getGroupBySlug(slug, MOCK_PROFILE_ID)
    setGroup(groupData)

    if (groupData) {
      const m = await getGroupMembers(groupData.id)
      setMembers(m)
    }
  }, [slug])

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false))
  }, [fetchData])

  const handleShareInvite = async () => {
    if (!group) return

    const invite = await getOrCreateInvite(group.id, MOCK_PROFILE_ID)
    if (!invite) {
      Alert.alert("Error", "Failed to create invite link")
      return
    }

    await Share.share({
      message: `Join my group "${group.name}" on FightNight OS!\n\nUse invite code: ${invite.token}`,
    })
  }

  const handleLeaveGroup = () => {
    if (!group) return

    if (group.current_user_role === "owner") {
      Alert.alert(
        "Can't Leave",
        "You're the owner. Transfer ownership to another member first."
      )
      return
    }

    Alert.alert("Leave Group", `Are you sure you want to leave "${group.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          const success = await leaveGroup(group.id, MOCK_PROFILE_ID)
          if (success) {
            router.back()
          }
        },
      },
    ])
  }

  const handleRemoveMember = (profileId: string) => {
    if (!group) return
    const member = members.find((m) => m.profile_id === profileId)
    if (!member) return

    Alert.alert(
      "Remove Member",
      `Remove ${member.profile.display_name} from the group?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const success = await removeMember(group.id, profileId)
            if (success) {
              setMembers((prev) =>
                prev.filter((m) => m.profile_id !== profileId)
              )
              setGroup((prev) =>
                prev ? { ...prev, member_count: prev.member_count - 1 } : prev
              )
            }
          },
        },
      ]
    )
  }

  const handlePromoteMember = (profileId: string) => {
    if (!group) return
    const member = members.find((m) => m.profile_id === profileId)
    if (!member) return

    Alert.alert(
      "Promote to Owner",
      `Make ${member.profile.display_name} an owner? You will remain an owner as well.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Promote",
          onPress: async () => {
            const success = await updateMemberRole(
              group.id,
              profileId,
              "owner"
            )
            if (success) {
              setMembers((prev) =>
                prev.map((m) =>
                  m.profile_id === profileId ? { ...m, role: "owner" } : m
                )
              )
            }
          },
        },
      ]
    )
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (!group) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    )
  }

  const isOwner = group.current_user_role === "owner"

  return (
    <View style={styles.container}>
      <FlatList
        data={members}
        keyExtractor={(member) => member.id}
        renderItem={({ item }) => (
          <MemberRow
            member={item}
            isCurrentUserOwner={isOwner}
            isCurrentUser={item.profile_id === MOCK_PROFILE_ID}
            onRemove={handleRemoveMember}
            onPromote={handlePromoteMember}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={styles.memberSeparator} />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Group icon and name */}
            <View style={styles.groupHeader}>
              <Ionicons
                name="people-circle"
                size={64}
                color={Colors.primary}
              />
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.memberCountText}>
                {group.member_count}{" "}
                {group.member_count === 1 ? "member" : "members"}
              </Text>
            </View>

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={handleShareInvite}
              >
                <Ionicons name="share-outline" size={18} color={Colors.primary} />
                <Text style={styles.actionButtonText}>Invite</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.actionButtonDanger,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={handleLeaveGroup}
              >
                <Ionicons
                  name="exit-outline"
                  size={18}
                  color={Colors.primary}
                />
                <Text style={styles.actionButtonText}>Leave</Text>
              </Pressable>
            </View>

            {/* Members section header */}
            <Text style={styles.sectionTitle}>Members</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingBottom: Spacing["3xl"],
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.base,
  },

  // Header section
  headerSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  groupHeader: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  groupName: {
    color: Colors.foreground,
    fontSize: FontSize["2xl"],
    fontWeight: "800",
  },
  memberCountText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },

  // Action buttons
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  actionButtonDanger: {
    borderColor: Colors.primaryDark,
  },
  actionButtonPressed: {
    backgroundColor: Colors.surfaceLight,
  },
  actionButtonText: {
    color: Colors.foreground,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },

  // Members section
  sectionTitle: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.sm,
  },
  memberSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },
})
