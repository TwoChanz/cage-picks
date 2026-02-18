/**
 * CountdownTimer — Live ticking countdown to an event
 *
 * WHAT IT DOES:
 * Shows a countdown (days, hours, minutes, seconds) that ticks down
 * every second until the event starts. When the event is live, it
 * shows a pulsing red "LIVE" indicator instead.
 *
 * HOW IT WORKS:
 * 1. Calculate the difference between now and the target date
 * 2. Convert milliseconds → days, hours, minutes, seconds
 * 3. Update every 1 second using setInterval
 * 4. Clean up the interval when the component unmounts (to prevent memory leaks)
 *
 * REACT NATIVE NOTE:
 * In web React, we'd use CSS for the pulsing animation.
 * In React Native, we use the Animated API or react-native-reanimated.
 * For simplicity, we use a basic opacity toggle here.
 */
import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated } from "react-native"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import type { EventStatus } from "@/types/database"

interface CountdownTimerProps {
  /** ISO date string of when the event starts */
  targetDate: string
  /** Current status of the event from the database */
  eventStatus: EventStatus
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/**
 * Calculate time remaining between now and a target date.
 * Returns null if the target date is in the past.
 */
function calculateTimeLeft(targetDate: string): TimeLeft | null {
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return null

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function CountdownTimer({ targetDate, eventStatus }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Start the countdown interval
  useEffect(() => {
    // Calculate immediately on mount
    setTimeLeft(calculateTimeLeft(targetDate))

    // Then update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    // Clean up when component unmounts or targetDate changes
    return () => clearInterval(timer)
  }, [targetDate])

  // Pulsing animation for the LIVE dot
  useEffect(() => {
    if (eventStatus === "live") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      )
      pulse.start()
      return () => pulse.stop()
    }
  }, [eventStatus, pulseAnim])

  // ── LIVE state ──
  if (eventStatus === "live") {
    return (
      <View style={styles.liveContainer}>
        <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
        <Text style={styles.liveText}>LIVE NOW</Text>
      </View>
    )
  }

  // ── COMPLETED state ──
  if (eventStatus === "completed") {
    return <Text style={styles.completedText}>Event Completed</Text>
  }

  // ── COUNTDOWN state ──
  if (!timeLeft) {
    return <Text style={styles.completedText}>Starting Soon</Text>
  }

  return (
    <View style={styles.countdownRow}>
      <TimeBlock value={timeLeft.days} label="days" />
      <Text style={styles.separator}>:</Text>
      <TimeBlock value={timeLeft.hours} label="hrs" />
      <Text style={styles.separator}>:</Text>
      <TimeBlock value={timeLeft.minutes} label="min" />
      <Text style={styles.separator}>:</Text>
      <TimeBlock value={timeLeft.seconds} label="sec" />
    </View>
  )
}

/**
 * A single time unit block (e.g., "18" with "days" underneath)
 */
function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.timeBlock}>
      <Text style={styles.timeValue}>
        {String(value).padStart(2, "0")}
      </Text>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  // ── LIVE ──
  liveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.live,
  },
  liveText: {
    color: Colors.live,
    fontSize: FontSize.sm,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  // ── COMPLETED ──
  completedText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },

  // ── COUNTDOWN ──
  countdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  timeBlock: {
    alignItems: "center",
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 48,
  },
  timeValue: {
    color: Colors.foreground,
    fontSize: FontSize.lg,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  timeLabel: {
    color: Colors.foregroundMuted,
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  separator: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.lg,
    fontWeight: "700",
  },
})
