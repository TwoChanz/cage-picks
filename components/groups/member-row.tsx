/**
 * MemberRow — Individual member display in group detail
 *
 * Shows the member's name, title, role badge, and action buttons
 * for group owners (promote/remove).
 *
 * LAYOUT:
 * +--------------------------------------------------+
 * |  [👤]  Marcus Chen            [Owner]  [···]      |
 * |         "The Oracle"                              |
 * +--------------------------------------------------+
 */
import { View, Text, StyleSheet, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
} from "@/constants/theme"
import type { GroupMemberWithProfile } from "@/lib/groups"

interface MemberRowProps {
  member: GroupMemberWithProfile
  isCurrentUserOwner: boolean
  isCurrentUser: boolean
  onRemove?: (profileId: string) => void
  onPromote?: (profileId: string) => void
}

export function MemberRow({
  member,
  isCurrentUserOwner,
  isCurrentUser,
  onRemove,
  onPromote,
}: MemberRowProps) {
  const showActions =
    isCurrentUserOwner && !isCurrentUser && member.role !== "owner"

  return (
    <View style={styles.row}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Ionicons
          name="person-circle"
          size={40}
          color={Colors.foregroundMuted}
        />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {member.profile.display_name}
          </Text>
          {isCurrentUser && (
            <Text style={styles.youLabel}>You</Text>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {member.profile.title}
        </Text>
      </View>

      {/* Role badge */}
      <View
        style={[
          styles.roleBadge,
          member.role === "owner" && styles.roleBadgeOwner,
        ]}
      >
        <Text
          style={[
            styles.roleBadgeText,
            member.role === "owner" && styles.roleBadgeTextOwner,
          ]}
        >
          {member.role === "owner" ? "Owner" : "Member"}
        </Text>
      </View>

      {/* Action buttons (owner only, for non-owners) */}
      {showActions && (
        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => onPromote?.(member.profile_id)}
            hitSlop={8}
          >
            <Ionicons
              name="arrow-up-circle-outline"
              size={20}
              color={Colors.accent}
            />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => onRemove?.(member.profile_id)}
            hitSlop={8}
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={Colors.primary}
            />
          </Pressable>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },

  avatar: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  name: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    fontWeight: "600",
    flexShrink: 1,
  },
  youLabel: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    fontStyle: "italic",
  },
  title: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },

  roleBadge: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  roleBadgeOwner: {
    backgroundColor: Colors.primaryDark,
  },
  roleBadgeText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  roleBadgeTextOwner: {
    color: Colors.foreground,
  },

  actions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.xs,
  },
})
