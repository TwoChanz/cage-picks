# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FightNight OS — a UFC/MMA prediction app built with React Native (Expo). Users authenticate, browse upcoming fight cards, make predictions, join groups, and compete on leaderboards. Currently at Phase 0+1 (auth, events, fight cards implemented; predictions, groups, leaderboard are placeholders).

## Development Commands

```bash
npx expo start              # Start Expo dev server (press i for iOS, a for Android)
npx expo start --ios        # Start and open iOS simulator
npx expo start --android    # Start and open Android emulator
npx expo start --web        # Start web version
npx expo install --fix      # Fix dependency version mismatches
```

Linting (`eslint .`) and testing (`jest`) are declared in package.json but not yet configured — no `.eslintrc` or `jest.config.js` exist.

## Architecture

**Framework:** Expo SDK 52, React Native 0.76, Expo Router 4 (file-based routing), TypeScript strict mode.

**Navigation tree:**
```
RootLayout (ClerkProvider → SafeAreaProvider → Stack)
├── (tabs)/             # Bottom tab navigator, 5 tabs
│   ├── events/         # Event list + [slug] detail screen
│   ├── fighters/       # Placeholder
│   ├── groups/         # Placeholder
│   ├── leaderboard/    # Placeholder
│   └── profile/        # Sign-out, user info
└── auth                # Clerk OAuth (Google, Apple)
```

**Data flow:** Clerk handles auth (sessions stored via `expo-secure-store`). Supabase is the database (PostgreSQL + RLS). No global state management — screens use local `useState` and call functions from `lib/`.

**Key data pattern — N+1 prevention in `lib/events.ts`:** Events and fights are fetched in exactly 2 queries (one for events, one for all related fights with fighter joins), then stitched together in JS. Follow this pattern for any new data access involving parent-child relationships.

## Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`). Use `@/lib/...`, `@/components/...`, `@/constants/...`, `@/types/...` for all imports.

## Key Files

| Path | Purpose |
|------|---------|
| `constants/theme.ts` | Design system: all colors, spacing, font sizes, border radii. Dark theme with red/orange accent palette. |
| `types/database.ts` | TypeScript interfaces matching every Supabase table. Must stay in sync with DB schema. |
| `lib/events.ts` | Data access layer for events/fights. All Supabase queries live in `lib/`. |
| `lib/auth.ts` | Clerk token cache using expo-secure-store. |
| `lib/supabase.ts` | Supabase client initialization. |
| `app.json` | Expo config: plugins, permissions, bundle IDs (`com.six1fivedevs.fightnightos`). |

## Environment Variables

Requires a `.env` file (see `.env.example`):
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY   # Clerk dashboard → API Keys
EXPO_PUBLIC_SUPABASE_URL            # Supabase project → Settings → API
EXPO_PUBLIC_SUPABASE_ANON_KEY       # Supabase anon key (public, RLS-protected)
```

All client-side vars must use the `EXPO_PUBLIC_` prefix to be bundled by Expo.

## Conventions

- **Styling:** React Native `StyleSheet.create` — no CSS. Use values from `constants/theme.ts` (Colors, Spacing, FontSize, BorderRadius), never hardcode.
- **Database types:** Add new table interfaces to `types/database.ts`. Keep them in sync with Supabase migrations.
- **Data access:** Keep Supabase queries in `lib/` files, not in components or screens.
- **New screens:** Add as files under `app/` following Expo Router file-based routing conventions.
- **New Arch enabled:** `app.json` has `"newArchEnabled": true` — React Native New Architecture (Fabric/TurboModules) is active.
- **Dark-only theme:** `userInterfaceStyle` is set to `"dark"`. The app does not support light mode.
- **Portrait-locked:** Orientation is fixed to portrait.
