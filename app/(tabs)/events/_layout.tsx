/**
 * Events Stack Layout
 *
 * WHY A NESTED STACK?
 * The Events tab needs two screens:
 * 1. Events list (index) — shows all upcoming events
 * 2. Event detail ([slug]) — shows full fight card for one event
 *
 * When you tap "View Full Card" on an event, it pushes the detail
 * screen onto the stack (slides in from the right). Tapping the
 * back button pops it off (slides back left).
 *
 * This is the standard navigation pattern for list → detail in mobile apps.
 */
import { Stack } from "expo-router"
import { Colors } from "@/constants/theme"

export default function EventsLayout() {
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
        options={{ headerShown: true, headerBackTitle: "Events" }}
      />
    </Stack>
  )
}
