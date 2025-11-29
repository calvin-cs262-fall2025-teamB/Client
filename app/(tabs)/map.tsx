import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder,
} from "react-native";
import MapView, {
  LatLng,
  MapPressEvent,
  Marker,
  Polygon,
  Circle,
  UrlTile,
} from "react-native-maps";

// === ADDED: Import contexts for backend integration ===
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";

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

async function fetchAdventureData(): Promise<{
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
  // === ADDED: Get contexts for backend integration ===
  const { user } = useAuth();
  const { createRegion, createLandmark } = useDatabase();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [regions, setRegions] = useState<AdventureRegion[]>([]);

  // === MODIFIED: Circle-based region creation state ===
  const [isCreatingRegion, setIsCreatingRegion] = useState(false);
  const [regionCenter, setRegionCenter] = useState<LatLng | null>(null);
  const [regionRadius, setRegionRadius] = useState<number>(200); // Default 200m
  const [regionName, setRegionName] = useState<string>("");
  const [creationStep, setCreationStep] = useState<'idle' | 'placing' | 'adjusting'>('idle');

  const mapRef = useRef<MapView>(null);
  const [isPinching, setIsPinching] = useState(false);
  const initialPinchDistance = useRef<number>(0);
  const initialRadius = useRef<number>(200);
  const lastUpdateTime = useRef<number>(0);
  const THROTTLE_MS = 16; // ~60fps - update at most every 16ms

  // === ADDED: Calculate distance between two touch points ===
  const getTouchDistance = (touches: any[]) => {
    if (touches.length < 2) return 0;

    const touch1 = touches[0];
    const touch2 = touches[1];

    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;

    return Math.sqrt(dx * dx + dy * dy);
  };

  // === IMPROVED: Adaptive pixel-to-meter conversion for better control ===
  // Smaller radii get finer control, larger radii get coarser control
  const pixelsToMeters = useCallback((pixels: number, latitude: number, currentRadius: number) => {
    // Base sensitivity - adjust this to change overall responsiveness
    let sensitivity = 2.5;

    // Adaptive sensitivity based on current radius
    // Small circles (< 200m) = fine control (lower multiplier)
    // Large circles (> 1000m) = coarse control (higher multiplier)
    if (currentRadius < 200) {
      sensitivity = 1.5; // Fine control for small circles
    } else if (currentRadius > 1000) {
      sensitivity = 4.0; // Faster changes for large circles
    }

    return pixels * sensitivity;
  }, []);

  // === OPTIMIZED: Pinch gesture with haptics and throttling ===
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const touchCount = evt.nativeEvent.touches.length;
      // Only capture two-finger gestures for pinching
      if (touchCount === 2) {
        return true; // Capture pinch
      }
      // For single tap, handle it here and don't capture
      if (touchCount === 1 && creationStep === 'adjusting') {
        const touch = evt.nativeEvent.touches[0];
        // We'll handle this in onPanResponderGrant if needed
      }
      return touchCount === 2; // Only capture if 2 fingers
    },
    onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,

    onPanResponderGrant: (evt) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length === 2) {
        console.log('✌️ Pinch started!');
        // Haptic feedback when pinch starts
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsPinching(true);
        initialPinchDistance.current = getTouchDistance(touches);
        initialRadius.current = regionRadius;
        lastUpdateTime.current = Date.now();
      }
    },

    onPanResponderMove: (evt) => {
      const touches = evt.nativeEvent.touches;

      if (touches.length === 2 && regionCenter) {
        // Throttle updates to ~60fps for smoother performance
        const now = Date.now();
        if (now - lastUpdateTime.current < THROTTLE_MS) {
          return; // Skip this update
        }
        lastUpdateTime.current = now;

        // Calculate current distance between fingers
        const currentDistance = getTouchDistance(touches);

        // Calculate change from initial pinch
        const distanceChange = currentDistance - initialPinchDistance.current;

        // Convert pixel change to meters with adaptive sensitivity
        const metersChange = pixelsToMeters(distanceChange, regionCenter.latitude, regionRadius);

        // Update radius
        const newRadius = initialRadius.current + metersChange;
        const clampedRadius = Math.max(50, Math.min(5000, Math.round(newRadius)));

        console.log(`🤏 Pinching: ${clampedRadius}m (pixel distance: ${Math.round(currentDistance)}px)`);
        setRegionRadius(clampedRadius);
      }
    },

    onPanResponderRelease: () => {
      console.log('✅ Pinch released!');
      // Haptic feedback when pinch ends
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsPinching(false);
    },
  });

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
        setTokens(data.tokens);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // === ADDED: Helper to calculate distance between two points (Haversine formula) ===
  const calculateDistance = (point1: LatLng, point2: LatLng): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // --- Handle map press ---
  // === IMPROVED: Allow re-tapping to reposition center ===
  const handleMapPress = (event: MapPressEvent) => {
    const coord = event.nativeEvent.coordinate;

    if (creationStep === 'placing' || creationStep === 'adjusting') {
      // User can tap/re-tap to set or adjust region center
      setRegionCenter(coord);
      // Haptic feedback for placement
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (creationStep === 'placing') {
        // First tap - move to adjusting mode
        setCreationStep('adjusting');
      }
      // If already in adjusting mode, just update the center (stay in adjusting)
    } else if (creationStep === 'idle') {
      // Add token (existing functionality)
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
  // === COMPLETELY REWRITTEN: Circle-based region creation (much simpler!) ===
  const finalizeRegion = async () => {
    // Validation
    if (!regionCenter) {
      Alert.alert("No Location", "Please tap the map to place your region center.");
      return;
    }

    if (!regionName.trim()) {
      Alert.alert("Name Required", "Please enter a name for your region.");
      return;
    }

    if (!user || !user.id) {
      Alert.alert("Authentication Required", "You must be logged in to create a region.");
      return;
    }

    setIsCreatingRegion(true);

    try {
      // === Circle approach: Direct mapping to backend! ===
      const regionData = {
        adventurerId: user.id,
        name: regionName.trim(),
        description: `Circular region with ${regionRadius}m radius`,
        location: {
          x: regionCenter.latitude,
          y: regionCenter.longitude,
        },
        radius: regionRadius,
      };

      console.log("Creating circular region:", regionData);
      const savedRegion = await createRegion(regionData);
      console.log("Region created successfully:", savedRegion);

      // === Auto-generate evenly-spaced landmarks on circle perimeter ===
      const numLandmarks = 8;
      const perimeterPoints: LatLng[] = [];

      for (let i = 0; i < numLandmarks; i++) {
        const angle = (i / numLandmarks) * 2 * Math.PI;

        // Convert radius from meters to degrees (approximate)
        const radiusInDegrees = regionRadius / 111320; // 1 degree ≈ 111.32 km

        const lat = regionCenter.latitude + radiusInDegrees * Math.cos(angle);
        const lng = regionCenter.longitude +
          (radiusInDegrees * Math.sin(angle)) / Math.cos(regionCenter.latitude * Math.PI / 180);

        const landmarkData = {
          regionId: savedRegion.id,
          name: `${regionName} - Perimeter ${i + 1}`,
          location: { x: lat, y: lng },
        };

        await createLandmark(landmarkData);
        perimeterPoints.push({ latitude: lat, longitude: lng });
        console.log(`Landmark ${i + 1} created on perimeter`);
      }

      // === Update local state to show the new region ===
      const newRegion: AdventureRegion = {
        id: savedRegion.id,
        name: savedRegion.name,
        coords: perimeterPoints, // Use generated perimeter points for polygon display
      };
      setRegions((prev) => [...prev, newRegion]);

      // === Success feedback ===
      Alert.alert(
        "🎉 Region Created!",
        `"${regionName}" created successfully!\n\n` +
        `📍 Radius: ${regionRadius}m\n` +
        `🏷️ Landmarks: ${numLandmarks} evenly-spaced points`,
        [{ text: "Awesome!", style: "default" }]
      );

      // === Reset state ===
      resetCreationState();
    } catch (error) {
      console.error("Error creating region:", error);
      Alert.alert(
        "Error",
        `Failed to create region: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsCreatingRegion(false);
    }
  };

  // === ADDED: Helper to reset creation state ===
  const resetCreationState = () => {
    setRegionCenter(null);
    setRegionRadius(200);
    setRegionName("");
    setCreationStep('idle');
  };

  // === MODIFIED: Cancel region creation ===
  const cancelCreation = () => {
    resetCreationState();
    Alert.alert("Cancelled", "Region creation cancelled.");
  };

  // === ADDED: Start region creation flow ===
  const startCreation = () => {
    Alert.prompt(
      "New Region",
      "What would you like to name this region?",
      (name) => {
        if (!name || !name.trim()) {
          Alert.alert("Name Required", "Please enter a valid region name.");
          return;
        }
        setRegionName(name.trim());
        setCreationStep('placing');
      }
    );
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
        scrollEnabled={creationStep === 'idle'}
        zoomEnabled={creationStep === 'idle'}
        rotateEnabled={creationStep === 'idle'}
        pitchEnabled={creationStep === 'idle'}
        onPress={creationStep === 'placing' ? handleMapPress : undefined}
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

        {/* === ADDED: Live circle preview during creation === */}
        {regionCenter && creationStep !== 'idle' && (
          <>
            {/* Circle region preview */}
            <Circle
              center={regionCenter}
              radius={regionRadius}
              fillColor="rgba(52, 199, 89, 0.25)"
              strokeColor="rgba(52, 199, 89, 1)"
              strokeWidth={3}
            />
            {/* Center marker */}
            <Marker
              coordinate={regionCenter}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.centerMarker}>
                <View style={styles.centerDot} />
              </View>
            </Marker>
          </>
        )}

        {/* Tokens */}
        {creationStep === 'idle' &&
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

      {/* === ADDED: Touch overlay for gestures === */}
      {creationStep === 'adjusting' && (
        <View
          style={[StyleSheet.absoluteFill, { zIndex: 1000 }]}
          {...panResponder.panHandlers}
          onTouchEnd={async (evt) => {
            // Handle single taps for repositioning
            if (evt.nativeEvent.touches.length === 0 && !isPinching && regionCenter && mapRef.current) {
              try {
                const { locationX, locationY } = evt.nativeEvent;
                const coord = await mapRef.current.coordinateForPoint({
                  x: locationX,
                  y: locationY,
                });
                setRegionCenter(coord);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                console.log('📍 Center repositioned');
              } catch (error) {
                console.error('Error getting coordinate:', error);
              }
            }
          }}
        />
      )}

      {/* === COMPLETELY REWRITTEN: Beautiful circle-based controls === */}

      {/* === SIMPLIFIED: Clean instruction overlay === */}
      {creationStep !== 'idle' && (
        <View style={[styles.instructionsOverlay, { zIndex: 2000, pointerEvents: 'none' }]}>
          <View style={[
            styles.instructionsCard,
            isPinching && styles.instructionsCardPinching
          ]}>
            {creationStep === 'placing' ? (
              <>
                <Text style={styles.instructionsTitle}>📍 Place Center</Text>
                <Text style={styles.instructionsText}>
                  Tap anywhere on the map
                </Text>
              </>
            ) : (
              <>
                <Text style={[
                  styles.instructionsTitle,
                  isPinching && { color: '#FFFFFF' }
                ]}>"{regionName}"</Text>
                <Text style={[
                  styles.radiusDisplay,
                  isPinching && styles.radiusDisplayActive
                ]}>{regionRadius}m</Text>
                <Text style={[
                  styles.instructionsText,
                  isPinching && { color: '#FFFFFF' }
                ]}>
                  {isPinching ? '🤏 Pinching...' : '🤏 Pinch to resize'}
                </Text>
                {!isPinching && (
                  <Text style={styles.instructionsSubtext}>
                    Tap map to reposition center
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      )}

      {/* Main Action Controls */}
      <View style={[styles.controls, { zIndex: 3000, pointerEvents: 'box-none' }]}>
        {creationStep === 'idle' ? (
          <TouchableOpacity
            style={styles.createButton}
            onPress={startCreation}
          >
            <Text style={styles.createButtonText}>➕ Create Region</Text>
          </TouchableOpacity>
        ) : creationStep === 'adjusting' ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={finalizeRegion}
              disabled={isCreatingRegion}
            >
              {isCreatingRegion ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.buttonText}>Saving...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>✓ Create</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={cancelCreation}
              disabled={isCreatingRegion}
            >
              <Text style={styles.buttonText}>✕ Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // === Map and loading ===
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  // === Center marker styles ===
  centerMarker: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#34c759",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  // === Instructions overlay ===
  instructionsOverlay: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  instructionsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 350,
  },
  instructionsCardPinching: {
    backgroundColor: "rgba(52, 199, 89, 0.95)",
    shadowColor: "#34c759",
    shadowOpacity: 0.4,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    textAlign: "center",
  },
  instructionsText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  instructionsSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 6,
    fontStyle: "italic",
  },
  radiusDisplay: {
    fontSize: 36,
    fontWeight: "800",
    color: "#34c759",
    textAlign: "center",
    marginVertical: 8,
  },
  radiusDisplayActive: {
    color: "#FFFFFF",
    fontSize: 40,
  },

  // === Main action controls ===
  controls: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  createButton: {
    backgroundColor: "#34c759",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: "#34c759",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#34c759",
    shadowColor: "#34c759",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
