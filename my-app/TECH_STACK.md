# WayFind Tech Stack Documentation

## Overview

WayFind is a location-based adventure mobile game built with React Native and Expo. This document provides a comprehensive overview of all technologies, frameworks, libraries, and tools used in the project.

---

## Core Framework & Runtime

### Expo SDK v54.0.9
- **Purpose**: Cross-platform development framework for React Native
- **Features**:
  - Managed workflow for iOS, Android, and Web
  - Built-in modules for location, images, storage, and more
  - Development server with tunnel mode for physical device testing
  - Over-the-air (OTA) updates capability

### React Native v0.81.4
- **Purpose**: Mobile application framework
- **Features**:
  - Native iOS and Android components
  - JavaScript bridge for native functionality
  - New Architecture enabled (`newArchEnabled: true` in app.json)

### React v19.1.0
- **Purpose**: Core UI library
- **Features**:
  - Component-based architecture
  - Hooks for state and lifecycle management
  - Context API for global state

### TypeScript v5.9.2
- **Purpose**: Type-safe JavaScript superset
- **Configuration**: Strict mode enabled
- **Path Alias**: `@/*` points to project root (configured in tsconfig.json)

---

## Navigation & Routing

### Expo Router v6.0.12
- **Purpose**: File-based routing system (similar to Next.js)
- **Route Location**: `/app` directory
- **Features**:
  - Automatic route generation from file structure
  - Support for route groups: `(tabs)`, `(start pages)`, `(gameplay pages)`
  - Stack and Tab navigation patterns
  - Deep linking support
  - Type-safe navigation with TypeScript

### React Navigation
- **Core**: v7.1.8
- **Bottom Tabs**: v7.4.0
- **Purpose**: Navigation library powering Expo Router
- **Features**:
  - Stack navigation
  - Tab navigation
  - Nested navigators
  - Screen transitions

---

## State Management

### React Context API + useReducer Pattern
- **Global State Contexts**:
  - `AuthContext` - User authentication and profile
  - `HomeContext` - Adventure feed and data
  - `ProfileContext` - User profile management
  - `GamePlayContext` - Active adventure state (skeleton)

### Custom Hooks
- `useAuth()` - Authentication actions and user data
- `useHome()` - Adventure data fetching and management
- `useProfile()` - Profile editing and user stats
- `useGamePlay()` - Adventure gameplay state

**Pattern**: Contexts wrap app in `_layout.tsx`, accessible via custom hooks throughout the app.

---

## Maps & Location Services

### react-native-maps v1.20.1
- **Platform**: iOS & Android (Native)
- **Provider**: Google Maps
- **Components**:
  - `MapView` - Base map component
  - `Marker` - Point of interest markers
  - `Polygon` - Region boundaries
  - `UrlTile` - Custom tile layers
- **Configuration**: API keys in `app.json`
  - iOS: `ios.config.googleMapsApiKey`
  - Android: `android.config.googleMaps.apiKey`

### react-leaflet v5.0.0 + leaflet v1.9.4
- **Platform**: Web
- **Tiles**: OpenStreetMap
- **Purpose**: Provides map functionality on web platform
- **Auto-switching**: Automatically used when app runs in browser

### expo-location v19.0.7
- **Purpose**: GPS and location tracking
- **Features**:
  - Current location access
  - Continuous location tracking (background support)
  - Proximity detection for token collection
  - Location permissions management
- **Permissions**: Foreground and background location access

---

## Storage & Security

### @react-native-async-storage/async-storage v2.2.0
- **Purpose**: Asynchronous, persistent, key-value storage
- **Use Cases**:
  - User preferences
  - App settings
  - Cached data

### expo-secure-store v15.0.7
- **Purpose**: Encrypted storage for sensitive data
- **Primary Use**: JWT token storage
- **Platform Support**:
  - iOS: Keychain Services
  - Android: SharedPreferences with encryption
  - Web: Not available (fallback to AsyncStorage with warning)

---

## Image & Media

### expo-image v3.0.9
- **Purpose**: Optimized image component
- **Features**:
  - Progressive loading
  - Caching
  - Placeholder support
  - Better performance than `<Image>`

