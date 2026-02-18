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
import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/theme"

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
          height: 85,
          paddingBottom: 25,  // Extra padding for home indicator on newer iPhones
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        // ── Header Styling ──
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.foreground,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
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
            <TabIcon name="calendar-outline" color={color} size={size} />
          ),
        }}
      />

      {/* ── Fighters Tab ── */}
      <Tabs.Screen
        name="fighters"
        options={{
          title: "Fighters",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="people-outline" color={color} size={size} />
          ),
        }}
      />

      {/* ── Groups Tab ── */}
      <Tabs.Screen
        name="groups"
        options={{
          title: "Groups",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="people-circle-outline" color={color} size={size} />
          ),
        }}
      />

      {/* ── Leaderboard Tab ── */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Board",
          headerTitle: "Leaderboard",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="trophy-outline" color={color} size={size} />
          ),
        }}
      />

      {/* ── Profile Tab ── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
