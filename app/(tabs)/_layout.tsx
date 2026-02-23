/**
 * Tab Navigator Layout — Bottom Navigation Bar
 *
 * TABS:
 * 1. Events   → Upcoming fight cards with countdowns
 * 2. Fighters → Browse and follow fighters
 * 3. Social   → Groups, standings, global rank
 * 4. Profile  → User settings and stats
 */
import { Platform } from "react-native"
import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize } from "@/constants/theme"

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

      {/* ── Social Tab ── */}
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="people" color={color} size={size} />
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
