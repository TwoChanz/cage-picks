/**
 * Create Group Screen
 *
 * Simple form to create a new group. Just needs a name.
 * Presented as a modal from the groups list screen.
 */
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"
import { createGroup } from "@/lib/groups"

// Mock profile ID for development
const MOCK_PROFILE_ID = "mock-profile-1"

export default function CreateGroupScreen() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const trimmedName = name.trim()
  const isValid = trimmedName.length >= 2 && trimmedName.length <= 50

  const handleCreate = async () => {
    if (!isValid || isCreating) return

    setIsCreating(true)
    try {
      const group = await createGroup(MOCK_PROFILE_ID, trimmedName)
      if (group) {
        router.back()
      } else {
        Alert.alert("Error", "Failed to create group. Try again.")
      }
    } catch {
      Alert.alert("Error", "Something went wrong. Try again.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Group icon */}
        <View style={styles.iconWrapper}>
          <Ionicons
            name="people-circle"
            size={80}
            color={Colors.primary}
          />
        </View>

        {/* Name input */}
        <Text style={styles.label}>Group Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. The Boyz, Fight Club..."
          placeholderTextColor={Colors.foregroundMuted}
          value={name}
          onChangeText={setName}
          maxLength={50}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
        />
        <Text style={styles.hint}>
          {trimmedName.length}/50 characters (min 2)
        </Text>

        {/* Create button */}
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            !isValid && styles.createButtonDisabled,
            pressed && isValid && styles.createButtonPressed,
          ]}
          onPress={handleCreate}
          disabled={!isValid || isCreating}
        >
          <Ionicons
            name="add-circle"
            size={20}
            color={isValid ? Colors.white : Colors.foregroundMuted}
          />
          <Text
            style={[
              styles.createButtonText,
              !isValid && styles.createButtonTextDisabled,
            ]}
          >
            {isCreating ? "Creating..." : "Create Group"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
    paddingTop: Spacing["3xl"],
  },

  iconWrapper: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },

  label: {
    color: Colors.foreground,
    fontSize: FontSize.sm,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    color: Colors.foreground,
    fontSize: FontSize.lg,
  },
  hint: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    marginTop: Spacing.sm,
  },

  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    marginTop: Spacing["2xl"],
  },
  createButtonDisabled: {
    backgroundColor: Colors.surfaceLight,
  },
  createButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: "700",
  },
  createButtonTextDisabled: {
    color: Colors.foregroundMuted,
  },
})
