/**
 * Fighters List Screen — Browse and search UFC fighters
 *
 * Features:
 * - Search bar: filters fighters by name or nickname
 * - Weight class chips: horizontal scroll of division filters
 * - FlatList: virtualized, pull-to-refresh fighter cards
 * - Loading, empty, and error states
 *
 * DATA FLOW:
 * 1. Screen mounts -> useEffect triggers initial fetch
 * 2. User types in search or taps a weight class chip
 * 3. getFighters() runs with filters -> state updates -> FlatList re-renders
 * 4. Pull-to-refresh re-fetches with current filters
 */
import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
} from "@/constants/theme"
import { getFighters, WEIGHT_CLASSES, type WeightClass } from "@/lib/fighters"
import { FighterCard } from "@/components/fighters/fighter-card"
import type { Fighter } from "@/types/database"

export default function FightersScreen() {
  const [fighters, setFighters] = useState<Fighter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedClass, setSelectedClass] = useState<WeightClass>("All")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  /**
   * Fetch fighters with current filters.
   * Called on mount, when filters change, and on pull-to-refresh.
   */
  const fetchFighters = useCallback(async () => {
    try {
      const data = await getFighters(selectedClass, search)
      setFighters(data)
    } catch (err) {
      console.error("Failed to fetch fighters:", err)
    }
  }, [selectedClass, search])

  // Fetch on mount and when filters change
  useEffect(() => {
    setIsLoading(true)
    fetchFighters().finally(() => setIsLoading(false))
  }, [fetchFighters])

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchFighters()
    setIsRefreshing(false)
  }

  // Toggle favorite (local state only — persists when Supabase is active)
  const handleToggleFavorite = (fighterId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(fighterId)) {
        next.delete(fighterId)
      } else {
        next.add(fighterId)
      }
      return next
    })
  }

  // ── Search bar + weight class chips (rendered as FlatList header) ──
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color={Colors.foregroundMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search fighters..."
          placeholderTextColor={Colors.foregroundMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")} hitSlop={8}>
            <Ionicons
              name="close-circle"
              size={18}
              color={Colors.foregroundMuted}
            />
          </Pressable>
        )}
      </View>

      {/* Weight class filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {WEIGHT_CLASSES.map((wc) => {
          const isActive = selectedClass === wc
          return (
            <Pressable
              key={wc}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setSelectedClass(wc)}
            >
              <Text
                style={[
                  styles.chipText,
                  isActive && styles.chipTextActive,
                ]}
              >
                {wc}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )

  // ── Loading state ──
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading fighters...</Text>
      </View>
    )
  }

  // ── Fighters list (empty state handled inside FlatList) ──
  return (
    <View style={styles.container}>
      <FlatList
        data={fighters}
        keyExtractor={(fighter) => fighter.id}
        renderItem={({ item }) => (
          <FighterCard
            fighter={item}
            isFavorite={favorites.has(item.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={48}
              color={Colors.foregroundMuted}
            />
            <Text style={styles.emptyTitle}>No Fighters Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filter
            </Text>
          </View>
        }
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
        keyboardShouldPersistTaps="handled"
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["3xl"],
  },
  separator: {
    height: Spacing.md,
  },

  // Header
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },

  // Search bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.foreground,
    fontSize: FontSize.base,
    paddingVertical: 0,
  },

  // Weight class chips
  chipsContainer: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  chipTextActive: {
    color: Colors.white,
  },

  // Loading state
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  loadingText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
    gap: Spacing.sm,
  },
  emptyTitle: {
    color: Colors.foreground,
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },
})
