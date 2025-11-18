# WayFind Developer Guide

Complete technical guide for developing the WayFind mobile application.

**Version:** 1.0
**Last Updated:** 2025-01-16

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Development Setup](#development-setup)
4. [Architecture](#architecture)
5. [Custom Hooks Reference](#custom-hooks-reference)
6. [File Structure](#file-structure)
7. [Development Workflow](#development-workflow)
8. [Best Practices](#best-practices)

---

## Project Overview

WayFind is a location-based adventure mobile game (similar to geocaching) built with React Native and Expo. Users discover and collect tokens at real-world locations by following adventure paths within defined regions.

**Key Features:**
- GPS-based token collection
- Real-time proximity detection with haptic feedback
- Adventure creation and management
- Cross-platform support (iOS, Android, Web)
- Offline-capable with map tiles
- Profile management and user statistics

---

## Tech Stack

### Core Framework & Runtime

#### Expo SDK v54.0.9
- **Purpose**: Cross-platform development framework for React Native
- **Features**:
  - Managed workflow for iOS, Android, and Web
  - Built-in modules for location, images, storage, and more
  - Development server with tunnel mode for physical device testing
  - Over-the-air (OTA) updates capability

#### React Native v0.81.4
- **Purpose**: Mobile application framework
- **Features**:
  - Native iOS and Android components
  - JavaScript bridge for native functionality
  - New Architecture enabled (`newArchEnabled: true` in app.json)

#### React v19.1.0
- **Purpose**: Core UI library
- **Features**:
  - Component-based architecture
  - Hooks for state and lifecycle management
  - Context API for global state

#### TypeScript v5.9.2
- **Purpose**: Type-safe JavaScript superset
- **Configuration**: Strict mode enabled
- **Path Alias**: `@/*` points to project root (configured in tsconfig.json)

---

### Navigation & Routing

#### Expo Router v6.0.12
- **Purpose**: File-based routing system (similar to Next.js)
- **Route Location**: `/app` directory
- **Features**:
  - Automatic route generation from file structure
  - Support for route groups: `(tabs)`, `(start pages)`, `(gameplay pages)`
  - Stack and Tab navigation patterns
  - Deep linking support
  - Type-safe navigation with TypeScript

#### React Navigation
- **Core**: v7.1.8
- **Bottom Tabs**: v7.4.0
- **Purpose**: Navigation library powering Expo Router
- **Features**:
  - Stack navigation
  - Tab navigation
  - Nested navigators
  - Screen transitions

---

### State Management

#### React Context API + useReducer Pattern

**Global State Contexts:**
- `AuthContext` - User authentication and profile
- `HomeContext` - Adventure feed and data
- `ProfileContext` - User profile management
- `GamePlayContext` - Active adventure state (skeleton)

**Pattern**: Contexts wrap app in `_layout.tsx`, accessible via custom hooks throughout the app.

---

### Maps & Location Services

#### react-native-maps v1.20.1
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

#### react-leaflet v5.0.0 + leaflet v1.9.4
- **Platform**: Web
- **Tiles**: OpenStreetMap
- **Purpose**: Provides map functionality on web platform
- **Auto-switching**: Automatically used when app runs in browser

#### expo-location v19.0.7
- **Purpose**: GPS and location tracking
- **Features**:
  - Current location access
  - Continuous location tracking (background support)
  - Proximity detection for token collection
  - Location permissions management
- **Permissions**: Foreground and background location access

---

### Storage & Security

#### @react-native-async-storage/async-storage v2.2.0
- **Purpose**: Asynchronous, persistent, key-value storage
- **Use Cases**:
  - User preferences
  - App settings
  - Cached data

#### expo-secure-store v15.0.7
- **Purpose**: Encrypted storage for sensitive data
- **Primary Use**: JWT token storage
- **Platform Support**:
  - iOS: Keychain Services
  - Android: SharedPreferences with encryption
  - Web: Not available (fallback to AsyncStorage with warning)

---

### Image & Media

#### expo-image v3.0.9
- **Purpose**: Optimized image component
- **Features**:
  - Progressive loading
  - Caching
  - Placeholder support
  - Better performance than `<Image>`

#### expo-image-picker v17.0.8
- **Purpose**: Access device photo library and camera
- **Features**:
  - Image selection from gallery
  - Camera capture
  - Image editing/cropping
  - Base64 encoding support
- **Use Case**: Profile picture uploads

#### react-native-svg v15.14.0
- **Purpose**: SVG rendering in React Native
- **Features**:
  - Vector graphics support
  - Scalable icons and illustrations
  - Animation support

---

### UI Components & Styling

#### Styling Approach
- **Method**: `StyleSheet.create()` for inline styles
- **Theme System**: Color constants in `/assets/utils/themes.tsx`
- **No CSS Framework**: Plain React Native styling (Tailwind integration planned)

#### expo-linear-gradient v15.0.7
- **Purpose**: Linear gradient backgrounds
- **Use Cases**:
  - Hero sections
  - Card backgrounds
  - Button gradients

#### @expo/vector-icons v15.0.3
- **Icon Sets**:
  - Ionicons (primary for tabs)
  - FontAwesome6 (stats and features)
  - AntDesign
  - MaterialIcons
- **Use Cases**: Tab bar icons, UI elements, stat cards

---

### Animations & Gestures

#### react-native-reanimated v4.1.1
- **Purpose**: High-performance animations
- **Features**:
  - 60 FPS animations
  - Runs on UI thread (not JS thread)
  - Declarative API
  - Spring physics
  - Layout animations

#### react-native-gesture-handler v2.28.0
- **Purpose**: Native touch gesture handling
- **Features**:
  - Pan, pinch, rotate gestures
  - Better performance than PanResponder
  - Cross-platform consistent behavior

---

### User Experience

#### expo-haptics v15.0.7
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

#### react-native-safe-area-context v5.6.0
- **Purpose**: Handle device safe areas (notches, status bars)
- **Components**: `SafeAreaView`, `SafeAreaProvider`

---

### Web Support

#### react-native-web v0.21.0
- **Purpose**: React Native components for web browsers
- **Features**:
  - Component translations to HTML/CSS
  - Cross-platform code sharing
  - Responsive design support

---

### Development Tools

#### ESLint v9.25.0
- **Purpose**: Code linting and quality checks
- **Config**: `eslint-config-expo` v10.0.0
- **Command**: `npm run lint`

#### TypeScript Type Definitions
- `@types/react` v19.1.0
- `@types/leaflet` v1.9.21

---

## Development Setup

### Prerequisites

- Node.js (version compatible with Expo SDK 54)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS: Xcode (macOS only) + iOS Simulator
- Android: Android Studio + Android Emulator
- Physical devices: Expo Go app

### Installation

```bash
# Clone repository
git clone <repository-url>
cd my-app

# Install dependencies
npm install

# Start development server (tunnel mode enabled)
npm start

# Run on specific platforms
npm run android   # Android emulator/device
npm run ios       # iOS simulator/device
npm run web       # Web browser

# Lint code
npm run lint
```

### Testing Options

1. **Expo Go App**: Scan QR code with Expo Go (iOS/Android)
2. **iOS Simulator**: `npm run ios` (macOS only)
3. **Android Emulator**: `npm run android`
4. **Web Browser**: `npm run web`
5. **Physical Devices**: Tunnel mode enabled by default

---

## Architecture

### Routing Structure (Expo Router)

The app uses file-based routing in the `app/` directory:

```
app/
├── (tabs)/              # Main tab navigation
│   ├── home.tsx         # Home screen
│   ├── map.tsx          # Map screen
│   ├── creator.tsx      # Creator screen
│   └── profile.tsx      # Profile screen
├── (start pages)/       # Authentication flow
│   ├── login.tsx        # Login screen
│   ├── sign_in.tsx      # Sign in screen
│   └── about.tsx        # About screen
├── (gameplay pages)/    # Active adventure screens
│   └── adventurePage.tsx
├── _layout.tsx          # Root layout with AuthProvider
└── index.tsx            # Entry point (redirects to login)
```

### State Management Pattern

Uses React Context with useReducer for global state:

**Context Provider Hierarchy:**
```jsx
<AuthProvider>
  <HomeProvider>
    <GamePlayProvider>
      <ProfileProvider>
        {/* App content */}
      </ProfileProvider>
    </GamePlayProvider>
  </HomeProvider>
</AuthProvider>
```

Access via hooks: `useAuth()`, `useGamePlay()`, `useHome()`, `useProfile()`

### Component Organization

```
components/
├── authentication/      # SignInForm, LoginForm
├── home/               # AdventureCard, AdventureDetailsModal, HomeScreenHeader
├── profile/            # Profile-specific UI components
└── reusable/           # Shared components like AppTitle
```

---

## Custom Hooks Reference

### useAuth

**Location:** `contexts/AuthContext.jsx`

Manages user authentication state and provides authentication-related actions.

#### Import

```javascript
import { useAuth } from '@/contexts/AuthContext';
```

#### State Values

| Property | Type | Description |
|----------|------|-------------|
| `user` | `string \| null` | Current user's full name |
| `email` | `string \| null` | Current user's email address |
| `isAuthenticated` | `boolean` | Whether user is currently authenticated |
| `isLoading` | `boolean` | Loading state for async operations |

#### Actions

##### `signup(fullName, email, password)`
Creates a new user account.

**Example:**
```javascript
const { signup } = useAuth();
signup('John Doe', 'john@example.com', 'password123');
```

##### `login(email, password)`
Authenticates an existing user.

**Example:**
```javascript
const { login } = useAuth();
login('john@example.com', 'password123');
```

##### `editUsername(newUsername)`
Updates the user's username.

**Example:**
```javascript
const { editUsername } = useAuth();
editUsername('Jane Doe');
```

##### `editEmail(newEmail)`
Updates the user's email address.

##### `logout()`
Logs out the current user and clears authentication state.

##### `setIsLoading(loading)`
Sets the loading state.

#### Complete Usage Example

```javascript
import { useAuth } from '@/contexts/AuthContext';

function LoginScreen() {
  const {
    user,
    email,
    isAuthenticated,
    login,
    logout,
    isLoading
  } = useAuth();

  const handleLogin = () => {
    login('user@example.com', 'password123');
  };

  if (isAuthenticated) {
    return (
      <View>
        <Text>Welcome, {user}!</Text>
        <Text>Email: {email}</Text>
        <Button title="Logout" onPress={logout} />
      </View>
    );
  }

  return (
    <View>
      <Button
        title="Login"
        onPress={handleLogin}
        disabled={isLoading}
      />
    </View>
  );
}
```

---

### useProfile

**Location:** `contexts/ProfileContext.jsx`

Manages user profile state and provides profile editing actions. Extends `useAuth` to include profile-specific functionality.

#### Import

```javascript
import { useProfile } from '@/contexts/ProfileContext';
```

#### State Values

| Property | Type | Description |
|----------|------|-------------|
| `user` | `string \| null` | User's full name (from AuthContext) |
| `email` | `string \| null` | User's email (from AuthContext) |
| `image` | `string \| null` | User's profile image URL |
| `isLoading` | `boolean` | Loading state for async operations |

#### Actions

##### `editImage(imageURL)`
Updates the user's profile image.

**Example:**
```javascript
const { editImage } = useProfile();

const handleImagePick = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled) {
    editImage(result.assets[0].uri);
  }
};
```

##### `editUsername(newUsername)`
Inherited from AuthContext.

##### `editEmail(newEmail)`
Inherited from AuthContext.

##### `logout()`
Logs out the user and resets profile state.

---

### useHome

**Location:** `contexts/HomeContext.jsx`

Manages home screen state and adventure data fetching.

#### Import

```javascript
import { useHome } from '@/contexts/HomeContext';
```

#### State Values

| Property | Type | Description |
|----------|------|-------------|
| `isLoading` | `boolean` | Loading state for data fetching |

#### Data Fetching

The `HomeProvider` automatically fetches adventure data on mount:
- Fetches from Azure API: `https://cs262lab09-bqekb7ezfnhxctc7.canadacentral-01.azurewebsites.net/adventures`
- Falls back to `MOCK_ADVENTURES` if API call fails in development mode
- Dispatches `set/data` action with fetched adventures

#### Usage Example

```javascript
import { useHome } from '@/contexts/HomeContext';

function HomeScreen() {
  const { isLoading } = useHome();

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="large" />
        <Text>Loading adventures...</Text>
      </View>
    );
  }

  return (
    <View>
      {/* Adventure list components */}
    </View>
  );
}
```

---

### useGamePlay

**Location:** `contexts/GamePlayContext.jsx`

**Status:** Placeholder - Not yet implemented

This hook is intended to manage active adventure gameplay state, including:
- Current adventure progress
- Token collection status
- GPS location tracking
- Proximity detection
- Haptic feedback triggers

**Planned Implementation:**
```javascript
const {
  currentAdventure,
  collectedTokens,
  currentLocation,
  startAdventure,
  collectToken,
  endAdventure
} = useGamePlay();
```

---

## File Structure

```
my-app/
├── app/                          # Expo Router routes
│   ├── (tabs)/                   # Tab navigation
│   ├── (start pages)/            # Authentication flow
│   ├── (gameplay pages)/         # Adventure screens
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point
├── assets/                       # Images, fonts, icons
│   └── utils/
│       └── themes.tsx            # Color constants
├── components/                   # React components
│   ├── authentication/
│   ├── home/
│   ├── profile/
│   └── reusable/
├── contexts/                     # Global state contexts
│   ├── AuthContext.jsx
│   ├── HomeContext.jsx
│   ├── ProfileContext.jsx
│   └── GamePlayContext.jsx
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Main documentation
├── DEVELOPER_GUIDE.md            # This file
├── API_GUIDE.md                  # API documentation
└── CLAUDE.md                     # AI assistant instructions
```

---

## Development Workflow

### 1. Feature Development

1. Create feature branch from `main`:
   ```bash
   git checkout -b feature/feature-name
   ```

2. Make changes and test locally:
   ```bash
   npm start
   ```

3. Lint code:
   ```bash
   npm run lint
   ```

4. Commit changes:
   ```bash
   git add .
   git commit -m "feat: description of feature"
   ```

5. Push and create pull request:
   ```bash
   git push origin feature/feature-name
   ```

### 2. Common Tasks

#### Adding a New Screen

1. Create file in appropriate `app/` directory
2. Use Expo Router file-based naming
3. Export default component

Example: `app/(tabs)/newScreen.tsx`
```typescript
export default function NewScreen() {
  return (
    <View>
      <Text>New Screen</Text>
    </View>
  );
}
```

#### Adding a New Component

1. Create in `components/` directory
2. Use PascalCase for filename
3. Export as default or named export

Example: `components/reusable/MyComponent.tsx`
```typescript
export default function MyComponent() {
  return <View />;
}
```

#### Adding a New Context

1. Create in `contexts/` directory
2. Follow existing pattern with `useReducer`
3. Export both Provider and hook

Example: `contexts/MyContext.jsx`
```javascript
const MyContext = createContext();

function MyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <MyContext.Provider value={{ ...state, ...actions }}>
      {children}
    </MyContext.Provider>
  );
}

function useMyContext() {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error("useMyContext must be used within MyProvider");
  }
  return context;
}

export { MyProvider, useMyContext };
```

---

## Best Practices

### 1. TypeScript Usage

- Use strict mode
- Define interfaces for props and state
- Avoid `any` type
- Use path aliases (`@/`) for imports

```typescript
interface Props {
  title: string;
  onPress: () => void;
}

export default function MyComponent({ title, onPress }: Props) {
  return <Button title={title} onPress={onPress} />;
}
```

### 2. State Management

- Use local state (`useState`) for component-specific data
- Use Context for app-wide state
- Keep state as close to usage as possible
- Avoid prop drilling

### 3. Performance

- Memoize expensive calculations with `useMemo`
- Prevent unnecessary re-renders with `React.memo`
- Use `useCallback` for functions passed as props
- Optimize FlatList with `keyExtractor` and `getItemLayout`

```typescript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

const handlePress = useCallback(() => {
  // Handle press
}, [dependencies]);
```

### 4. Styling

- Use `StyleSheet.create()` for performance
- Extract common styles to theme file
- Use consistent spacing and sizing
- Follow platform-specific design guidelines

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

### 5. Error Handling

- Always handle errors in async operations
- Provide user feedback for failures
- Log errors for debugging
- Use try/catch blocks

```typescript
try {
  const data = await fetchData();
  setData(data);
} catch (error) {
  console.error('Error fetching data:', error);
  Alert.alert('Error', 'Failed to load data');
}
```

### 6. Accessibility

- Add accessibility labels to interactive elements
- Support screen readers
- Ensure sufficient color contrast
- Make touch targets large enough (minimum 44x44)

```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Submit button"
  accessibilityRole="button"
>
  <Text>Submit</Text>
</TouchableOpacity>
```

### 7. Hook Usage

- Use hooks at component top level only
- Don't use hooks conditionally
- Destructure only what you need
- Handle loading states properly

```typescript
// ✅ Correct
function MyComponent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return <Text>{user}</Text>;
}

// ❌ Wrong - conditional hook usage
function MyComponent() {
  if (someCondition) {
    const { user } = useAuth(); // This will cause errors
  }
}
```

---

## Configuration

### app.json

Key configurations:
- App name and slug
- Version numbers
- Platform-specific settings
- Google Maps API keys
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

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint ."
  }
}
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

**Legend**: ✅ Supported | ❌ Not Supported | ⚠️ Partial Support

---

## Troubleshooting

### Common Issues

1. **Maps not showing**
   - Check API keys in `app.json`
   - Verify billing enabled in Google Cloud Console

2. **Location not working**
   - Verify permissions in device settings
   - Check location services are enabled

3. **Build errors**
   - Run `npm install`
   - Clear Metro cache: `expo start -c`

4. **TypeScript errors**
   - Check tsconfig.json path aliases
   - Verify type definitions are installed

### Development Tips

- Use tunnel mode for testing on physical devices
- Clear Metro cache if seeing stale code: `expo start -c`
- Use TypeScript strictly to catch errors early
- Test on both platforms (iOS/Android) regularly

---

## Next Steps

- See [API_GUIDE.md](./API_GUIDE.md) for backend integration
- See [CLAUDE.md](./CLAUDE.md) for AI development guidance
- See [README.md](./README.md) for quick start guide

---

**Last Updated:** 2025-01-16
**Maintained By:** WayFind Development Team
