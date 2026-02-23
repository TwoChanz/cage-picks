/**
 * Join Group Modal
 *
 * Text input for entering an invite code/token.
 * Calls joinGroupByToken() and navigates to the group on success.
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
import { router, type Href } from "expo-router"
import { useProfile } from "@/components/providers/profile-provider"
import { joinGroupByToken } from "@/lib/groups"
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme"

interface Props {
  visible: boolean
  onClose: () => void
  onJoined: () => void
}

export function JoinGroupModal({ visible, onClose, onJoined }: Props) {
  const { profile } = useProfile()
  const [token, setToken] = useState("")
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState("")

  const handleJoin = async () => {
    const trimmed = token.trim()
    if (!trimmed || !profile) return
    setError("")
    setJoining(true)

    const result = await joinGroupByToken(profile.id, trimmed)
    setJoining(false)

    if ("error" in result) {
      setError(result.error)
      return
    }

    setToken("")
    onClose()
    onJoined()

    // Navigate to the group detail
    router.push(`/(tabs)/social/group/${result.group.id}` as Href)
  }

  const handleClose = () => {
    setToken("")
    setError("")
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.content} onPress={() => {}}>
          <Text style={styles.title}>Join a Group</Text>
          <Text style={styles.subtitle}>
            Paste the invite code your friend shared with you.
          </Text>

          <TextInput
            style={styles.input}
            value={token}
            onChangeText={setToken}
            placeholder="Paste invite code"
            placeholderTextColor={Colors.foregroundMuted}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleJoin}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.joinButton,
                (!token.trim() || joining) && styles.joinButtonDisabled,
              ]}
              onPress={handleJoin}
              disabled={!token.trim() || joining}
            >
              {joining ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.joinButtonText}>Join</Text>
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
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 80,
    alignItems: "center",
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    color: Colors.white,
    fontSize: FontSize.base,
    fontWeight: "700",
  },
})
