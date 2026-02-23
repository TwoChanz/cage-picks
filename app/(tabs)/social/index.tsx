/**
 * Social Hub — Groups-first social screen
 *
 * Shows the user's groups with cards, create/join modals,
 * and a compressed global rank at the bottom.
 */
import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useProfile } from "@/components/providers/profile-provider"
import { getUserGroups, getGlobalRank } from "@/lib/groups"
import { GroupCard } from "@/components/social/group-card"
import { CreateGroupModal } from "@/components/social/create-group-modal"
import { JoinGroupModal } from "@/components/social/join-group-modal"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import type { GroupCardData } from "@/types/database"

export default function SocialScreen() {
  const { profile, isLoading: profileLoading } = useProfile()
  const [groups, setGroups] = useState<GroupCardData[]>([])
  const [globalRank, setGlobalRank] = useState<{ rank: number; total: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  const fetchData = useCallback(async () => {
    if (!profile) return
    try {
      const [groupsData, rankData] = await Promise.all([
        getUserGroups(profile.id),
        getGlobalRank(profile.id),
      ])
      setGroups(groupsData)
      setGlobalRank(rankData)
    } catch (err) {
      console.error("Failed to fetch social data:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [profile])

  useEffect(() => {
    if (profile) fetchData()
  }, [profile, fetchData])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  if (profileLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      </SafeAreaView>
    )
  }

  // Empty state — no groups yet
  if (groups.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          <Ionicons
            name="people-circle-outline"
            size={80}
            color={Colors.foregroundMuted}
          />
          <Text style={styles.emptyTitle}>Start Your Crew</Text>
          <Text style={styles.emptySubtitle}>
            Create a group and invite your friends to compete on fight night predictions.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
            <Text style={styles.primaryButtonText}>Create a Group</Text>
          </Pressable>

          <Pressable onPress={() => setShowJoinModal(true)}>
            <Text style={styles.linkText}>Have an invite code?</Text>
          </Pressable>

          {globalRank && (
            <View style={styles.globalRankRow}>
              <Ionicons name="trophy-outline" size={16} color={Colors.accent} />
              <Text style={styles.globalRankText}>
                Global Rank: #{globalRank.rank} of {globalRank.total}
              </Text>
            </View>
          )}
        </ScrollView>

        <CreateGroupModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchData}
        />
        <JoinGroupModal
          visible={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onJoined={fetchData}
        />
      </SafeAreaView>
    )
  }

  // Groups list
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <Text style={styles.header}>Social</Text>

        {/* Group cards */}
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}

        {/* Create group outline button */}
        <Pressable
          style={styles.outlineButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={18} color={Colors.primary} />
          <Text style={styles.outlineButtonText}>Create Group</Text>
        </Pressable>

        {/* Join link */}
        <Pressable
          style={styles.joinRow}
          onPress={() => setShowJoinModal(true)}
        >
          <Ionicons name="enter-outline" size={16} color={Colors.foregroundMuted} />
          <Text style={styles.joinRowText}>Join with invite code</Text>
        </Pressable>

        {/* Global rank */}
        {globalRank && (
          <View style={styles.globalRankSection}>
            <View style={styles.globalRankRow}>
              <Ionicons name="trophy-outline" size={16} color={Colors.accent} />
              <Text style={styles.globalRankText}>
                Global Rank: #{globalRank.rank} of {globalRank.total}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchData}
      />
      <JoinGroupModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoined={fetchData}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  header: {
    color: Colors.foreground,
    fontSize: FontSize["2xl"],
    fontWeight: "700",
    marginBottom: Spacing.lg,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["3xl"],
  },
  emptyTitle: {
    color: Colors.foreground,
    fontSize: FontSize["2xl"],
    fontWeight: "700",
    marginTop: Spacing.xl,
    textAlign: "center",
  },
  emptySubtitle: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.base,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 22,
    maxWidth: 300,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing["2xl"],
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  linkText: {
    color: Colors.primaryLight,
    fontSize: FontSize.sm,
    marginTop: Spacing.lg,
  },

  // Group list actions
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  outlineButtonText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  joinRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  joinRowText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },

  // Global rank
  globalRankSection: {
    marginTop: Spacing["2xl"],
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  globalRankRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  globalRankText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },
})
