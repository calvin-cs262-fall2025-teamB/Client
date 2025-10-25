import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import MapView, { Marker, LatLng, MapPressEvent, UrlTile } from "react-native-maps";
import * as Location from "expo-location";

// 1. Update the 'tokens' state type to include a name
interface Token {
  id: number;
  coord: LatLng;
  name: string;
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]); // Use the new Token interface

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required to show your position on the map.");
        setLoading(false);
        return;
      }

      let current = await Location.getCurrentPositionAsync({});
      setLocation(current);
      setLoading(false);

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (pos) => {
          setLocation(pos);
          checkProximity(pos.coords);
        }
      );

      return () => subscription.remove();
    })();
  }, [tokens]); // Add 'tokens' as a dependency so checkProximity uses the latest list

  // 2. --- handle map press to add a named token ---
  const handleMapPress = (event: MapPressEvent) => {
    const newCoord = event.nativeEvent.coordinate;

    // NOTE: Alert.prompt is iOS-only.
    // For a cross-platform solution, you would build a custom input modal.
    Alert.prompt(
      "Add Token",
      "Enter a name for this new token:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: (tokenName) => {
            if (tokenName) {
              const newToken: Token = {
                id: Date.now(),
                coord: newCoord,
                name: tokenName,
              };
              setTokens((prev) => [...prev, newToken]);
            }
          },
        },
      ],
      "plain-text",
      "New Token" // Default text in the prompt
    );
  };

  // 3. --- New function to handle pressing a marker ---
  const handleMarkerPress = (token: Token) => {
    Alert.alert(
      `Remove ${token.name}`, // Title
      "Are you sure you want to remove this token?", // Message
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeToken(token.id), // Call removeToken on press
        },
      ]
    );
  };

  // 4. --- New function to filter out the token ---
  const removeToken = (idToRemove: number) => {
    setTokens((prev) => prev.filter((token) => token.id !== idToRemove));
  };

  // --- check if user is near a token ---
  const checkProximity = (userCoords: Location.LocationObjectCoords) => {
    for (const token of tokens) {
      const distance = getDistance(userCoords, token.coord);
      if (distance < 20) {
        // Updated alert to use the token's name
        Alert.alert("Nearby Token!", `You’re within 20m of ${token.name}`);
        // In a real app, you'd add logic to prevent this from spamming
      }
    }
  };

  // --- haversine distance formula (in meters) ---
  const getDistance = (a: Location.LocationObjectCoords, b: LatLng) => {
    const R = 6371e3;
    // ... (rest of your function) ...
    const φ1 = (a.latitude * Math.PI) / 180;
    const φ2 = (b.latitude * Math.PI) / 180;
    const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
    const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;

    const sinΔφ = Math.sin(Δφ / 2);
    const sinΔλ = Math.sin(Δλ / 2);

    const c =
      2 *
      Math.atan2(
        Math.sqrt(sinΔφ * sinΔφ + Math.cos(φ1) * Math.cos(φ2) * sinΔλ * sinΔλ),
        Math.sqrt(1 - (sinΔφ * sinΔφ + Math.cos(φ1) * Math.cos(φ2) * sinΔλ * sinΔλ))
      );

    return R * c;
  };

  if (loading || !location) {
    // ... (loading component) ...
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      showsUserLocation={true}
      followsUserLocation={true}
      onPress={handleMapPress}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <UrlTile
        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
      />

      {tokens.map((token) => (
        <Marker
          key={token.id}
          coordinate={token.coord}
          title={token.name} // 5. Use the token's name as the title
          pinColor="orange"
          onPress={() => handleMarkerPress(token)} // 6. Add onPress to the marker
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
