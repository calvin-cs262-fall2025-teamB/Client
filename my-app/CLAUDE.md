# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WayFind is a location-based adventure mobile game (similar to geocaching) built with React Native and Expo. Users discover and collect tokens at real-world locations by following adventure paths within defined regions.

**Tech Stack:**
- **Framework:** Expo SDK 54.x with React Native 0.81.4
- **Language:** TypeScript 5.9.2 (with some legacy JSX files)
- **Routing:** Expo Router (file-based routing)
- **Maps:** react-native-maps (native), react-leaflet (web)
- **State:** React Context API with useReducer pattern
- **Location:** expo-location for GPS tracking

## Development Commands

```bash
# Installation
npm install

# Development (starts with tunnel mode enabled for remote testing)
npm start              # Expo dev server with tunnel
npm run android       # Run on Android emulator/device
npm run ios           # Run on iOS simulator/device
npm run web           # Run in web browser

# Code Quality
npm run lint          # Run ESLint
```

**Note:** The app is configured with tunnel mode by default to enable testing on physical devices. Use Expo Go app or development builds to test.

## Architecture & Code Organization

### Routing Structure (Expo Router)

The app uses file-based routing in the `app/` directory:

- **`app/(tabs)/`** - Main tab navigation (Home, Map, Creator, Profile)
- **`app/(start pages)/`** - Authentication flow (Login, Sign In, About)
- **`app/(gameplay pages)/`** - Active adventure screens (Adventure Page)
- **`app/_layout.tsx`** - Root layout with AuthProvider
- **`app/index.tsx`** - Entry point that redirects to login

### State Management Pattern

Uses React Context with useReducer for global state:

- **`AuthContext`** (`contexts/AuthContext.jsx`) - Authentication state, login/signup actions
- **`GamePlayContext`** (`contexts/GamePlayContext.jsx`) - Active adventure state (placeholder)
- **`HomeContext`** (`contexts/HomeContext.jsx`) - Home screen state (placeholder)

**Authentication Pattern:**
```typescript
// Contexts wrap the app in _layout.tsx
<AuthProvider>
  <HomeProvider>
    <GamePlayProvider>
      {/* App content */}
    </GamePlayProvider>
  </HomeProvider>
</AuthProvider>
```

Access via hooks: `useAuth()`, `useGamePlay()`, `useHome()`

### Key Domain Concepts

- **Region:** Geographical area containing landmarks/points of interest
- **Adventure:** Guided sequence of tokens within a region
- **Token:** Collectible item at a specific GPS location
- **Proximity Detection:** Uses device GPS to detect when users are near tokens (triggers haptic feedback)

### Component Organization

- **`components/authentication/`** - SignInForm, LoginForm
- **`components/home/`** - AdventureCard, AdventureDetailsModal, HomeScreenHeader
- **`components/profile/`** - Profile-specific UI components
- **`components/reusable/`** - Shared components like AppTitle

### Styling & Theming

- Colors defined in `assets/utils/themes.tsx` as constant objects
- Inline StyleSheet.create() pattern throughout components
- Path alias `@/` points to project root (configured in tsconfig.json)

## Current State & Development Notes

**Data Layer:** Currently uses mock data. See `BACKEND_INTEGRATION.md` for complete guide on replacing mock data with PostgreSQL/Azure backend.

**Backend Stack:**
- PostgreSQL for database
- Azure App Service for APIs
- Azure Blob Storage for images
- JWT authentication

**Known Issues:**
- ~29 TODO comments across 14 files for future work
- GamePlay and Home contexts need full implementation
- Creator page needs completion
- All mock data needs replacement with actual API calls (see BACKEND_INTEGRATION.md)

**Active Development:**
- Current branch: `nanakwame/ui-enhancements`
- Main branch: `main`

## Platform-Specific Notes

**Maps Implementation:**
- iOS/Android: Uses `react-native-maps` with Google Maps
- Web: Uses `react-leaflet` with OpenStreetMap tiles
- Google Maps API keys configured in app.json (need valid keys for production)

**Location Permissions:**
- App requires foreground and background location access
- Proximity detection uses continuous location tracking
- Configured via expo-location

## File Naming Conventions

- React components: PascalCase `.tsx` files (e.g., `AdventureCard.tsx`)
- Routes: lowercase `.tsx` files (e.g., `home.tsx`, `profile.tsx`)
- Contexts: PascalCase with `.jsx` extension (legacy, should migrate to `.tsx`)
- Utilities: lowercase `.tsx` files (e.g., `themes.tsx`)
