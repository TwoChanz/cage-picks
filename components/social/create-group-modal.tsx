/**
 * Create Group Modal
 *
 * Simple modal with a group name input and create button.
 * Calls createGroup() and fires onCreated callback to refresh the list.
 */
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native"
import { useProfile } from "@/components/providers/profile-provider"
import { createGroup } from "@/lib/groups"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"

interface Props {
  visible: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateGroupModal({ visible, onClose, onCreated }: Props) {
  const { profile } = useProfile()
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    if (!name.trim() || !profile) return
    setError("")
    setCreating(true)

    const group = await createGroup(profile.id, name.trim().slice(0, 40))
    setCreating(false)

    if (!group) {
      setError("Failed to create group. Please try again.")
      return
    }

    setName("")
    onClose()
    onCreated()
  }

  const handleClose = () => {
    setName("")
    setError("")
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.content} onPress={() => {}}>
          <Text style={styles.title}>Create a Group</Text>
          <Text style={styles.subtitle}>
            Give your crew a name. You can change it later.
          </Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) => setName(text.slice(0, 40))}
            placeholder="e.g. The Boyz"
            placeholderTextColor={Colors.foregroundMuted}
            autoFocus
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
          <Text style={styles.charCount}>{name.length}/40</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.createButton,
                (!name.trim() || creating) && styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              disabled={!name.trim() || creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.createButtonText}>Create</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
    width: "85%",
    maxWidth: 400,
  },
  title: {
    color: Colors.foreground,
    fontSize: FontSize.xl,
    fontWeight: "700",
  },
  subtitle: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    color: Colors.foreground,
    fontSize: FontSize.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  charCount: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.xs,
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  error: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.lg,
    marginTop: Spacing.xl,
  },
  cancelText: {
    color: Colors.foregroundMuted,
    fontSize: FontSize.base,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 80,
    alignItems: "center",
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: "700",
  },
})