### expo-image-picker v17.0.8
- **Purpose**: Access device photo library and camera
- **Features**:
  - Image selection from gallery
  - Camera capture
  - Image editing/cropping
  - Base64 encoding support
- **Use Case**: Profile picture uploads

### react-native-svg v15.14.0
- **Purpose**: SVG rendering in React Native
- **Features**:
  - Vector graphics support
  - Scalable icons and illustrations
  - Animation support

---

## UI Components & Styling

### Styling Approach
- **Method**: `StyleSheet.create()` for inline styles
- **Theme System**: Color constants in `/assets/utils/themes.tsx`
- **No CSS Framework**: Plain React Native styling (Tailwind integration planned)

### expo-linear-gradient v15.0.7
- **Purpose**: Linear gradient backgrounds
- **Use Cases**:
  - Hero sections
  - Card backgrounds
  - Button gradients

### expo-symbols v1.0.7
- **Purpose**: Native SF Symbols (iOS) and Material Icons (Android)

### @expo/vector-icons v15.0.3
- **Icon Sets**:
  - Ionicons (primary for tabs)
  - FontAwesome6 (stats and features)
  - AntDesign
  - MaterialIcons
- **Use Cases**: Tab bar icons, UI elements, stat cards

### react-icons v5.5.0
- **Purpose**: Additional icon library
- **Platform**: Primarily web support

---

## Animations & Gestures

### react-native-reanimated v4.1.1
- **Purpose**: High-performance animations
- **Features**:
  - 60 FPS animations
  - Runs on UI thread (not JS thread)
  - Declarative API
  - Spring physics
  - Layout animations

### react-native-gesture-handler v2.28.0
- **Purpose**: Native touch gesture handling
- **Features**:
  - Pan, pinch, rotate gestures
  - Better performance than PanResponder
  - Cross-platform consistent behavior

### react-native-worklets v0.5.1
- **Purpose**: C++ worklets for performance-critical code
- **Integration**: Works with Reanimated for animations

---

## User Experience

### expo-haptics v15.0.7
- **Purpose**: Haptic feedback (vibration)
- **Use Cases**:
  - Token proximity detection
  - Collection confirmation
  - UI interaction feedback
- **Patterns**:
  - Light impact
  - Medium impact
  - Heavy impact
  - Success/Error notifications

### react-native-safe-area-context v5.6.0
- **Purpose**: Handle device safe areas (notches, status bars)
- **Components**: `SafeAreaView`, `SafeAreaProvider`

### react-native-screens v4.16.0
- **Purpose**: Native screen components for better performance
- **Integration**: Used by React Navigation

---

## Additional Expo Modules

### expo-constants v18.0.9
- **Purpose**: Access system constants and app configuration
- **Data**: App version, platform info, manifest

### expo-font v14.0.8
- **Purpose**: Load custom fonts
- **Status**: Currently using system fonts (custom fonts can be added)

### expo-linking v8.0.8
- **Purpose**: Deep linking and URL handling
- **Features**:
  - Parse deep links
  - Create deep links
  - Handle URL schemes

### expo-splash-screen v31.0.10
- **Purpose**: Control app splash screen
- **Features**:
  - Show/hide splash screen
  - Keep visible during initialization

### expo-status-bar v3.0.8
- **Purpose**: Control device status bar
- **Options**: Style (light/dark), visibility, background color

### expo-system-ui v6.0.7
- **Purpose**: System UI customization
- **Features**: Set navigation bar color, style

---

## Web Support

### react-dom v19.1.0
- **Purpose**: React rendering for web
- **Integration**: Enables web platform via Expo

### react-native-web v0.21.0
- **Purpose**: React Native components for web browsers
- **Features**:
  - Component translations to HTML/CSS
  - Cross-platform code sharing
  - Responsive design support

### react-native-webview v13.15.0
- **Purpose**: Embed web content in native app
- **Use Cases**:
  - External content display
  - OAuth flows
  - Embedded documentation

---

## Development Tools

### ESLint v9.25.0
- **Purpose**: Code linting and quality checks
- **Config**: `eslint-config-expo` v10.0.0
- **Command**: `npm run lint`

### TypeScript Type Definitions
- `@types/react` v19.1.0
- `@types/leaflet` v1.9.21

