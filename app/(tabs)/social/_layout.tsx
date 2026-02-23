/**
 * Social Stack Layout
 *
 * Nested stack within the Social tab. Mirrors the events stack pattern.
 * Screens: index (Social hub) → group/[groupId] (Group detail)
 */
import { Stack } from "expo-router"
import { Colors } from "@/constants/theme"

export default function SocialLayout() {
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
        name="group/[groupId]"
        options={{ headerShown: true, headerBackTitle: "Social" }}
      />
    </Stack>
  )
}
