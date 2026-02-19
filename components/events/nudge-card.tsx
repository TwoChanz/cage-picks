/**
 * NudgeCard — "Who's watching?" watch party component
 *
 * Displays within an event detail screen. Shows a group's
 * meetup responses (In / Out / Maybe) and lets the user respond.
 *
 * LAYOUT:
 * +--------------------------------------------------+
 * |  👥 The Boyz — Who's watching?                    |
 * |                                                   |
 * |  [In ✓] [Out] [Maybe]                            |
 * |                                                   |
 * |  ✅ Marcus Chen  ·  🤷 Sarah Torres              |
 * +--------------------------------------------------+
 */
import { View, Text, StyleSheet, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {
  Colors,
  FontSize,
  Spacing,
  BorderRadius,
} from "@/constants/theme"
import type { MeetupResponseType } from "@/types/database"
import type { NudgeWithResponses } from "@/lib/meetups"

interface NudgeCardProps {
  nudge: NudgeWithResponses
  groupName: string
  currentProfileId: string
  onRespond: (nudgeId: string, response: MeetupResponseType) => void
}

const RESPONSE_OPTIONS: {
  value: MeetupResponseType
  label: string
  icon: string
  activeColor: string
}[] = [
  { value: "in", label: "I'm In", icon: "checkmark-circle", activeColor: Colors.success },
  { value: "out", label: "Out", icon: "close-circle", activeColor: Colors.primary },
  { value: "maybe", label: "Maybe", icon: "help-circle", activeColor: Colors.warning },
]

function getResponseIcon(response: MeetupResponseType): string {
  switch (response) {
    case "in":
      return "checkmark-circle"
    case "out":
      return "close-circle"
    case "maybe":
      return "help-circle"
  }
}

function getResponseColor(response: MeetupResponseType): string {
  switch (response) {
    case "in":
      return Colors.success
    case "out":
      return Colors.primary
    case "maybe":
      return Colors.warning
  }
}

export function NudgeCard({
  nudge,
  groupName,
  currentProfileId,
  onRespond,
}: NudgeCardProps) {
  const currentResponse = nudge.responses.find(
    (r) => r.profile_id === currentProfileId
  )?.response

  const responseCounts = {
    in: nudge.responses.filter((r) => r.response === "in").length,
    out: nudge.responses.filter((r) => r.response === "out").length,
    maybe: nudge.responses.filter((r) => r.response === "maybe").length,
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="people" size={16} color={Colors.accent} />
        <Text style={styles.groupName}>{groupName}</Text>
        <Text style={styles.headerLabel}>— Who's watching?</Text>
      </View>

      {/* Response buttons */}
      <View style={styles.buttonRow}>
        {RESPONSE_OPTIONS.map((option) => {
          const isActive = currentResponse === option.value
          return (
            <Pressable
              key={option.value}
              style={[
                styles.responseButton,
                isActive && {
                  backgroundColor: option.activeColor,
                  borderColor: option.activeColor,
                },
              ]}
              onPress={() => onRespond(nudge.id, option.value)}
            >
              <Ionicons
                name={option.icon as any}
                size={16}
                color={isActive ? Colors.white : Colors.foregroundMuted}
              />
              <Text
                style={[
                  styles.responseButtonText,
                  isActive && styles.responseButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {/* Response summary */}
      {nudge.responses.length > 0 && (
        <View style={styles.responseList}>
          {nudge.responses.map((r) => (
            <View key={r.id} style={styles.responseItem}>
              <Ionicons
                name={getResponseIcon(r.response) as any}
                size={14}
                color={getResponseColor(r.response)}
              />
              <Text style={styles.responseName}>
                {r.profile.display_name}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Counts */}
      {nudge.responses.length > 0 && (
        <View style={styles.countsRow}>
          <Text style={[styles.countText, { color: Colors.success }]}>
            {responseCounts.in} in
          </Text>
          <Text style={styles.countDot}>·</Text>
          <Text style={[styles.countText, { color: Colors.warning }]}>
            {responseCounts.maybe} maybe
          </Text>
          <Text style={styles.countDot}>·</Text>
          <Text style={[styles.countText, { color: Colors.primary }]}>
            {responseCounts.out} out
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  groupName: {
    color: Colors.foreground,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  headerLabel: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
  },

  buttonRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  responseButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  responseButtonText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  responseButtonTextActive: {
    color: Colors.white,
  },

  responseList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  responseItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  responseName: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
  },

  countsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  countDot: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
  },
})
