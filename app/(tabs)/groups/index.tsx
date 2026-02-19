/**
 * Groups List Screen
 *
 * Shows all groups the current user belongs to. Includes a
 * "Create Group" button and pull-to-refresh.
 *
 * DATA FLOW:
 * 1. Screen mounts → useEffect triggers
 * 2. getGroupsByUser() fetches groups (mock or Supabase)
 * 3. FlatList renders GroupCard components
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
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import { getGroupsByUser, type GroupWithMeta } from "@/lib/groups"
import { GroupCard } from "@/components/groups/group-card"

// Mock profile ID for development (matches lib/groups.ts mock data)
const MOCK_PROFILE_ID = "mock-profile-1"

export default function GroupsScreen() {
  const router = useRouter()
  const [groups, setGroups] = useState<GroupWithMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchGroups = useCallback(async () => {
    try {
      const data = await getGroupsByUser(MOCK_PROFILE_ID)
      setGroups(data)
    } catch (err) {
      console.error("Failed to fetch groups:", err)
    }
  }, [])

  useEffect(() => {
    fetchGroups().finally(() => setIsLoading(false))
  }, [fetchGroups])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchGroups()
    setIsRefreshing(false)
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading groups...</Text>
      </View>
    )
  }

  // ── Empty state ──
  if (groups.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="people-circle-outline"
          size={64}
          color={Colors.foregroundMuted}
        />
        <Text style={styles.emptyTitle}>No Groups Yet</Text>
        <Text style={styles.emptySubtitle}>
          Create a crew and invite your friends to compete
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.createButtonPressed,
          ]}
          onPress={() => router.push("/(tabs)/groups/create")}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.createButtonText}>Create Group</Text>
        </Pressable>
      </View>
    )
  }

  // ── Groups list ──
  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(group) => group.id}
        renderItem={({ item }) => <GroupCard group={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Groups</Text>
            <Pressable
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
              ]}
              onPress={() => router.push("/(tabs)/groups/create")}
            >
              <Ionicons name="add-circle" size={28} color={Colors.primary} />
            </Pressable>
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
    padding: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  separator: {
    height: Spacing.md,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    color: Colors.foreground,
    fontSize: FontSize["2xl"],
    fontWeight: "800",
  },
  headerButton: {
    padding: Spacing.xs,
  },
  headerButtonPressed: {
    opacity: 0.6,
  },

  // Centered states
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
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

  // Create button (empty state)
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  createButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: "700",
  },
})
