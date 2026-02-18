/**
 * AddToCalendarButton — Adds an event to the phone's native calendar
 *
 * ON THE WEB: We generated .ics files for download.
 * ON MOBILE: We can add events directly to the phone's calendar app!
 * This is a much better experience — one tap and it's in your calendar.
 *
 * HOW IT WORKS:
 * 1. Request calendar permission (first time only)
 * 2. Get the default calendar (or the first writable one)
 * 3. Create an event with the fight name, date, and location
 * 4. Show a success confirmation
 *
 * expo-calendar handles all the platform differences between iOS and Android.
 */
import { useState } from "react"
import { Pressable, Text, StyleSheet, Alert, Platform } from "react-native"
import * as Calendar from "expo-calendar"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"

interface AddToCalendarButtonProps {
  eventName: string
  eventDate: string
  eventLocation: string | null
}

export function AddToCalendarButton({
  eventName,
  eventDate,
  eventLocation,
}: AddToCalendarButtonProps) {
  const [isAdded, setIsAdded] = useState(false)

  const handlePress = async () => {
    try {
      // Step 1: Request calendar permission
      const { status } = await Calendar.requestCalendarPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Calendar Access Needed",
          "Please enable calendar access in your device settings to add fight events.",
          [{ text: "OK" }]
        )
        return
      }

      // Step 2: Find a writable calendar
      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      )

      let targetCalendarId: string | undefined

      if (Platform.OS === "ios") {
        // On iOS, find the default calendar
        const defaultCalendar = calendars.find(
          (cal) => cal.source?.name === "Default" || cal.isPrimary
        )
        targetCalendarId = defaultCalendar?.id ?? calendars[0]?.id
      } else {
        // On Android, find the first local writable calendar
        const localCalendar = calendars.find(
          (cal) => cal.accessLevel === "owner" || cal.accessLevel === "root"
        )
        targetCalendarId = localCalendar?.id ?? calendars[0]?.id
      }

      if (!targetCalendarId) {
        Alert.alert("No Calendar Found", "Could not find a calendar to add the event to.")
        return
      }

      // Step 3: Create the calendar event
      const startDate = new Date(eventDate)
      // UFC events typically last ~5 hours
      const endDate = new Date(startDate.getTime() + 5 * 60 * 60 * 1000)

      await Calendar.createEventAsync(targetCalendarId, {
        title: eventName,
        startDate,
        endDate,
        location: eventLocation ?? undefined,
        notes: "Added from FightNight OS",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        alarms: [
          { relativeOffset: -60 },  // Reminder 1 hour before
        ],
      })

      setIsAdded(true)
      Alert.alert("Added to Calendar!", `${eventName} has been added to your calendar.`)
    } catch (err) {
      console.error("Calendar error:", err)
      Alert.alert("Error", "Could not add event to calendar. Please try again.")
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isAdded && styles.buttonAdded,
        pressed && styles.buttonPressed,
      ]}
      onPress={handlePress}
      disabled={isAdded}
    >
      <Ionicons
        name={isAdded ? "checkmark-circle" : "calendar-outline"}
        size={16}
        color={isAdded ? Colors.success : Colors.foregroundMuted}
      />
      <Text style={[styles.label, isAdded && styles.labelAdded]}>
        {isAdded ? "Added" : "Calendar"}
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
  buttonAdded: {
    borderColor: Colors.success + "50",
    backgroundColor: Colors.success + "15",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  label: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  labelAdded: {
    color: Colors.success,
  },
})
