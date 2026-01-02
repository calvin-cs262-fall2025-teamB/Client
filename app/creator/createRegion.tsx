import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MapView, {
  Circle,
  LatLng,
  MapPressEvent,
  Marker,
  UrlTile,
} from "react-native-maps";

// Import contexts for backend integration
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { CreateLandmark, CreateRegion, Point } from "@/types";

// Cross-platform prompt function component
const PromptModal = ({ 
  visible, 
  title, 
  message, 
  onSubmit, 
  onCancel, 
  defaultValue = '' 
}: {
  visible: boolean;
  title: string;
  message: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  defaultValue?: string;
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  
  const handleSubmit = () => {
    onSubmit(inputValue.trim());
    setInputValue('');
  };
  
  const handleCancel = () => {
    onCancel();
    setInputValue('');
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={promptStyles.overlay}>
        <View style={promptStyles.container}>
          <Text style={promptStyles.title}>{title}</Text>
          <Text style={promptStyles.message}>{message}</Text>
          <TextInput
            style={promptStyles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Enter name..."
            autoFocus
            selectTextOnFocus
          />
          <View style={promptStyles.buttonContainer}>
            <TouchableOpacity 
              style={[promptStyles.button, promptStyles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={promptStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[promptStyles.button, promptStyles.submitButton]} 
              onPress={handleSubmit}
            >
              <Text style={promptStyles.submitButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function CreateRegionScreen() {
  // Get contexts for backend integration
  const { user } = useAuth();
  const { createRegion, createLandmark, fetchRegions, fetchLandmarks } = useDatabase();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Circle-based region creation state
  const [isCreatingRegion, setIsCreatingRegion] = useState(false);
  const [regionCenter, setRegionCenter] = useState<LatLng | null>(null);
  const [regionRadius, setRegionRadius] = useState<number>(200); // Default 200m
  const [regionName, setRegionName] = useState<string>("");
  const [creationStep, setCreationStep] = useState<
    "idle" | "placing" | "adjusting"
  >("idle");

  // Prompt modal state
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptConfig, setPromptConfig] = useState<{
    title: string;
    message: string;
    callback: (text?: string) => void;
    defaultValue?: string;
  } | null>(null);

  // Cross-platform prompt helper
  const showPromptDialog = (
    title: string,
    message: string,
    callback: (text?: string) => void,
    defaultValue?: string
  ) => {
    setPromptConfig({ title, message, callback, defaultValue });
    setPromptVisible(true);
  };

  const mapRef = useRef<MapView>(null);
  const [isPinching, setIsPinching] = useState(false);
  const initialPinchDistance = useRef<number>(0);
  const initialRadius = useRef<number>(200);
  const lastUpdateTime = useRef<number>(0);
  const THROTTLE_MS = 16; // ~60fps - update at most every 16ms

  // Calculate distance between two touch points
  const getTouchDistance = (touches: any[]) => {
    if (touches.length < 2) return 0;

    const touch1 = touches[0];
    const touch2 = touches[1];

    // Use pageX/pageY if available (iOS), fall back to locationX/Y (Android)
    const x1 = touch1.pageX ?? touch1.locationX ?? 0;
    const y1 = touch1.pageY ?? touch1.locationY ?? 0;
    const x2 = touch2.pageX ?? touch2.locationX ?? 0;
    const y2 = touch2.pageY ?? touch2.locationY ?? 0;

    const dx = x1 - x2;
    const dy = y1 - y2;

    return Math.sqrt(dx * dx + dy * dy);
  };

  // Adaptive pixel-to-meter conversion for better control
  const pixelsToMeters = useCallback(
    (pixels: number, latitude: number, currentRadius: number) => {
      // Base sensitivity - adjust this to change overall responsiveness
      let sensitivity = 2.5;

      // Adaptive sensitivity based on current radius
      if (currentRadius < 200) {
        sensitivity = 1.5; // Fine control for small circles
      } else if (currentRadius > 1000) {
        sensitivity = 4.0; // Faster changes for large circles
      }

      return pixels * sensitivity;
    },
    []
  );

  // Pinch gesture with haptics and throttling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const touchCount = evt.nativeEvent.touches.length;
      return creationStep === "adjusting" && touchCount === 2;
    },
    onMoveShouldSetPanResponder: (evt) => {
      const touchCount = evt.nativeEvent.touches.length;
      return creationStep === "adjusting" && touchCount === 2;
    },

    onPanResponderGrant: (evt) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length === 2) {
        const distance = getTouchDistance(touches);

        if (distance > 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setIsPinching(true);
          initialPinchDistance.current = distance;
          initialRadius.current = regionRadius;
          lastUpdateTime.current = Date.now();
        } else {
          console.warn("⚠️ Touch distance is 0 - touch coordinates may be unavailable");
        }
      }
    },

    onPanResponderMove: (evt) => {
      const touches = evt.nativeEvent.touches;

      if (touches.length === 2 && regionCenter && isPinching) {
        // Throttle updates to ~60fps for smoother performance
        const now = Date.now();
        if (now - lastUpdateTime.current < THROTTLE_MS) {
          return; // Skip this update
        }
        lastUpdateTime.current = now;

        const currentDistance = getTouchDistance(touches);

        if (currentDistance === 0 || initialPinchDistance.current === 0) {
          console.warn("⚠️ Invalid touch distance detected");
          return;
        }

        const distanceChange = currentDistance - initialPinchDistance.current;
        const metersChange = pixelsToMeters(
          distanceChange,
          regionCenter.latitude,
          regionRadius
        );

        const newRadius = initialRadius.current + metersChange;
        const clampedRadius = Math.max(
          50,
          Math.min(5000, Math.round(newRadius))
        );

        setRegionRadius(clampedRadius);
      }
    },

    onPanResponderRelease: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsPinching(false);
    },
  });

  // Location tracking
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
      setIsLoading(false);

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

  // Handle map press
  const handleMapPress = (event: MapPressEvent) => {
    if (isPinching) {
      return;
    }

    const coord = event.nativeEvent.coordinate;

    if (creationStep === "placing" || creationStep === "adjusting") {
      setRegionCenter(coord);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (creationStep === "placing") {
        setCreationStep("adjusting");
      }
    }
  };

  // Finalize region creation
  const finalizeRegion = async () => {
    // Validation
    if (!regionCenter) {
      Alert.alert(
        "No Location",
        "Please tap the map to place your region center."
      );
      return;
    }

    if (!regionName.trim()) {
      Alert.alert("Name Required", "Please enter a name for your region.");
      return;
    }

    if (!user || !user.id) {
      Alert.alert(
        "Authentication Required",
        "You must be logged in to create a region."
      );
      return;
    }

    setIsCreatingRegion(true);

    try {
      // Circle approach: Use proper database types
      const location: Point = {
        x: regionCenter.latitude,
        y: regionCenter.longitude,
      };

      const regionData: CreateRegion = {
        adventurerid: user.id,
        name: regionName.trim(),
        description: `Circular region with ${regionRadius}m radius`,
        location,
        radius: regionRadius,
      };

      console.log("Creating circular region:", regionData);
      const savedRegion = await createRegion(regionData);
      console.log("Region created successfully:", savedRegion);

      if (!savedRegion || !savedRegion.id) {
        throw new Error("Failed to create region - no region ID returned");
      }

      // Auto-generate evenly-spaced landmarks on circle perimeter
      const numLandmarks = 8;

      for (let i = 0; i < numLandmarks; i++) {
        const angle = (i / numLandmarks) * 2 * Math.PI;

        // Convert radius from meters to degrees (approximate)
        const radiusInDegrees = regionRadius / 111320; // 1 degree ≈ 111.32 km

        const lat = regionCenter.latitude + radiusInDegrees * Math.cos(angle);
        const lng =
          regionCenter.longitude +
          (radiusInDegrees * Math.sin(angle)) /
            Math.cos((regionCenter.latitude * Math.PI) / 180);

        const landmarkData: CreateLandmark = {
          regionid: savedRegion.id,
          name: `${regionName} - Perimeter ${i + 1}`,
          location: { x: lat, y: lng },
        };

        await createLandmark(landmarkData);
        console.log(`Landmark ${i + 1} created on perimeter`);
      }

      // Refresh database data to include new region and landmarks
      await fetchRegions();
      await fetchLandmarks(savedRegion.id);

      // Success feedback
      Alert.alert(
        "🎉 Region Created!",
        `"${regionName}" created successfully!\n\n` +
          `📍 Radius: ${regionRadius}m\n` +
          `🏷️ Landmarks: ${numLandmarks} evenly-spaced points`,
        [{ text: "Awesome!", style: "default" }]
      );

      // Reset state
      resetCreationState();
    } catch (error) {
      console.error("Error creating region:", error);
      Alert.alert(
        "Error",
        `Failed to create region: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsCreatingRegion(false);
    }
  };

  // Helper to reset creation state
  const resetCreationState = () => {
    setRegionCenter(null);
    setRegionRadius(200);
    setRegionName("");
    setCreationStep("idle");
  };

  // Cancel region creation
  const cancelCreation = () => {
    resetCreationState();
    Alert.alert("Cancelled", "Region creation cancelled.");
  };

  // Start region creation flow
  const startCreation = () => {
    showPromptDialog(
      "New Region",
      "What would you like to name this region?",
      (name) => {
        if (!name || !name.trim()) {
          Alert.alert("Name Required", "Please enter a valid region name.");
          return;
        }
        setRegionName(name.trim());
        setCreationStep("placing");
      }
    );
  };

  // Loading state
  if (isLoading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // Render
  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        scrollEnabled={creationStep === "idle"}
        zoomEnabled={creationStep === "idle"}
        rotateEnabled={creationStep === "idle"}
        pitchEnabled={creationStep === "idle"}
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

        {/* Live circle preview during creation */}
        {regionCenter && creationStep !== "idle" && (
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
            <Marker coordinate={regionCenter} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.centerMarker}>
                <View style={styles.centerDot} />
              </View>
            </Marker>
          </>
        )}
      </MapView>

      {/* Touch overlay for gestures */}
      {creationStep === "adjusting" && (
        <View
          style={[StyleSheet.absoluteFill, { zIndex: 1000 }]}
          {...panResponder.panHandlers}
          onTouchEnd={async (evt) => {
            if (
              evt.nativeEvent.touches.length === 0 &&
              !isPinching &&
              regionCenter &&
              mapRef.current
            ) {
              try {
                const { locationX, locationY } = evt.nativeEvent;

                if (locationX === undefined || locationY === undefined) {
                  console.log("📍 Touch coordinates unavailable, MapView.onPress will handle");
                  return;
                }

                const coord = await mapRef.current.coordinateForPoint({
                  x: locationX,
                  y: locationY,
                });

                if (coord && coord.latitude && coord.longitude) {
                  setRegionCenter(coord);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              } catch (error) {
                console.log("Touch overlay coordinate conversion failed:", error);
              }
            }
          }}
        />
      )}

      {/* Clean instruction overlay */}
      {creationStep !== "idle" && (
        <View
          style={[
            styles.instructionsOverlay,
            { zIndex: 2000, pointerEvents: "none" },
          ]}
        >
          <View
            style={[
              styles.instructionsCard,
              isPinching && styles.instructionsCardPinching,
            ]}
          >
            {creationStep === "placing" ? (
              <>
                <Text style={styles.instructionsTitle}>📍 Place Center</Text>
                <Text style={styles.instructionsText}>
                  Tap anywhere on the map
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={[
                    styles.instructionsTitle,
                    isPinching && { color: "#FFFFFF" },
                  ]}
                >
                  {regionName}
                </Text>
                <Text
                  style={[
                    styles.radiusDisplay,
                    isPinching && styles.radiusDisplayActive,
                  ]}
                >
                  {regionRadius}m
                </Text>
                <Text
                  style={[
                    styles.instructionsText,
                    isPinching && { color: "#FFFFFF" },
                  ]}
                >
                  {isPinching ? "🤏 Pinching..." : "🤏 Pinch to resize"}
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
      <View
        style={[styles.controls, { zIndex: 3000, pointerEvents: "box-none" }]}
      >
        {creationStep === "idle" ? (
          <TouchableOpacity style={styles.createButton} onPress={startCreation}>
            <Text style={styles.createButtonText}>➕ Create Region</Text>
          </TouchableOpacity>
        ) : creationStep === "adjusting" ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={finalizeRegion}
              disabled={isCreatingRegion}
            >
              {isCreatingRegion ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
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

      {/* Prompt Modal */}
      {promptConfig && (
        <PromptModal
          visible={promptVisible}
          title={promptConfig.title}
          message={promptConfig.message}
          defaultValue={promptConfig.defaultValue}
          onSubmit={(text) => {
            promptConfig.callback(text);
            setPromptVisible(false);
            setPromptConfig(null);
          }}
          onCancel={() => {
            promptConfig.callback(undefined);
            setPromptVisible(false);
            setPromptConfig(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Map and loading
  map: { flex: 1 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f8f9fa"
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },

  // Center marker styles
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

  // Instructions overlay
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

  // Main action controls
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

// Prompt modal styles
const promptStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  message: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});