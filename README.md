# WayFind

A location-based adventure mobile game where users discover and collect tokens at real-world locations.

**Platforms:** iOS, Android

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
```

Scan the QR code with Expo Go app (iOS/Android)

---

## Documentation
### 🔧 Technical Specifications

| File | Purpose | How to Use |
|------|---------|------------|
| **[docs/openapi.yaml](./docs/openapi.yaml)** | OpenAPI 3.0 spec | View with [Swagger Editor](https://editor.swagger.io/) or `npx @redocly/cli preview-docs docs/openapi.yaml` |
| **[docs/WayFind.postman_collection.json](./docs/WayFind.postman_collection.json)** | Postman collection | Import into Postman for API testing |

---

## Features

### ✅ Implemented
- User authentication
- Adventure browsing
- View profile stats
- GPS location tracking
- Cross-platform support (iOS, Android)
- Backend API integration
- Adventure creation workflow
- Offline mode with caching

### 🚧 In Progress
- Playing adventures

### 📝 Planned
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

### Backend
- **PostgreSQL** - Database
- **Azure App Service** - API hosting
- **SQLite** - Local Database
- **(Planned) Azure Blob Storage** - Image storage 
- **JWT** - Authentication

---

## Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator/device (macOS only)
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
