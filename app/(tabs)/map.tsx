import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View
} from "react-native";
import MapView, {
  LatLng,
  MapPressEvent,
  Polygon,
  UrlTile,
} from "react-native-maps";

type AdventureRegion = {
  id: number;
  name: string;
  coords: LatLng[];
};

async function fetchAdventureData(): Promise<{
  regions: AdventureRegion[];
}> {
  // Mock data
  const mockRegions: AdventureRegion[] = [
    {
      id: 1,
      name: "Starting Area",
      coords: [
        { latitude: 37.7749, longitude: -122.4194 },
        { latitude: 37.7759, longitude: -122.4194 },
        { latitude: 37.7759, longitude: -122.4184 },
        { latitude: 37.7749, longitude: -122.4184 },
      ],
    },
  ];

  return new Promise((resolve) =>
    setTimeout(
      () => resolve({ regions: mockRegions }),
      1000
    )
  );
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [regions, setRegions] = useState<AdventureRegion[]>([]);

  const mapRef = useRef<MapView>(null);

  // --- Location tracking ---
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        setIsLoading(false);
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setLocation(current);

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (pos) => setLocation(pos)
      );

      return () => subscription.remove();
    })();
  }, []);

  // --- Load mock data ---
  useEffect(() => {
    fetchAdventureData()
      .then((data) => {
        setRegions(data.regions);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // --- Handle map press ---
  const handleMapPress = (event: MapPressEvent) => {
    // No functionality - map press disabled
  };  // --- Loading ---
  if (isLoading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // --- Render ---
  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        onPress={handleMapPress}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        {/* Existing Regions (as polygons for backward compatibility) */}
        {regions.map((r) => (
          <Polygon
            key={r.id}
            coordinates={r.coords}
            strokeColor="rgba(52, 199, 89, 0.8)"
            fillColor="rgba(52, 199, 89, 0.2)"
            strokeWidth={2}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  // === Map and loading ===
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
