/**
 * Fighters Stack Layout
 *
 * Nested stack navigator for the fighters tab, matching the
 * events layout pattern:
 * 1. Fighter list (index) — header hidden, tabs visible
 * 2. Fighter detail ([slug]) — header visible with back button
 *
 * Tapping a FighterCard pushes the detail screen onto the stack
 * (slides in from the right). The back button pops it off.
 */
import { Stack } from "expo-router"
import { Colors } from "@/constants/theme"

export default function FightersLayout() {
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
        options={{ headerShown: true, headerBackTitle: "Fighters" }}
      />
    </Stack>
  )
}
