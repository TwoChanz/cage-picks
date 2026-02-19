/**
 * Groups Stack Layout
 *
 * Nested stack navigator for the groups tab, matching the
 * events and fighters layout pattern:
 * 1. Groups list (index) — header hidden, tabs visible
 * 2. Group detail ([slug]) — header visible with back button
 * 3. Create group (create) — modal-style screen
 */
import { Stack } from "expo-router"
import { Colors } from "@/constants/theme"

export default function GroupsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.foreground,
        headerShadowVisible: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="[slug]"
        options={{ headerShown: true, headerBackTitle: "Groups" }}
      />
      <Stack.Screen
        name="create"
        options={{
          headerShown: true,
          headerTitle: "Create Group",
          presentation: "modal",
        }}
      />
    </Stack>
  )
}
