# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FightNight OS — a UFC/MMA prediction app built with React Native (Expo). Users authenticate, browse upcoming fight cards, make predictions, join groups, and compete on leaderboards. Currently at Phase 0+1 (auth, events, fighters implemented; predictions, groups, leaderboard are placeholders).

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

**Framework:** Expo SDK 54, React Native 0.81, Expo Router 6 (file-based routing), TypeScript strict mode.

**Navigation tree:**
```
RootLayout (ClerkProvider → SafeAreaProvider → Stack)
├── (tabs)/             # Bottom tab navigator, 5 tabs
│   ├── events/         # Event list + [slug] detail screen
│   ├── fighters/       # Fighter list + [slug] detail, search & weight class filter
│   ├── groups/         # Placeholder
│   ├── leaderboard/    # Placeholder
│   └── profile/        # Sign-out, user info
└── auth                # Clerk OAuth (Google, Apple)
```

**Data flow:** Clerk handles auth (sessions stored via `expo-secure-store`). Supabase is the database (PostgreSQL + RLS). No global state management — screens use local `useState` and call functions from `lib/`.

**Key data pattern — N+1 prevention in `lib/events.ts`:** Events and fights are fetched in exactly 2 queries (one for events, one for all related fights with fighter joins), then stitched together in JS. Follow this pattern for any new data access involving parent-child relationships.

**Mock data:** `lib/fighters.ts` has a `USE_MOCK` flag (currently `true`) with hardcoded fighter data for development when Supabase is paused. Set to `false` to use real database queries.

## Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`). Use `@/lib/...`, `@/components/...`, `@/constants/...`, `@/types/...` for all imports.

## Key Files

| Path | Purpose |
|------|---------|
| `constants/theme.ts` | Design system: all colors, spacing, font sizes, border radii. Dark theme with red/orange accent palette. |
| `types/database.ts` | TypeScript interfaces matching every Supabase table. Must stay in sync with DB schema. |
| `lib/events.ts` | Data access for events/fights (N+1 prevention pattern). |
| `lib/fighters.ts` | Data access for fighters with search/filter; includes mock data toggle. |
| `lib/auth.ts` | Clerk token cache using expo-secure-store. |
| `lib/supabase.ts` | Supabase client initialization. |
| `lib/notifications.ts` | Expo push notification helpers (register, schedule, cancel). |
| `lib/utils.ts` | Formatting utilities: records, height conversion, slugify, dates. |
| `supabase/migrations/` | Database schema (`001_initial_schema.sql`) and seed data (`002_seed_events.sql`). Source of truth for table structure and RLS policies. |
| `app.json` | Expo config: plugins, permissions, bundle IDs (`com.six1fivedevs.fightnightos`). |

## Environment Variables

Requires a `.env` file (see `.env.example`):
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY      # Clerk dashboard → API Keys
EXPO_PUBLIC_SUPABASE_URL               # Supabase project → Connect
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY   # Supabase publishable key (public, RLS-protected)
```

All client-side vars must use the `EXPO_PUBLIC_` prefix to be bundled by Expo.

## Platform Constraints

This is a **native mobile application** (iOS and Android) built with Expo. It is NOT a web-first project. All decisions must prioritize native mobile compatibility.

**Forbidden:**
- No Node.js-only libraries
- No direct Postgres connections from the client
- No Prisma or server-side ORM inside the app
- No server-only environment variables in frontend code
- No localhost dependencies
- No heavy web-only packages

**Architecture rules:**
- Mobile app = frontend only. Supabase = backend + database layer.
- All database communication goes through Supabase via `@supabase/supabase-js`.
- If server logic is required, use Supabase Edge Functions.
- Persist sessions using AsyncStorage.
- Must run inside Expo Go without crashing on both iOS and Android.
- Real device testing takes priority over web preview.

**UI/UX rules:**
- Designed for mobile screen sizes first (thumb-friendly layout).
- Dark-mode optimized, performance-conscious, minimal re-renders.

**Validation check:** Before suggesting any code or dependency, ask: *"Will this run inside Expo Go on iPhone?"* If suggesting something that looks web-only, explain why it works in Expo Go before proceeding. If a feature conflicts with native Expo constraints, propose a mobile-compatible alternative.

## Conventions

- **Styling:** React Native `StyleSheet.create` — no CSS. Use values from `constants/theme.ts` (Colors, Spacing, FontSize, BorderRadius), never hardcode.
- **Database types:** Add new table interfaces to `types/database.ts`. Keep them in sync with Supabase migrations.
- **Data access:** Keep Supabase queries in `lib/` files, not in components or screens.
- **New screens:** Add as files under `app/` following Expo Router file-based routing conventions.
- **Components:** Organized by domain under `components/` (e.g., `components/events/`, `components/fighters/`). New component groups should follow the same pattern.
- **New Arch default:** React Native New Architecture (Fabric/TurboModules) is the default in SDK 54+ — no `newArchEnabled` flag needed.
- **Dark-only theme:** `userInterfaceStyle` is set to `"dark"`. The app does not support light mode.
- **Portrait-locked:** Orientation is fixed to portrait.
