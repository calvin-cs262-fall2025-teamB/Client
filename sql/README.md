# DatabaseContext Integration Guide

This guide explains how to integrate the DatabaseContext into React Native components for the WayFind campus adventure app.

## Overview

The DatabaseContext provides centralized state management and API communication for all database operations in the app. It handles CRUD operations for all entities (Adventurers, Regions, Landmarks, Adventures, Tokens, CompletedAdventures) with built-in loading states, error handling, and data caching.

## Table of Contents

1. [Setup and Installation](#setup-and-installation)
2. [Basic Usage](#basic-usage)
3. [Available Data and Functions](#available-data-and-functions)
4. [Common Patterns](#common-patterns)
5. [Error Handling](#error-handling)
6. [Best Practices](#best-practices)
7. [Examples](#examples)
8. [Troubleshooting](#troubleshooting)

## Setup and Installation

### 1. Provider Setup

Ensure your app is wrapped with the DatabaseProvider at the root level (this should already be configured):

```jsx
// App.jsx or _layout.tsx
import { DatabaseProvider } from '@/contexts/DatabaseContext';

export default function App() {
  return (
    <DatabaseProvider>
      {/* Your app components */}
    </DatabaseProvider>
  );
}
```

### 2. Import the Hook

In any component where you need database functionality:

```jsx
import { useDatabase } from '@/contexts/DatabaseContext';
```

## Basic Usage

### Hook Destructuring

```jsx
import React, { useEffect } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';

export default function MyComponent() {
  const {
    // Data arrays
    adventures,
    regions,
    tokens,
    
    // Loading states
    loading,
    
    // Error states
    errors,
    
    // Fetch functions
    fetchAdventures,
    fetchRegions,
    
    // Create functions
    createAdventure,
  } = useDatabase();

  // Component logic here
}
```

## Available Data and Functions

### State Data
- `adventurers[]` - Array of all adventurers/users
- `regions[]` - Array of geographic regions
- `landmarks[]` - Array of landmarks within regions
- `adventures[]` - Array of treasure hunt adventures
- `tokens[]` - Array of collectible tokens
- `completedAdventures[]` - Array of user's completed adventures

### Loading States
- `loading.adventurers` - Boolean loading state
- `loading.regions` - Boolean loading state
- `loading.landmarks` - Boolean loading state
- `loading.adventures` - Boolean loading state
- `loading.tokens` - Boolean loading state
- `loading.completedAdventures` - Boolean loading state

### Error States
- `errors.adventurers` - Error message or null
- `errors.regions` - Error message or null
- `errors.landmarks` - Error message or null
- `errors.adventures` - Error message or null
- `errors.tokens` - Error message or null
- `errors.completedAdventures` - Error message or null

### Fetch Functions
```jsx
// Fetch all entities of a type
await fetchAdventurers();
await fetchRegions();
await fetchLandmarks(); // or fetchLandmarks(regionId)
await fetchAdventures(); // or fetchAdventures(regionId, adventurerId)
await fetchTokens(); // or fetchTokens(adventureId)
await fetchCompletedAdventures(adventurerId);
```

### Create Functions
```jsx
// Create new entities
const newAdventurer = await createAdventurer(adventurerData);
const newRegion = await createRegion(regionData);
const newAdventure = await createAdventure(adventureData);
const newToken = await createToken(tokenData);
const completion = await completeAdventure(completionData);
```

### Update Functions
```jsx
// Update existing entities
const updatedAdventurer = await updateAdventurer(id, adventurerData);
```

### Helper Functions
```jsx
// Filter data by relationships
const regionAdventures = getAdventuresByRegion(regionId);
const adventureTokens = getTokensByAdventure(adventureId);
const userCompletions = getCompletedAdventuresByUser(adventurerId);
const regionLandmarks = getLandmarksByRegion(regionId);
```

### Utility Functions
```jsx
// Clear specific error states
clearError('adventures');
```

## Common Patterns

### 1. Component with Data Fetching

```jsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useDatabase } from '@/contexts/DatabaseContext';

export default function AdventuresList() {
  const {
    adventures,
    loading,
    errors,
    fetchAdventures,
  } = useDatabase();

  useEffect(() => {
    // Fetch adventures when component mounts
    fetchAdventures();
  }, []);

  if (loading.adventures) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading adventures...</Text>
      </View>
    );
  }

  if (errors.adventures) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error: {errors.adventures}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={adventures}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={{ padding: 16, borderBottomWidth: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
          <Text>Tokens: {item.numTokens || 0}</Text>
        </View>
      )}
    />
  );
}
```

### 2. Component with Create Functionality

```jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateAdventure() {
  const { createAdventure } = useDatabase();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [numTokens, setNumTokens] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Adventure name is required');
      return;
    }

    setLoading(true);
    try {
      const adventureData = {
        name: name.trim(),
        numTokens: parseInt(numTokens) || 0,
        adventurerID: user.id,
        regionId: 1, // Replace with actual region selection
        location: { x: 42.9634, y: -85.6681 }, // Replace with actual location
      };

      const newAdventure = await createAdventure(adventureData);
      Alert.alert('Success', `Adventure "${newAdventure.name}" created!`);
      setName('');
      setNumTokens('');
    } catch (error) {
      Alert.alert('Error', `Failed to create adventure: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Create New Adventure</Text>
      
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
        placeholder="Adventure Name"
        value={name}
        onChangeText={setName}
      />
      
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 }}
        placeholder="Number of Tokens"
        value={numTokens}
        onChangeText={setNumTokens}
        keyboardType="numeric"
      />
      
      <TouchableOpacity
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 15,
          borderRadius: 5,
          alignItems: 'center',
        }}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {loading ? 'Creating...' : 'Create Adventure'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 3. Component with Filtered Data

```jsx
import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useDatabase } from '@/contexts/DatabaseContext';

export default function RegionAdventures({ regionId }) {
  const {
    adventures,
    loading,
    fetchAdventures,
    getAdventuresByRegion,
  } = useDatabase();

  useEffect(() => {
    // Fetch adventures for specific region
    fetchAdventures(regionId);
  }, [regionId]);

  // Alternative: Use helper function to filter local data
  const regionAdventures = useMemo(() => {
    return getAdventuresByRegion(regionId);
  }, [adventures, regionId]);

  return (
    <View>
      <Text style={{ fontSize: 18, padding: 10 }}>
        Adventures in Region {regionId} ({regionAdventures.length})
      </Text>
      
      <FlatList
        data={regionAdventures}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderBottomWidth: 1 }}>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}
```

## Error Handling

### Basic Error Display

```jsx
const { errors, clearError } = useDatabase();

// Display error message
if (errors.adventures) {
  return (
    <View>
      <Text style={{ color: 'red' }}>Error: {errors.adventures}</Text>
      <TouchableOpacity onPress={() => clearError('adventures')}>
        <Text>Clear Error</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Try-Catch with Custom Error Handling

```jsx
const handleCreateAdventure = async (adventureData) => {
  try {
    const result = await createAdventure(adventureData);
    // Success handling
    Alert.alert('Success', 'Adventure created successfully!');
    return result;
  } catch (error) {
    // Custom error handling
    console.error('Create adventure failed:', error);
    
    if (error.message.includes('network')) {
      Alert.alert('Network Error', 'Please check your internet connection');
    } else if (error.message.includes('validation')) {
      Alert.alert('Validation Error', 'Please check your input data');
    } else {
      Alert.alert('Error', `Failed to create adventure: ${error.message}`);
    }
  }
};
```

## Best Practices

### 1. Data Fetching
- Fetch data in `useEffect` when components mount
- Use dependency arrays to control when data is refetched
- Consider using helper functions for filtered data instead of refetching

### 2. Loading States
- Always show loading indicators during async operations
- Disable buttons/inputs during loading to prevent duplicate requests

### 3. Error Handling
- Display user-friendly error messages
- Provide retry mechanisms where appropriate
- Clear errors when appropriate (after successful operations)

### 4. Location Data
- Use the format `{ x: number, y: number }` for location objects
- The context automatically converts to PostgreSQL point format `"(x,y)"`

### 5. Performance
- Use `useMemo` for expensive filtering operations
- Avoid unnecessary re-renders by only destructuring needed values
- Consider pagination for large datasets

## Examples

### User Profile with Completed Adventures

```jsx
import React, { useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useAuth } from '@/contexts/AuthContext';

export default function UserProfile() {
  const { user } = useAuth();
  const {
    completedAdventures,
    adventures,
    loading,
    fetchCompletedAdventures,
    fetchAdventures,
  } = useDatabase();

  useEffect(() => {
    if (user?.id) {
      fetchCompletedAdventures(user.id);
      fetchAdventures(); // Get all adventures for names
    }
  }, [user?.id]);

  // Transform data to include adventure names
  const transformedAdventures = completedAdventures.map(completed => {
    const adventure = adventures.find(adv => adv.id === completed.adventureId);
    return {
      ...completed,
      adventureName: adventure?.name || 'Unknown Adventure',
    };
  });

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Your Adventures</Text>
      
      {loading.completedAdventures ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={transformedAdventures}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 16, borderBottomWidth: 1 }}>
              <Text style={{ fontWeight: 'bold' }}>{item.adventureName}</Text>
              <Text>Completed: {new Date(item.completionDate).toLocaleDateString()}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>
              No completed adventures yet
            </Text>
          }
        />
      )}
    </View>
  );
}
```

### Adventure Creator with Location Selection

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Picker } from 'react-native';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useAuth } from '@/contexts/AuthContext';

export default function AdventureCreator() {
  const { user } = useAuth();
  const {
    regions,
    createAdventure,
    fetchRegions,
  } = useDatabase();
  
  const [name, setName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [location, setLocation] = useState({ x: '', y: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleCreate = async () => {
    if (!name || !selectedRegion || !location.x || !location.y) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const adventureData = {
        name,
        regionId: selectedRegion,
        adventurerID: user.id,
        location: {
          x: parseFloat(location.x),
          y: parseFloat(location.y),
        },
      };

      await createAdventure(adventureData);
      Alert.alert('Success', 'Adventure created!');
      
      // Reset form
      setName('');
      setSelectedRegion(null);
      setLocation({ x: '', y: '' });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Create Adventure</Text>
      
      <TextInput
        placeholder="Adventure Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <Text>Select Region:</Text>
      <Picker
        selectedValue={selectedRegion}
        onValueChange={setSelectedRegion}
        style={{ marginBottom: 10 }}
      >
        <Picker.Item label="Choose a region..." value={null} />
        {regions.map(region => (
          <Picker.Item key={region.id} label={region.name} value={region.id} />
        ))}
      </Picker>
      
      <Text>Location:</Text>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <TextInput
          placeholder="X Coordinate"
          value={location.x}
          onChangeText={(x) => setLocation(prev => ({ ...prev, x }))}
          style={{ borderWidth: 1, padding: 10, flex: 1, marginRight: 10 }}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Y Coordinate"
          value={location.y}
          onChangeText={(y) => setLocation(prev => ({ ...prev, y }))}
          style={{ borderWidth: 1, padding: 10, flex: 1 }}
          keyboardType="numeric"
        />
      </View>
      
      <TouchableOpacity
        onPress={handleCreate}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 15,
          borderRadius: 5,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {loading ? 'Creating...' : 'Create Adventure'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Troubleshooting

### Common Issues

1. **"useDatabase must be used within a DatabaseProvider"**
   - Ensure your component is wrapped in `<DatabaseProvider>`
   - Check that the provider is at the correct level in your component tree

2. **Data not loading**
   - Verify you're calling the appropriate fetch function
   - Check loading states and error states for debugging
   - Ensure the API endpoint is accessible

3. **Location data errors**
   - Use `{ x: number, y: number }` format for location objects
   - The context handles PostgreSQL conversion automatically

4. **Performance issues**
   - Use `useMemo` for expensive operations
   - Only destructure needed values from the context
   - Consider implementing pagination for large datasets

### Debug Mode

Use the debug page (`/debug` route) to test all database functions:

```jsx
// Access from login page with debug button (development mode only)
// Or navigate directly to '/debug' route
```

### Logging

Enable debugging by adding console logs:

```jsx
useEffect(() => {
  console.log('Adventures data:', adventures);
  console.log('Loading state:', loading.adventures);
  console.log('Error state:', errors.adventures);
}, [adventures, loading.adventures, errors.adventures]);
```

## Type Safety

For TypeScript projects, import types from `@/types/database`:

```typescript
import { Adventure, Region, Token } from '@/types/database';
import { useDatabase } from '@/contexts/DatabaseContext';

const { adventures }: { adventures: Adventure[] } = useDatabase();
```

This ensures type safety when working with database entities and their properties.