/**
 * Member List — shows all group members with role badges
 *
 * Owner gets a crown icon + "Owner" badge.
 * Includes a "Share Invite Link" button at the bottom.
 */
import { View, Text, StyleSheet, Image, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import type { GroupMemberWithProfile } from "@/types/database"

interface Props {
  members: GroupMemberWithProfile[]
  ownerId: string
  onShareInvite: () => void
}

export function MemberList({ members, ownerId, onShareInvite }: Props) {
  return (
    <View>
      {members.map((member) => {
        const isOwner = member.profile_id === ownerId
        return (
          <View key={member.id} style={styles.row}>
            {/* Avatar */}
            {member.profile.avatar_url ? (
              <Image source={{ uri: member.profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={16} color={Colors.foregroundMuted} />
              </View>
            )}

            {/* Name */}
            <Text style={styles.name} numberOfLines={1}>
              {member.profile.display_name}
            </Text>

            {/* Owner badge */}
            {isOwner && (
              <View style={styles.ownerBadge}>
                <Ionicons name="shield" size={12} color={Colors.accent} />
                <Text style={styles.ownerText}>Owner</Text>
              </View>
            )}
          </View>
        )
      })}

      {/* Share invite button */}
      <Pressable style={styles.shareButton} onPress={onShareInvite}>
        <Ionicons name="link-outline" size={16} color={Colors.primary} />
        <Text style={styles.shareText}>Share Invite Link</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    color: Colors.foreground,
    fontSize: FontSize.base,
    flex: 1,
  },
  ownerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.accent + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  ownerText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
  },
  shareText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
})
