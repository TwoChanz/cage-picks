/**
 * GroupCard — List item for the Groups screen
 *
 * Displays a group's name, member count, the user's role, and
 * a row of member avatars. Tapping navigates to the group detail.
 *
 * LAYOUT:
 * +--------------------------------------------------+
 * |  [Icon]  The Boyz                                 |
 * |          3 members  ·  Owner                      |
 * |          [👤] [👤] [👤]                           |
 * +--------------------------------------------------+
 */
import { View, Text, StyleSheet, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
} from "@/constants/theme"
import { slugify } from "@/lib/utils"
import type { GroupWithMeta } from "@/lib/groups"

interface GroupCardProps {
  group: GroupWithMeta
}

export function GroupCard({ group }: GroupCardProps) {
  const router = useRouter()

  const roleLabel =
    group.current_user_role === "owner" ? "Owner" : "Member"

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => router.push(`/(tabs)/groups/${slugify(group.name)}`)}
    >
      {/* Left section: group icon */}
      <View style={styles.iconContainer}>
        <Ionicons
          name="people-circle"
          size={48}
          color={Colors.primary}
        />
      </View>

      {/* Center section: group info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {group.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.memberCount}>
            {group.member_count} {group.member_count === 1 ? "member" : "members"}
          </Text>
          <View style={styles.dot} />
          <View style={[
            styles.roleBadge,
            group.current_user_role === "owner" && styles.roleBadgeOwner,
          ]}>
            <Text style={[
              styles.roleBadgeText,
              group.current_user_role === "owner" && styles.roleBadgeTextOwner,
            ]}>
              {roleLabel}
            </Text>
          </View>
        </View>

        {/* Member avatar row */}
        <View style={styles.avatarRow}>
          {Array.from({ length: Math.min(group.member_count, 5) }).map(
            (_, i) => (
              <View
                key={i}
                style={[styles.avatarCircle, { marginLeft: i > 0 ? -8 : 0 }]}
              >
                <Ionicons
                  name="person"
                  size={12}
                  color={Colors.foregroundMuted}
                />
              </View>
            )
          )}
          {group.member_count > 5 && (
            <Text style={styles.moreText}>+{group.member_count - 5}</Text>
          )}
        </View>
      </View>

      {/* Right section: chevron */}
      <Ionicons
        name="chevron-forward"
        size={20}
        color={Colors.foregroundMuted}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  cardPressed: {
    backgroundColor: Colors.surfaceLight,
  },

  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  name: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  memberCount: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.foregroundMuted,
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

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 2,
    borderColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    marginLeft: Spacing.xs,
  },
})
