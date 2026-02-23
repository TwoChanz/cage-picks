/**
 * Tab Navigator Layout — Bottom Navigation Bar
 *
 * This replaces the web's <BottomNav> component. In React Native,
 * navigation is handled by React Navigation (which Expo Router wraps).
 *
 * The Tabs component automatically renders a bottom tab bar with
 * icons and labels for each screen. When you tap a tab, it navigates
 * to that screen.
 *
 * TABS:
 * 1. Events   → Upcoming fight cards with countdowns
 * 2. Fighters → Browse and follow fighters
 * 3. Groups   → Friend groups and invite links
 * 4. Board    → Prediction leaderboard
 * 5. Profile  → User settings and stats
 */
import { Platform } from "react-native"
import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing } from "@/constants/theme"

/**
 * Helper to render tab bar icons.
 * Ionicons is a popular icon set included with Expo.
 */
function TabIcon({
  name,
  color,
  size,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"]
  color: string
  size: number
}) {
  return <Ionicons name={name} size={size} color={color} />
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // ── Tab Bar Styling ──
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.foregroundMuted,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "web" ? 60 : 85,
          paddingBottom: Platform.OS === "web" ? 8 : 25,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: "600",
        },

        // ── Header Styling ──
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.foreground,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: FontSize.lg,
        },
        headerShadowVisible: false,
      }}
    >
      {/* ── Events Tab ── */}
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          headerTitle: "Upcoming Events",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="calendar" color={color} size={size} />
          ),
        }}
      />

      {/* ── Fighters Tab ── */}
      <Tabs.Screen
        name="fighters"
        options={{
          title: "Fighters",
          headerTitle: "Fighters",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="fitness" color={color} size={size} />
          ),
        }}
      />

      {/* ── Groups Tab ── */}
      <Tabs.Screen
        name="groups/index"
        options={{
          title: "Groups",
          headerTitle: "Groups",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="people" color={color} size={size} />
          ),
        }}
      />

      {/* ── Leaderboard Tab ── */}
      <Tabs.Screen
        name="leaderboard/index"
        options={{
          title: "Leaderboard",
          headerTitle: "Leaderboard",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="trophy" color={color} size={size} />
          ),
        }}
      />

      {/* ── Profile Tab ── */}
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          headerTitle: "Profile",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
