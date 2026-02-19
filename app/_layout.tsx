/**
 * Root Layout — wraps the ENTIRE app
 *
 * This is the equivalent of the Next.js root layout.tsx.
 * In Expo Router, _layout.tsx files define how their child routes
 * are rendered (similar to Next.js layouts).
 *
 * This root layout:
 * 1. Wraps everything in ClerkProvider (auth)
 * 2. Sets up SafeAreaProvider (handles phone notches)
 * 3. Sets the status bar style
 * 4. Defines the navigation structure (Stack navigator)
 *
 * NAVIGATION STRUCTURE:
 *   Root Stack
 *   ├── (tabs)    → Bottom tab navigator (main app screens)
 *   ├── auth      → Sign-in / Sign-up screens
 *   └── event detail, etc. → Modal/pushed screens
 */
import { useEffect } from "react"
import { Text, View } from "react-native"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { tokenCache } from "@/lib/auth"
import { Colors } from "@/constants/theme"

/**
 * Clerk needs a publishable key to work.
 * This comes from your .env file (EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY).
 * Get it from: https://dashboard.clerk.com → Your app → API Keys
 */
const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

export default function RootLayout() {
  if (!clerkPublishableKey) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <Text style={{ color: Colors.foreground, fontSize: 16 }}>
          Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
        </Text>
      </View>
    )
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <SafeAreaProvider>
          {/* Light-content = white text in status bar (for dark backgrounds) */}
          <StatusBar style="light" />

          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: "slide_from_right",
            }}
          >
            {/* Tab navigator — the main app */}
            <Stack.Screen name="(tabs)" />

            {/* Auth screens — shown when not signed in */}
            <Stack.Screen
              name="auth"
              options={{
                headerShown: false,
                animation: "fade",
              }}
            />
          </Stack>
        </SafeAreaProvider>
      </ClerkLoaded>
    </ClerkProvider>
  )
}
