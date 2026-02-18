/**
 * RemindMeToggle — Schedule a push notification for an event
 *
 * WHAT IT DOES:
 * When toggled ON:
 *  1. Requests push notification permission (first time only)
 *  2. Schedules a local notification 1 hour before the event
 *  3. Saves the notification ID to AsyncStorage so we can cancel it later
 *  4. Shows a filled bell icon (active state)
 *
 * When toggled OFF:
 *  1. Cancels the scheduled notification
 *  2. Removes from AsyncStorage
 *  3. Shows an outline bell icon (inactive state)
 *
 * WHY AsyncStorage?
 * We need to remember which events the user wants reminders for
 * across app launches. AsyncStorage is React Native's equivalent
 * of localStorage on the web — simple key/value storage on the device.
 *
 * NOTE: We're using a simple Map in memory here since AsyncStorage
 * needs to be installed separately. In production, you'd use
 * @react-native-async-storage/async-storage.
 */
import { useState, useEffect } from "react"
import { Pressable, Text, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import {
  registerForPushNotifications,
  scheduleEventReminder,
  cancelEventReminder,
} from "@/lib/notifications"

interface RemindMeToggleProps {
  eventSlug: string
  eventName: string
  eventDate: string
}

/**
 * In-memory store for notification IDs.
 * In production, this would use AsyncStorage for persistence.
 * This is sufficient for the MVP — reminders survive within a session.
 */
const reminderStore = new Map<string, string>()

export function RemindMeToggle({
  eventSlug,
  eventName,
  eventDate,
}: RemindMeToggleProps) {
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if we already have a reminder for this event
  useEffect(() => {
    setIsActive(reminderStore.has(eventSlug))
  }, [eventSlug])

  const handleToggle = async () => {
    setIsLoading(true)

    try {
      if (isActive) {
        // ── TURN OFF ── Cancel the notification
        const notifId = reminderStore.get(eventSlug)
        if (notifId) {
          await cancelEventReminder(notifId)
          reminderStore.delete(eventSlug)
        }
        setIsActive(false)
      } else {
        // ── TURN ON ── Request permission and schedule
        const token = await registerForPushNotifications()
        if (token === null) {
          Alert.alert(
            "Notifications Disabled",
            "Please enable notifications in your device settings to get fight reminders.",
            [{ text: "OK" }]
          )
          setIsLoading(false)
          return
        }

        const notifId = await scheduleEventReminder(
          eventSlug,
          eventName,
          eventDate
        )

        if (notifId) {
          reminderStore.set(eventSlug, notifId)
          setIsActive(true)
        }
      }
    } catch (err) {
      console.error("Reminder toggle error:", err)
    }

    setIsLoading(false)
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isActive && styles.buttonActive,
        pressed && styles.buttonPressed,
      ]}
      onPress={handleToggle}
      disabled={isLoading}
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
