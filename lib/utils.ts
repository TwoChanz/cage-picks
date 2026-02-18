/**
 * Utility functions used throughout FightNight OS
 *
 * These are pure functions with no platform dependencies —
 * they work the same in React Native as they did in Next.js.
 */

/**
 * Formats a fighter's record as "W-L-D" (e.g., "27-1-0")
 * Includes no-contests if any exist (e.g., "27-1-0 (1 NC)")
 */
export function formatRecord(
  wins: number,
  losses: number,
  draws: number,
  nc?: number
): string {
  const base = `${wins}-${losses}-${draws}`
  if (nc && nc > 0) return `${base} (${nc} NC)`
  return base
}

/**
 * Converts centimeters to feet and inches (e.g., 193 → "6'4\"")
 * UFC displays height in imperial format.
 */
export function cmToFeetInches(cm: number): string {
  const totalInches = Math.round(cm / 2.54)
  const feet = Math.floor(totalInches / 12)
  const inches = totalInches % 12
  return `${feet}'${inches}"`
}

/**
 * Converts centimeters to a reach display (e.g., 215 → "84.5\"")
 */
export function cmToInches(cm: number): string {
  return `${(cm / 2.54).toFixed(1)}"`
}

/**
 * Generates a URL-friendly slug from a string.
 * "Jon Jones" → "jon-jones"
 * "UFC 310: Pantoja vs. Asakura" → "ufc-310-pantoja-vs-asakura"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Formats an event date for display.
 * Returns something like "Sat, Mar 8 · 6:00 PM"
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
