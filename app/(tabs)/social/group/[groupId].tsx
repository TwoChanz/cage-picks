/**
 * Group Detail Screen
 *
 * Shows group header, event banner, standings, and member list.
 * Owner gets a settings gear in the header.
 */
import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Share,
  RefreshControl,
  Platform,
  TextInput,
  Modal,
} from "react-native"
import { useLocalSearchParams, useNavigation, router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useProfile } from "@/components/providers/profile-provider"
import {
  getGroupDetail,
  getGroupStandings,
  getNextEventForBanner,
  getEventFightStats,
  getOrCreateGroupInvite,
  renameGroup,
  deleteGroup,
  computeEventBannerState,
} from "@/lib/groups"
import { EventBanner } from "@/components/social/event-banner"
import { StandingsList } from "@/components/social/standings-list"
import { MemberList } from "@/components/social/member-list"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import type { GroupDetail, GroupStanding, Event } from "@/types/database"
import type { EventBannerState } from "@/lib/groups"

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const { profile } = useProfile()
  const navigation = useNavigation()

  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [standings, setStandings] = useState<GroupStanding[]>([])
  const [bannerState, setBannerState] = useState<EventBannerState>({ type: "no_event" })
  const [bannerEvent, setBannerEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Rename modal state (for Android/web where Alert.prompt isn't available)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renameValue, setRenameValue] = useState("")

  const fetchData = useCallback(async () => {
    if (!groupId || !profile) return

    try {
      const [groupData, standingsData, nextEvent] = await Promise.all([
        getGroupDetail(groupId, profile.id),
        getGroupStandings(groupId),
        getNextEventForBanner(),
      ])

      if (!groupData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setGroup(groupData)
      setStandings(standingsData)
      setBannerEvent(nextEvent)

      // Compute banner state
      if (nextEvent?.status === "live") {
        const stats = await getEventFightStats(nextEvent.id)
        setBannerState(
          computeEventBannerState(nextEvent, stats.completed, stats.total)
        )
      } else {
        setBannerState(computeEventBannerState(nextEvent))
      }
    } catch (err) {
      console.error("Failed to fetch group detail:", err)
      setNotFound(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [groupId, profile])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set header title and settings gear
  useEffect(() => {
    if (!group) return
    const isOwner = group.created_by === profile?.id

    navigation.setOptions({
      headerTitle: group.name,
      headerRight: isOwner
        ? () => (
            <Pressable
              onPress={handleSettingsPress}
              style={{ paddingRight: Spacing.md }}
              hitSlop={8}
            >
              <Ionicons name="settings-outline" size={22} color={Colors.foreground} />
            </Pressable>
          )
        : undefined,
    })
  }, [group, profile, navigation])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  const handleShareInvite = async () => {
    if (!group || !profile) return
    const invite = await getOrCreateGroupInvite(group.id, profile.id)
    if (!invite) return

    try {
      await Share.share({
        message: `Join my FightNight group "${group.name}"! Use this code: ${invite.token}`,
      })
    } catch (err) {
      console.error("Share failed:", err)
    }
  }

  const handleSettingsPress = () => {
    Alert.alert("Group Settings", undefined, [
      {
        text: "Rename Group",
        onPress: () => {
          if (Platform.OS === "ios") {
            Alert.prompt(
              "Rename Group",
              "Enter a new name (max 40 characters)",
              async (newName) => {
                if (newName && newName.trim()) {
                  const success = await renameGroup(group!.id, newName.trim().slice(0, 40))
                  if (success) fetchData()
                }
              },
              "plain-text",
              group?.name
            )
          } else {
            setRenameValue(group?.name ?? "")
            setShowRenameModal(true)
          }
        },
      },
      {
        text: "Copy Invite Link",
        onPress: handleShareInvite,
      },
      {
        text: "Delete Group",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Delete Group",
            "This will permanently delete the group and remove all members. This action cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  const success = await deleteGroup(group!.id)
                  if (success) router.back()
                },
              },
            ]
          )
        },
      },
      { text: "Cancel", style: "cancel" },
    ])
  }

  const handleRenameSubmit = async () => {
    if (!renameValue.trim() || !group) return
    const success = await renameGroup(group.id, renameValue.trim().slice(0, 40))
    setShowRenameModal(false)
    if (success) fetchData()
  }

  // Loading
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  // Not found
  if (notFound || !group) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.foregroundMuted} />
        <Text style={styles.notFoundText}>Group not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    )
  }

  const createdDate = new Date(group.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })

  return (
    <View style={styles.container}>
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
        <View style={styles.contentWrapper}>
          {/* Header info */}
          <View style={styles.headerSection}>
            <View style={styles.headerMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={14} color={Colors.foregroundMuted} />
                <Text style={styles.metaText}>
                  {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
                </Text>
              </View>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>Est. {createdDate}</Text>
            </View>

            <Pressable style={styles.shareButton} onPress={handleShareInvite}>
              <Ionicons name="share-outline" size={16} color={Colors.primary} />
              <Text style={styles.shareButtonText}>Share Invite</Text>
            </Pressable>
          </View>

          {/* Event Banner */}
          <EventBanner state={bannerState} event={bannerEvent} />

          {/* Standings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Standings</Text>
            <StandingsList
              standings={standings}
              currentProfileId={profile?.id ?? ""}
            />
          </View>

          {/* Members */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Members</Text>
            <MemberList
              members={group.members}
              ownerId={group.created_by}
              onShareInvite={handleShareInvite}
            />
          </View>
        </View>
      </ScrollView>

      {/* Rename modal for Android/web */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowRenameModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={styles.modalTitle}>Rename Group</Text>
            <TextInput
              style={styles.modalInput}
              value={renameValue}
              onChangeText={(text) => setRenameValue(text.slice(0, 40))}
              placeholder="Group name"
              placeholderTextColor={Colors.foregroundMuted}
              autoFocus
              maxLength={40}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setShowRenameModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalSubmit}
                onPress={handleRenameSubmit}
              >
                <Text style={styles.modalSubmitText}>Rename</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  scrollContent: {
    paddingBottom: Spacing["4xl"],
  },
  contentWrapper: {
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
    padding: Spacing.lg,
  },

  // Header
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.foregroundMuted,
    marginHorizontal: Spacing.xs,
  },
  metaText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },
  shareButtonText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },

  // Sections
  section: {
    marginTop: Spacing["2xl"],
  },
  sectionTitle: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },

  // Not found
  notFoundText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.lg,
    marginTop: Spacing.md,
  },
  backLink: {
    color: Colors.primaryLight,
    fontSize: FontSize.base,
    marginTop: Spacing.lg,
  },

  // Rename modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: "700",
    marginBottom: Spacing.lg,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    color: Colors.foreground,
    fontSize: FontSize.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.lg,
    marginTop: Spacing.xl,
  },
  modalCancel: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.base,
  },
  modalSubmit: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  modalSubmitText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: "600",
  },
})