---

## Backend Integration (Planned)

### Current State
- **Data**: Mock data in components
- **API**: Partial integration with Azure endpoints
- **Authentication**: Local state only (JWT integration pending)

### Planned Stack
- **Database**: PostgreSQL on Azure
- **API Hosting**: Azure App Service
- **Image Storage**: Azure Blob Storage
- **Authentication**: JWT tokens stored in expo-secure-store
- **Documentation**: See `BACKEND_INTEGRATION.md` for full API specs

---

## Configuration Files

### app.json
- Expo app configuration
- Platform-specific settings (iOS/Android)
- Google Maps API keys
- Splash screen and icon configuration
- Plugins: expo-router, expo-splash-screen

### tsconfig.json
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

### package.json Scripts
```bash
npm start         # Expo dev server (tunnel mode enabled)
npm run android   # Run on Android device/emulator
npm run ios       # Run on iOS simulator/device
npm run web       # Run in web browser
npm run lint      # Run ESLint
```

---

## Platform Support Matrix

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Core App | ✅ | ✅ | ✅ |
| Maps (Google) | ✅ | ✅ | ❌ |
| Maps (OSM) | ❌ | ❌ | ✅ |
| GPS Location | ✅ | ✅ | ⚠️ (Limited) |
| Haptic Feedback | ✅ | ✅ | ❌ |
| Secure Storage | ✅ | ✅ | ❌ |
| Image Picker | ✅ | ✅ | ✅ |
| Push Notifications | 🚧 | 🚧 | 🚧 |

**Legend**: ✅ Supported | ❌ Not Supported | ⚠️ Partial Support | 🚧 Planned

---

## Development Environment

### Required Tools
- Node.js (version compatible with Expo SDK 54)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS: Xcode (macOS only) + iOS Simulator
- Android: Android Studio + Android Emulator
- Physical devices: Expo Go app

### Testing Options
1. **Expo Go App**: Scan QR code with Expo Go (iOS/Android)
2. **iOS Simulator**: `npm run ios` (macOS only)
3. **Android Emulator**: `npm run android`
4. **Web Browser**: `npm run web`
5. **Physical Devices**: Tunnel mode enabled by default

---

## Performance Considerations

### Optimization Features
- **New Architecture**: React Native new architecture enabled
- **Reanimated**: UI thread animations for 60 FPS
- **expo-image**: Better image loading and caching
- **Native Screens**: react-native-screens for performance

### Bundle Size
- Total dependencies: 48 packages
- Platform-specific code splitting (web vs native)
- On-demand loading with Expo Router

---

## Migration Notes

### Legacy Code
- Some context files still use `.jsx` extension (should migrate to `.tsx`)
- Mock data scattered across components (consolidation needed)
- ~29 TODO comments for backend integration

### Planned Improvements
- Tailwind CSS integration (multiple TODOs)
- Full backend API integration
- Offline data caching
- Push notifications
- Analytics integration

---

## Version History

| Library | Current Version | Notes |
|---------|----------------|-------|
| Expo SDK | 54.0.9 | Stable |
| React Native | 0.81.4 | New Architecture |
| React | 19.1.0 | Latest |
| TypeScript | 5.9.2 | Strict mode |
| Expo Router | 6.0.12 | File-based routing |

---

## Resources & Documentation

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Expo Router Docs**: https://docs.expo.dev/router/introduction/
- **react-native-maps**: https://github.com/react-native-maps/react-native-maps
- **Project Backend Docs**: See `BACKEND_INTEGRATION.md`
- **Project Overview**: See `CLAUDE.md`

---

## Support & Troubleshooting

### Common Issues
1. **Maps not showing**: Check API keys in `app.json`
2. **Location not working**: Verify permissions in device settings
3. **Build errors**: Run `npm install` and clear cache with `expo start -c`
4. **TypeScript errors**: Check tsconfig.json path aliases

### Development Tips
- Use tunnel mode for testing on physical devices
- Clear Metro cache if seeing stale code: `expo start -c`
- Use TypeScript strictly to catch errors early
- Test on both platforms (iOS/Android) regularly

---

**Last Updated**: 2025-11-16
**Maintained By**: WayFind Development Team
