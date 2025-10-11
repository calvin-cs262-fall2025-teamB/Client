import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import MapView, { Marker, LatLng, MapPressEvent } from "react-native-maps";
import * as Location from "expo-location";

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<{ id: number; coord: LatLng }[]>([]);

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
  }, []);

  // --- handle map press to add a token ---
  const handleMapPress = (event: MapPressEvent) => {
    const newCoord = event.nativeEvent.coordinate;
    const newToken = { id: Date.now(), coord: newCoord };
    setTokens((prev) => [...prev, newToken]);
  };

  // --- check if user is near a token ---
  const checkProximity = (userCoords: Location.LocationObjectCoords) => {
    for (const token of tokens) {
      const distance = getDistance(userCoords, token.coord);
      if (distance < 20) {
        Alert.alert("Nearby Token!", `You’re within 20m of token #${token.id}`);
      }
    }
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
      {tokens.map((token) => (
        <Marker
          key={token.id}
          coordinate={token.coord}
          title={`Token #${token.id}`}
          pinColor="orange"
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

