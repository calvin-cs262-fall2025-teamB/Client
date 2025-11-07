import { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Vibration,
  PanResponder,
  GestureResponderEvent,
} from "react-native";
import MapView, {
  Marker,
  LatLng,
  MapPressEvent,
  UrlTile,
  Circle,
} from "react-native-maps";
import * as Location from "expo-location";

// --- Local mock types and data function ---
type Token = {
  id: number;
  name: string;
  coord: LatLng;
  isVisible: boolean;
  hasVibrated: boolean;
};

type AdventureRegion = {
  center: LatLng;
  radius: number;
};

async function fetchAdventureData(adventureId: string): Promise<{
  region: AdventureRegion;
  tokens: Token[];
}> {
  // Mock region and token data
  const mockRegion: AdventureRegion = {
    center: { latitude: 37.7749, longitude: -122.4194 },
    radius: 300, // meters
  };

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

  // Simulate network delay
  return new Promise((resolve) =>
    setTimeout(() => resolve({ region: mockRegion, tokens: mockTokens }), 1000)
  );
}

// --- Main component ---
export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [adventureRegion, setAdventureRegion] = useState<AdventureRegion | null>(
    null
  );

  const [bubbleCenter, setBubbleCenter] = useState<LatLng | null>(null);
  const [bubbleRadius, setBubbleRadius] = useState<number>(0);

  const mapRef = useRef<MapView>(null);

  // --- Location tracking ---
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        setIsLoadingLocation(false);
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      setLocation(current);
      setIsLoadingLocation(false);

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

  // --- Adventure data loading ---
  useEffect(() => {
    const currentAdventureId = "adv_123";
    fetchAdventureData(currentAdventureId)
      .then((data) => {
        setAdventureRegion(data.region);
        setTokens(data.tokens);
      })
      .catch(() => Alert.alert("Error", "Could not load adventure data."))
      .finally(() => setIsLoadingData(false));
  }, []);

  // --- Handle adding new tokens ---
  const handleMapPress = (event: MapPressEvent) => {
    const newCoord = event.nativeEvent.coordinate;
    Alert.prompt("Add Custom Token", "Enter a name:", (tokenName) => {
      if (!tokenName) return;
      Alert.alert("Set Visibility", "Should this token be visible immediately?", [
        {
          text: "Visible",
          onPress: () => createToken(tokenName, newCoord, true),
        },
        {
          text: "Hidden",
          onPress: () => createToken(tokenName, newCoord, false),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    });
  };

  const createToken = (name: string, coord: LatLng, isVisible: boolean) => {
    const tempToken: Token = {
      id: Date.now(),
      coord: coord,
      name: name,
      isVisible: isVisible,
      hasVibrated: false,
    };
    setTokens((prev) => [...prev, tempToken]);
  };

  const handleMarkerPress = (token: Token) => {
    Alert.alert(`Remove ${token.name}`, "Are you sure you want to remove this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeToken(token.id),
      },
    ]);
  };

  const removeToken = (idToRemove: number) => {
    setTokens((prev) => prev.filter((t) => t.id !== idToRemove));
  };

  // --- Two-finger PanResponder for bubble drawing ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (evt: GestureResponderEvent) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const [t1, t2] = touches;
          if (!mapRef.current) return;

          const coord1 = mapRef.current.coordinateForPoint({
            x: t1.pageX,
            y: t1.pageY,
          });
          const coord2 = mapRef.current.coordinateForPoint({
            x: t2.pageX,
            y: t2.pageY,
          });

          Promise.all([coord1, coord2]).then(([c1, c2]) => {
            const center: LatLng = {
              latitude: (c1.latitude + c2.latitude) / 2,
              longitude: (c1.longitude + c2.longitude) / 2,
            };

            const R = 6371e3;
            const φ1 = (c1.latitude * Math.PI) / 180;
            const φ2 = (c2.latitude * Math.PI) / 180;
            const Δφ = ((c2.latitude - c1.latitude) * Math.PI) / 180;
            const Δλ = ((c2.longitude - c1.longitude) * Math.PI) / 180;
            const a =
              Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            setBubbleCenter(center);
            setBubbleRadius(distance / 2);
          });
        }
      },

      onPanResponderRelease: () => {
        // Keep bubble permanently
        if (bubbleCenter && bubbleRadius > 0) {
          const newRegion: AdventureRegion = {
            center: bubbleCenter,
            radius: bubbleRadius,
          };
          setAdventureRegion(newRegion);
        }
      },
    })
  ).current;

  // --- Loading screen ---
  if (isLoadingLocation || isLoadingData || !location || !adventureRegion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // --- Map ---
  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        followsUserLocation={true}
        onPress={handleMapPress}
        initialRegion={{
          latitude: adventureRegion.center.latitude,
          longitude: adventureRegion.center.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        {/* Adventure region */}
        <Circle
          center={adventureRegion.center}
          radius={adventureRegion.radius}
          strokeWidth={3}
          strokeColor="rgba(255,0,0,1)"
          fillColor="rgba(255,0,0,0.4)"
        />

        {/* Live bubble drawing */}
        {bubbleCenter && (
          <Circle
            center={bubbleCenter}
            radius={bubbleRadius}
            strokeWidth={2}
            strokeColor="rgba(139,0,0,1)"
            fillColor="rgba(139,0,0,0.5)"
          />
        )}

        {/* Tokens */}
        {tokens
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
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

