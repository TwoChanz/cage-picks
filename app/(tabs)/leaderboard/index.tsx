/**
 * Leaderboard Screen
 *
 * Shows prediction rankings with a tab toggle between
 * global leaderboard and per-group leaderboards.
 *
 * DATA FLOW:
 * 1. Screen mounts → fetches global leaderboard
 * 2. User can switch to a group leaderboard via picker
 * 3. FlatList renders LeaderboardRow components
 */
import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import {
  getGlobalLeaderboard,
  getGroupLeaderboard,
} from "@/lib/leaderboard"
import { getGroupsByUser, type GroupWithMeta } from "@/lib/groups"
import { LeaderboardRow } from "@/components/leaderboard/leaderboard-row"
import type { LeaderboardEntry } from "@/types/database"

// Mock profile ID for development
const MOCK_PROFILE_ID = "mock-profile-1"

type TabOption = { id: string; label: string }

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [groups, setGroups] = useState<GroupWithMeta[]>([])
  const [activeTab, setActiveTab] = useState<string>("global")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const tabs: TabOption[] = [
    { id: "global", label: "Global" },
    ...groups.map((g) => ({ id: g.id, label: g.name })),
  ]

  const fetchData = useCallback(
    async (tabId: string) => {
      if (tabId === "global") {
        return getGlobalLeaderboard()
      }
      return getGroupLeaderboard(tabId)
    },
    []
  )

  const loadLeaderboard = useCallback(async () => {
    const data = await fetchData(activeTab)
    setEntries(data)
  }, [activeTab, fetchData])

  useEffect(() => {
    getGroupsByUser(MOCK_PROFILE_ID).then(setGroups)
  }, [])

  useEffect(() => {
    setIsLoading(true)
    loadLeaderboard().finally(() => setIsLoading(false))
  }, [loadLeaderboard])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadLeaderboard()
    setIsRefreshing(false)
  }

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return
    setActiveTab(tabId)
  }

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.tabActive,
              ]}
              onPress={() => handleTabChange(tab.id)}
            >
              {tab.id === "global" && (
                <Ionicons
                  name="globe-outline"
                  size={14}
                  color={
                    activeTab === tab.id
                      ? Colors.white
                      : Colors.foregroundMuted
                  }
                />
              )}
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Loading */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons
            name="trophy-outline"
            size={64}
            color={Colors.foregroundMuted}
          />
          <Text style={styles.emptyTitle}>No Rankings Yet</Text>
          <Text style={styles.emptySubtitle}>
            Make predictions on upcoming fights to appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(entry) => entry.profile.id}
          renderItem={({ item }) => (
            <LeaderboardRow
              entry={item}
              isCurrentUser={item.profile.id === MOCK_PROFILE_ID}
            />
          )}
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Tab bar
  tabBarWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabBar: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  tabTextActive: {
    color: Colors.white,
  },

  // List
  list: {
    paddingVertical: Spacing.md,
    paddingBottom: Spacing["3xl"],
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },

  // Centered states
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  emptyTitle: {
    color: Colors.foreground,
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    textAlign: "center",
    maxWidth: 260,
  },
})
