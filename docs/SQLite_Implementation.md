# SQLite Local Database Implementation

This document describes the new local database functionality that has been implemented as a fallback for when the Azure web service is unavailable.

## Overview

The app now uses a **three-tier fallback system**:

1. **Azure API** (Primary) - Remote SQL Server hosted on Azure
2. **SQLite** (Secondary) - Local database stored on the device  
3. **Mock Data** (Fallback) - Hardcoded data for development/offline use

## How It Works

### Automatic Fallback
- The app automatically tries Azure API first
- If Azure fails, it tries the local SQLite database
- If SQLite is empty or fails, it uses mock data
- Users don't need to manually switch between data sources

### Data Synchronization
- When Azure API is working, data is automatically synced to SQLite in the background
- You can manually trigger a full sync from the debug page
- The sync status shows when data was last synchronized

## Key Files

### Core Implementation
- `data/localDatabaseService.ts` - SQLite database operations
- `data/hybridDataService.ts` - Manages fallback logic and sync
- `contexts/DatabaseContext.tsx` - Updated to use hybrid service

### UI Components
- `components/reusable/DatabaseSync.tsx` - Shows sync status and controls

## Usage

### For Development
1. Open the app and navigate to the debug page (`/debug`)
2. View the "Database Sync Status" section to see current data source status
3. Use "Manual Sync" to download data from Azure when available
4. Use "Refresh Status" to check current connectivity

### Data Source Indicators
- **Azure API**: ✅ Online / ❌ Offline
- **Local SQLite**: ✅ Available / ❌ Unavailable  
- **Mock Data**: Always ✅ Available

### Manual Sync
The manual sync feature will:
1. Try to connect to Azure API
2. Download all current data (adventurers, regions, landmarks, adventures, tokens)
3. Store it locally in SQLite
4. Refresh the app's data state

## Benefits

### For Development
- Continue working even when Azure service is down
- Test offline functionality
- Faster data access for local development

### For Production
- Improved app reliability
- Better user experience during network issues
- Reduced dependency on remote server availability

## Database Schema

The local SQLite database mirrors the Azure SQL schema but with some adaptations:

### Point Data Storage
- PostgreSQL `point` types are stored as separate `locationX` and `locationY` columns
- Automatically converted when reading/writing data

### Primary Keys
- Uses `INTEGER PRIMARY KEY AUTOINCREMENT` instead of `SERIAL`
- Maintains compatibility with existing type definitions

### Foreign Keys
- All foreign key relationships are preserved
- Referential integrity is maintained locally

## API Compatibility

The hybrid service maintains the same API as the original DatabaseContext:

```typescript
// All existing functions work the same way
const { data: adventures } = await fetchAdventures();
const newRegion = await createRegion(regionData);

// New sync utilities
const result = await syncWithRemote();
const status = await getDataSourceStatus();
const lastSync = getLastSyncTime();
```

## Debugging

### Enable Verbose Logging
In development mode (`__DEV__`), the app logs:
- Which data source was used for each operation
- Sync status and results
- Fallback operations

### Debug Page
Navigate to `/debug` to access:
- Real-time data source status
- Manual sync controls  
- Database statistics
- Test functions for all CRUD operations

## Configuration

### API URL
Set your Azure API URL in the environment:
```bash
EXPO_PUBLIC_API_URL=https://your-api-url.azurewebsites.net
```

### Database Location
SQLite database is stored locally on device:
- iOS: App's Documents directory
- Android: App's internal storage
- Web: Browser's IndexedDB

## Troubleshooting

### Common Issues

**"Database not initialized" errors:**
- Check that expo-sqlite is properly installed
- Ensure app has storage permissions

**Sync failures:**
- Verify Azure API URL is correct
- Check network connectivity
- View error details in debug page

**Data not persisting:**
- SQLite should automatically persist data
- Check device storage space
- Try clearing app data and re-syncing

### Recovery Steps
1. Open debug page
2. Check data source status
3. Try manual sync if Azure is available
4. If all else fails, the app will use mock data

## Future Enhancements

Potential improvements for the local database system:

- **Incremental Sync**: Only sync changed data since last update
- **Conflict Resolution**: Handle data conflicts between local and remote
- **Background Sync**: Automatic periodic syncing
- **Data Compression**: Compress local database for smaller storage footprint
- **Selective Sync**: Allow users to choose which data to sync locally