/**
 * Clerk Token Cache for React Native
 *
 * WHY THIS EXISTS:
 * On the web, Clerk stores auth tokens in cookies automatically.
 * On mobile, there are no cookies. Instead, we need to tell Clerk
 * how to store and retrieve tokens.
 *
 * expo-secure-store provides encrypted storage on the device —
 * similar to Keychain on iOS or Keystore on Android. This is
 * where we store the user's session token so they stay logged in
 * between app launches.
 */
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

/**
 * Token cache implementation for Clerk.
 *
 * On native (iOS/Android): Uses expo-secure-store (encrypted).
 * On web: Falls back to nothing (Clerk handles web storage internally).
 */
export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") return null
      return await SecureStore.getItemAsync(key)
    } catch {
      return null
    }
  },

  async saveToken(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") return
      await SecureStore.setItemAsync(key, value)
    } catch {
      // Silently fail — user will just need to re-authenticate
    }
  },
}
