/**
 * Push Notification Helpers
 *
 * HOW PUSH NOTIFICATIONS WORK IN REACT NATIVE:
 *
 * 1. REGISTRATION: When the app launches, we ask the OS for a "push token"
 *    — a unique address for this device. Think of it like a phone number
 *    that notification servers can send messages to.
 *
 * 2. PERMISSION: The OS asks the user "Allow notifications?" on first request.
 *    If they say no, we can't send them notifications.
 *
 * 3. SCHEDULING: For "Remind Me", we schedule a LOCAL notification
 *    (no server needed). The notification fires at a specific time
 *    (e.g., 1 hour before the event starts).
 *
 * 4. REMOTE PUSH (future): For real-time updates ("Fighter X just won!"),
 *    we'd send notifications from our server → Expo Push Service →
 *    Apple/Google → User's device. That's Phase 5.
 *
 * expo-notifications handles all of this for both iOS and Android.
 */
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"

/**
 * Configure how notifications appear when the app is in the foreground.
 * Without this, notifications received while the app is open would be silent.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,     // Show the notification banner
    shouldPlaySound: true,     // Play the notification sound
    shouldSetBadge: true,      // Update the app badge number
  }),
})

/**
 * Request permission to send notifications and get the push token.
 *
 * Returns the Expo push token (a string like "ExponentPushToken[xxxxxx]")
 * or null if permission was denied or we're on a simulator.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Push notifications don't work on simulators/emulators
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device")
    return null
  }

  // Check current permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  // If not determined yet, ask the user
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  // User denied — can't send notifications
  if (finalStatus !== "granted") {
    return null
  }

  // Android requires a notification channel (category)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("fight-reminders", {
      name: "Fight Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#dc2626",
    })
  }

  // Get the push token
  const tokenData = await Notifications.getExpoPushTokenAsync()
  return tokenData.data
}

/**
 * Schedule a local notification to fire before an event.
 *
 * @param eventSlug - Unique identifier for the event (used to cancel later)
 * @param eventName - Name to show in the notification (e.g., "UFC 314")
 * @param eventDate - ISO date string of when the event starts
 * @param minutesBefore - How many minutes before the event to notify (default: 60)
 *
 * @returns The notification identifier (for cancellation)
 */
export async function scheduleEventReminder(
  eventSlug: string,
  eventName: string,
  eventDate: string,
  minutesBefore = 60
): Promise<string | null> {
  const eventTime = new Date(eventDate).getTime()
  const reminderTime = eventTime - minutesBefore * 60 * 1000
  const now = Date.now()

  // Don't schedule if the reminder time has already passed
  if (reminderTime <= now) return null

  const secondsUntilReminder = Math.floor((reminderTime - now) / 1000)

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Fight Night Starting Soon! 🥊",
      body: `${eventName} starts in ${minutesBefore} minutes`,
      data: { eventSlug },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntilReminder,
    },
  })

  return id
}

/**
 * Cancel a previously scheduled notification.
 */
export async function cancelEventReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId)
}

/**
 * Cancel ALL scheduled notifications (useful for cleanup).
 */
export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}
