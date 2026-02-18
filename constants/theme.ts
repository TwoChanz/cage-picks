/**
 * FightNight OS — Design System / Theme Constants
 *
 * In React Native, there's no CSS. Instead, we define colors, spacing,
 * and typography as JavaScript constants. These serve the same purpose
 * as CSS custom properties (--background, --primary, etc.) did in the
 * web version.
 *
 * The dark theme is the primary experience — fight night happens at night.
 * Red/orange accent palette evokes energy and combat sports.
 */

export const Colors = {
  // ── Core backgrounds and text ──
  background: "#1a1a2e",          // Deep dark blue-purple
  surface: "#242440",             // Cards, modals, elevated surfaces
  surfaceLight: "#2e2e50",        // Slightly lighter surface (hover states, borders)
  foreground: "#f0f0f5",          // Primary text color (off-white)
  foregroundMuted: "#8888a0",     // Secondary/muted text
  border: "#3a3a55",              // Borders and dividers

  // ── Brand colors ──
  primary: "#dc2626",             // Red — the fight brand color
  primaryLight: "#ef4444",        // Lighter red for text on dark backgrounds
  primaryDark: "#b91c1c",         // Darker red for pressed states
  accent: "#f97316",              // Orange — energy, excitement
  accentLight: "#fb923c",         // Lighter orange

  // ── Status colors ──
  live: "#ef4444",                // Red pulsing dot for live events
  upcoming: "#3b82f6",            // Blue for upcoming
  completed: "#6b7280",           // Gray for completed

  // ── Fighter comparison ──
  fighterA: "#3b82f6",            // Blue side
  fighterB: "#ef4444",            // Red side

  // ── Misc ──
  success: "#22c55e",
  warning: "#eab308",
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
} as const

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
} as const
