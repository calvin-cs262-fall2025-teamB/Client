# WayFind

A location-based adventure mobile game where users discover and collect tokens at real-world locations.

**Platforms:** iOS, Android, Web
**Tech Stack:** Expo, React Native, TypeScript, PostgreSQL

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web browser
```

Scan the QR code with Expo Go app (iOS/Android) or press `w` to open in browser.

---

## Project Structure

```
my-app/
├── app/                    # Expo Router routes (file-based routing)
│   ├── (tabs)/            # Main tab navigation
│   ├── (start pages)/     # Authentication flow
│   └── (gameplay pages)/  # Adventure screens
├── components/            # React components
├── contexts/              # Global state (Auth, Home, Profile, GamePlay)
├── assets/                # Images, fonts, icons
├── docs/                  # API specs & Postman collection
└── *.md                   # Documentation
```

---

## Documentation

### 📖 Core Documentation

| Document | Purpose | Use When |
|----------|---------|----------|
| **README.md** | Quick start and navigation | Getting started |
| **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** | Tech stack, architecture, custom hooks | Developing features |
| **[API_GUIDE.md](./API_GUIDE.md)** | Complete API documentation & backend integration | Implementing backend |

### 🔧 Technical Specifications

| File | Purpose | How to Use |
|------|---------|------------|
| **[docs/openapi.yaml](./docs/openapi.yaml)** | OpenAPI 3.0 spec | View with [Swagger Editor](https://editor.swagger.io/) or `npx @redocly/cli preview-docs docs/openapi.yaml` |
| **[docs/WayFind.postman_collection.json](./docs/WayFind.postman_collection.json)** | Postman collection | Import into Postman for API testing |

---

## Features

### ✅ Implemented
- User authentication (mock - needs backend)
- Adventure browsing
- Interactive map with region selection
- Profile management with stats
- GPS location tracking
- Cross-platform support (iOS, Android, Web)

### 🚧 In Progress
- Backend API integration (PostgreSQL + Azure)
- Token collection gameplay
- Adventure creation workflow
- Real-time proximity detection

### 📝 Planned
- Push notifications
- Offline mode with caching
- Social features (leaderboards, sharing)
- Adventure ratings and reviews

---

## Key Technologies

### Frontend
- **Expo SDK 54** - Cross-platform development framework
- **React Native 0.81** - Mobile UI framework
- **TypeScript 5.9** - Type-safe development
- **Expo Router 6.0** - File-based navigation
- **react-native-maps** - Native maps (iOS/Android)
- **react-leaflet** - Web maps (OpenStreetMap)
- **expo-location** - GPS tracking

### Backend (Planned)
- **PostgreSQL** - Database
- **Azure App Service** - API hosting
- **Azure Blob Storage** - Image storage
- **JWT** - Authentication

---

## Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator/device (macOS only)
npm run web        # Run in web browser
npm run lint       # Run ESLint
```

### Environment Setup

1. **Node.js** - Install latest LTS version
2. **Expo CLI** - `npm install -g expo-cli`
3. **iOS Development** (macOS only)
   - Install Xcode from App Store
   - Install iOS Simulator
4. **Android Development**
   - Install Android Studio
   - Set up Android emulator
5. **Physical Devices**
   - Install Expo Go app
   - Connect to same network
   - Scan QR code from terminal

### Testing on Devices

**Option 1: Expo Go App (Recommended for Quick Testing)**
1. Install Expo Go on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Run `npm start`
3. Scan QR code with camera (iOS) or Expo Go app (Android)

**Option 2: Development Build**
- For production features not available in Expo Go
- Requires EAS Build setup

---

## Architecture

### State Management

Uses React Context API with useReducer pattern:

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

**Custom Hooks:**
- `useAuth()` - Authentication & user data
- `useHome()` - Adventures feed
- `useProfile()` - User profile & stats
- `useGamePlay()` - Active adventure state (planned)

See **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** for complete hooks documentation.

### Routing

File-based routing with Expo Router:

- `app/(tabs)/` - Main navigation (Home, Map, Creator, Profile)
- `app/(start pages)/` - Authentication (Login, Sign In, About)
- `app/(gameplay pages)/` - Adventure screens

Routes are automatically generated from file structure.

---

## API Integration

### Current Status

- ✅ **Live:** `GET /adventures` - Fetches adventures from Azure
- 🚧 **Planned:** Authentication, user profiles, gameplay endpoints

### Base URL

```
https://cs262lab09-bqekb7ezfnhxctc7.canadacentral-01.azurewebsites.net
```

### Quick API Example

```typescript
// Fetch adventures
const response = await fetch(
  'https://cs262lab09-.../adventures'
);
const adventures = await response.json();
```

### Next Steps for Backend

1. Implement authentication endpoints (signup, login)
2. Create user profile management endpoints
3. Build adventure creation/management APIs
4. Add gameplay endpoints (start adventure, collect tokens)

See **[API_GUIDE.md](./API_GUIDE.md)** for complete API documentation and implementation guide.

---

## Common Tasks

### Adding a New Screen

1. Create file in `app/` directory (e.g., `app/(tabs)/newScreen.tsx`)
2. Export default component
3. Route is automatically available

```typescript
// app/(tabs)/newScreen.tsx
export default function NewScreen() {
  return <View><Text>New Screen</Text></View>;
}
```

### Using Custom Hooks

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome, {user}!</Text>
      ) : (
        <Button title="Login" onPress={() => login(email, password)} />
      )}
    </View>
  );
}
```

### Making API Calls

```typescript
import * as SecureStore from 'expo-secure-store';

async function fetchUserData() {
  const token = await SecureStore.getItemAsync('authToken');

  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  return data;
}
```

---

## Troubleshooting

### Common Issues

**Maps not showing?**
- Check Google Maps API keys in `app.json`
- Verify billing enabled in Google Cloud Console

**Location not working?**
- Check location permissions in device settings
- Ensure location services are enabled

**Build errors after `git pull`?**
```bash
npm install           # Install new dependencies
expo start -c         # Clear Metro cache
```

**TypeScript errors?**
- Check path aliases in `tsconfig.json`
- Verify `@types/` packages are installed

---

## Contributing

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes

### Workflow

1. Create feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and test locally

3. Lint code
   ```bash
   npm run lint
   ```

4. Commit with descriptive message
   ```bash
   git commit -m "feat: add user profile editing"
   ```

5. Push and create pull request
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

---

## Platform Support

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Core App | ✅ | ✅ | ✅ |
| Maps (Google) | ✅ | ✅ | ❌ |
| Maps (OpenStreetMap) | ❌ | ❌ | ✅ |
| GPS Location | ✅ | ✅ | ⚠️ Limited |
| Haptic Feedback | ✅ | ✅ | ❌ |
| Secure Storage | ✅ | ✅ | ❌ |
| Image Picker | ✅ | ✅ | ✅ |

---

## Team

- **Branch:** `documentation/tech-stack-api-hooks`
- **Main Branch:** `main`

---

## Resources

### External Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Project Documentation
- [Developer Guide](./DEVELOPER_GUIDE.md) - Complete technical guide
- [API Guide](./API_GUIDE.md) - Backend API documentation
- [Claude Instructions](./CLAUDE.md) - AI development guidance

---

## License

_Add license information here_

---

**Built with ❤️ using Expo and React Native**
