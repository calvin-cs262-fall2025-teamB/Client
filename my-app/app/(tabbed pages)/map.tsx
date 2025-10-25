import { useEffect, useState } from "react";
// 1. Import Vibration
import { View, StyleSheet, ActivityIndicator, Alert, Vibration } from "react-native"; 
import MapView, { Marker, LatLng, MapPressEvent, UrlTile } from "react-native-maps";
import * as Location from "expo-location";

// 2. Update the Token interface to include visibility
interface Token {
  id: number;
  coord: LatLng;
  name: string;
  isVisible: boolean; 
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
          // Pass the 'tokens' state directly to checkProximity
          // to ensure it has the latest list
          setTokens(currentTokens => {
            // We run checkProximity *inside* the setTokens callback
            // to make sure we are comparing against the most recent state.
            return checkProximity(pos.coords, currentTokens);
          });
        }
      );

      return () => subscription.remove();
    })();
  }, []); // We can remove 'tokens' from dependency array because we handle it in the callback

  // --- handle map press to add a named token ---
  const handleMapPress = (event: MapPressEvent) => {
    const newCoord = event.nativeEvent.coordinate;

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
                isVisible: false, // 3. Set to invisible by default
              };
              setTokens((prev) => [...prev, newToken]);
            }
          },
        },
      ],
      "plain-text",
      "New Token" 
    );
  };

  // --- New function to handle pressing a marker ---
  const handleMarkerPress = (token: Token) => {
    Alert.alert(
      `Remove ${token.name}`, 
      "Are you sure you want to remove this token?", 
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeToken(token.id), 
        },
      ]
    );
  };

  // --- New function to filter out the token ---
  const removeToken = (idToRemove: number) => {
    setTokens((prev) => prev.filter((token) => token.id !== idToRemove));
  };

  // 4. --- Updated checkProximity function ---
  const checkProximity = (userCoords: Location.LocationObjectCoords, currentTokens: Token[]): Token[] => {
    let tokenFound = false;

    // We use .map to return a new array
    const updatedTokens = currentTokens.map(token => {
      // If it's already visible, skip the check
      if (token.isVisible) {
        return token;
      }
      
      const distance = getDistance(userCoords, token.coord);

      // Check if user is close AND the token is not yet visible
      if (distance < 20 && !token.isVisible) {
        tokenFound = true; // Flag that we found one
        
        // Vibrate the phone!
        Vibration.vibrate(100); // 100ms vibration
        
        // Alert the user
        Alert.alert("Token Found!", `You discovered ${token.name}!`);
        
        // Return a *new* token object with isVisible set to true
        return { ...token, isVisible: true };
      }
      
      // If not in range, return the token unchanged
      return token;
    });

    // If we found a new token, return the new array.
    // Otherwise, return the original array to prevent a re-render.
    return tokenFound ? updatedTokens : currentTokens;
  };


  // --- haversine distance formula (in meters) ---
  const getDistance = (a: Location.LocationObjectCoords, b: LatLng) => {
    const R = 6371e3;
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

      {/* 5. Only map over tokens that are visible */}
      {tokens.filter(token => token.isVisible).map((token) => (
        <Marker
          key={token.id}
          coordinate={token.coord}
          title={token.name} 
          pinColor="orange"
          onPress={() => handleMarkerPress(token)} 
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
