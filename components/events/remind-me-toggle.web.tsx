/**
 * RemindMeToggle (Web) — Visual bookmark for event reminders
 *
 * On native, this schedules a push notification via expo-notifications.
 * On web, push notifications require a Service Worker (Phase 3).
 *
 * For the web MVP, this component:
 *  1. Persists reminder state in localStorage
 *  2. Shows the same visual toggle (bell icon) as native
 *  3. Requests browser Notification permission for future use
 *
 * The reminder state survives page refreshes via localStorage.
 */
import { useState, useEffect } from "react"
import { Pressable, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"

interface RemindMeToggleProps {
  eventSlug: string
  eventName: string
  eventDate: string
}

const STORAGE_KEY = "fightnight_reminders"

function getReminders(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveReminder(slug: string, eventDate: string) {
  const reminders = getReminders()
  reminders[slug] = eventDate
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}

function removeReminder(slug: string) {
  const reminders = getReminders()
  delete reminders[slug]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}

export function RemindMeToggle({
  eventSlug,
  eventName,
  eventDate,
}: RemindMeToggleProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    setIsActive(eventSlug in getReminders())
  }, [eventSlug])

  const handleToggle = () => {
    if (isActive) {
      removeReminder(eventSlug)
      setIsActive(false)
    } else {
      saveReminder(eventSlug, eventDate)
      setIsActive(true)

      // Request browser notification permission for future Service Worker use
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isActive && styles.buttonActive,
        pressed && styles.buttonPressed,
      ]}
      onPress={handleToggle}
    >
      <Ionicons
        name={isActive ? "notifications" : "notifications-outline"}
        size={16}
        color={isActive ? Colors.primary : Colors.foregroundMuted}
      />
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {isActive ? "Reminded" : "Remind Me"}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonActive: {
    borderColor: Colors.primary + "50",
    backgroundColor: Colors.primary + "15",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  label: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  labelActive: {
    color: Colors.primary,
  },
})
