/**
 * AddToCalendarButton (Web) — Downloads an .ics file for the event
 *
 * On native, this uses expo-calendar to add directly to the device calendar.
 * On web, there's no calendar API, so we generate a standard .ics file
 * that works with Apple Calendar, Google Calendar, Outlook, etc.
 *
 * The .ics format is an industry standard (RFC 5545) — any calendar app
 * can import it.
 */
import { useState } from "react"
import { Pressable, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"

interface AddToCalendarButtonProps {
  eventName: string
  eventDate: string
  eventLocation: string | null
}

/** Format a Date to iCalendar DTSTART format (YYYYMMDDTHHmmssZ) */
function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}

/** Generate a simple UID for the calendar event */
function generateUID(eventName: string, eventDate: string): string {
  const hash = `${eventName}-${eventDate}`.replace(/\s+/g, "-").toLowerCase()
  return `${hash}@fightnightos.com`
}

function generateICS(
  eventName: string,
  eventDate: string,
  eventLocation: string | null
): string {
  const startDate = new Date(eventDate)
  // UFC events typically last ~5 hours
  const endDate = new Date(startDate.getTime() + 5 * 60 * 60 * 1000)
  // Reminder 1 hour before
  const uid = generateUID(eventName, eventDate)

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FightNight OS//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${toICSDate(startDate)}`,
    `DTEND:${toICSDate(endDate)}`,
    `SUMMARY:${eventName}`,
    `DESCRIPTION:Added from FightNight OS`,
    ...(eventLocation ? [`LOCATION:${eventLocation}`] : []),
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${eventName} starts in 1 hour`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]

  return lines.join("\r\n")
}

function downloadICS(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function AddToCalendarButton({
  eventName,
  eventDate,
  eventLocation,
}: AddToCalendarButtonProps) {
  const [isAdded, setIsAdded] = useState(false)

  const handlePress = () => {
    try {
      const icsContent = generateICS(eventName, eventDate, eventLocation)
      const filename = `${eventName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.ics`
      downloadICS(filename, icsContent)
      setIsAdded(true)
    } catch (err) {
      console.error("Calendar download error:", err)
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
        {isAdded ? "Downloaded" : "Calendar"}
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
