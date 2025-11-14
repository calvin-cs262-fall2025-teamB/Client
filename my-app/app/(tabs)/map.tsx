import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  LatLng,
  MapPressEvent,
  Marker,
  Polygon,
  UrlTile,
} from "react-native-maps";

type Token = {
  id: number;
  name: string;
  coord: LatLng;
  isVisible: boolean;
  hasVibrated: boolean;
};

type AdventureRegion = {
  id: number;
  name: string;
  coords: LatLng[];
};

async function fetchAdventureData(adventureId: string): Promise<{
  regions: AdventureRegion[];
  tokens: Token[];
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

  const mockTokens: Token[] = [
    {
      id: 1,
      name: "Golden Gate Token",
      coord: { latitude: 37.806, longitude: -122.475 },
      isVisible: true,
      hasVibrated: false,
    },
    {
      id: 2,
      name: "Hidden Treasure",
      coord: { latitude: 37.77, longitude: -122.42 },
      isVisible: false,
      hasVibrated: false,
    },
  ];

  return new Promise((resolve) =>
    setTimeout(
      () => resolve({ regions: mockRegions, tokens: mockTokens }),
      1000
    )
  );
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [regions, setRegions] = useState<AdventureRegion[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<LatLng[]>([]);

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
    const currentAdventureId = "adv_123";
    fetchAdventureData(currentAdventureId)
      .then((data) => {
        setRegions(data.regions);
        setTokens(data.tokens);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // --- Handle map press ---
  const handleMapPress = (event: MapPressEvent) => {
    const coord = event.nativeEvent.coordinate;

    if (isDrawing) {
      // Add vertex to current region
      setCurrentPoints((prev) => [...prev, coord]);
    } else {
      // Add token
      Alert.prompt("Add Custom Token", "Enter a name:", (tokenName) => {
        if (!tokenName) return;
        Alert.alert(
          "Set Visibility",
          "Should this token be visible immediately?",
          [
            {
              text: "Visible",
              onPress: () => createToken(tokenName, coord, true),
            },
            {
              text: "Hidden",
              onPress: () => createToken(tokenName, coord, false),
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
      });
    }
  };

  // --- Finalize region ---
  const finalizeRegion = () => {
    if (currentPoints.length < 3) {
      Alert.alert(
        "Incomplete Region",
        "Add at least 3 points to form a region."
      );
      return;
    }

    Alert.prompt("Region Name", "Enter a name for this region:", (name) => {
      if (!name) return;
      const newRegion: AdventureRegion = {
        id: Date.now(),
        name,
        coords: currentPoints,
      };
      setRegions((prev) => [...prev, newRegion]);
      setCurrentPoints([]);
      setIsDrawing(false);
    });
  };

  const cancelDrawing = () => {
    setCurrentPoints([]);
    setIsDrawing(false);
  };

  const createToken = (name: string, coord: LatLng, isVisible: boolean) => {
    const token: Token = {
      id: Date.now(),
      name,
      coord,
      isVisible,
      hasVibrated: false,
    };
    setTokens((prev) => [...prev, token]);
  };

  const handleMarkerPress = (token: Token) => {
    Alert.alert(`Remove ${token.name}`, "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeToken(token.id),
      },
    ]);
  };

  const removeToken = (id: number) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Loading ---
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
        scrollEnabled={!isDrawing}
        zoomEnabled={!isDrawing}
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

        {/* Existing Regions */}
        {regions.map((r) => (
          <Polygon
            key={r.id}
            coordinates={r.coords}
            strokeColor="rgba(0,0,255,0.8)"
            fillColor="rgba(0,0,255,0.2)"
            strokeWidth={2}
          />
        ))}

        {/* Live region drawing */}
        {isDrawing && currentPoints.length > 0 && (
          <Polygon
            coordinates={currentPoints}
            strokeColor="rgba(255,165,0,1)"
            fillColor="rgba(255,165,0,0.3)"
            strokeWidth={2}
          />
        )}

        {/* Tokens */}
        {!isDrawing &&
          tokens
            .filter((t) => t.isVisible)
            .map((t) => (
              <Marker
                key={t.id}
                coordinate={t.coord}
                title={t.name}
                pinColor="orange"
                onPress={() => handleMarkerPress(t)}
              />
            ))}
      </MapView>

      {/* Floating controls */}
      <View style={styles.controls}>
        {!isDrawing ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#007AFF" }]}
            onPress={() => setIsDrawing(true)}
          >
            <Text style={styles.buttonText}>Draw Region</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#4CAF50" }]}
              onPress={finalizeRegion}
            >
              <Text style={styles.buttonText}>Finish</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#FF3B30" }]}
              onPress={cancelDrawing}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  controls: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    gap: 10,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  map: { flex: 1 },
});
