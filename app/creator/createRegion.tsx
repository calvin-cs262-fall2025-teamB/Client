import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
} from "react-native-maps";

// Import contexts for backend integration
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { CreateLandmark, CreateRegion, Point } from "@/types";

// Custom map style to hide points of interest
const customMapStyle = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.government",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.medical",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.place_of_worship",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.school",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.sports_complex",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit.station",
    stylers: [{ visibility: "off" }]
  }
];

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
    "idle" | "placing" | "adjustingRadius" | "confirmRadius"
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
  const [isDraggingEdge, setIsDraggingEdge] = useState(false);
  const [edgeMarkerCoord, setEdgeMarkerCoord] = useState<LatLng | null>(null);

  // Calculate distance between two geographic points in meters
  const calculateDistance = useCallback((point1: LatLng, point2: LatLng): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (point2.latitude - point1.latitude) * (Math.PI / 180);
    const dLng = (point2.longitude - point1.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.latitude * (Math.PI / 180)) *
        Math.cos(point2.latitude * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Calculate edge marker position based on center and radius
  const calculateEdgePosition = useCallback((center: LatLng, radius: number): LatLng => {
    console.log("calculateEdgePosition called with center:", center, "radius:", radius);
    const radiusInDegrees = radius / 111320; // Convert meters to degrees
    console.log("radiusInDegrees:", radiusInDegrees);
    const result = {
      latitude: center.latitude + radiusInDegrees,
      longitude: center.longitude,
    };
    console.log("calculateEdgePosition returning:", result);
    return result;
  }, []);

  // Handle edge marker drag to resize circle
  const handleEdgeMarkerDrag = useCallback((newCoord: LatLng) => {
    if (!regionCenter) return;
    
    const distance = calculateDistance(regionCenter, newCoord);
    const clampedRadius = Math.max(50, Math.min(5000, Math.round(distance)));
    
    setRegionRadius(clampedRadius);
    setEdgeMarkerCoord(calculateEdgePosition(regionCenter, clampedRadius));
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [regionCenter, calculateDistance, calculateEdgePosition]);

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

  // Update edge marker position when center or radius changes
  useEffect(() => {
    console.log("useEffect triggered - regionCenter:", regionCenter, "creationStep:", creationStep, "regionRadius:", regionRadius);
    if (regionCenter && (creationStep === "adjustingRadius" || creationStep === "confirmRadius")) {
      console.log("Conditions met, calling calculateEdgePosition with:", { center: regionCenter, radius: regionRadius });
      const newEdgeCoord = calculateEdgePosition(regionCenter, regionRadius);
      console.log("calculateEdgePosition returned:", newEdgeCoord);
      console.log("Setting edge marker coordinate:", newEdgeCoord, "for step:", creationStep);
      setEdgeMarkerCoord(newEdgeCoord);
    } else {
      console.log("Conditions not met, setting edgeMarkerCoord to null");
      setEdgeMarkerCoord(null);
    }
  }, [regionCenter, regionRadius, creationStep, calculateEdgePosition]);

  // Handle map press
  const handleMapPress = (event: MapPressEvent) => {
    if (isDraggingEdge) {
      return;
    }

    const coord = event.nativeEvent.coordinate;

    // Allow center placement/movement in placing state
    if (creationStep === "placing") {
      setRegionCenter(coord);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Don't auto-advance - user can keep repositioning until they confirm
    }
  };

  // Handle center confirmation
  const confirmCenter = () => {
    if (!regionCenter) {
      Alert.alert("No Location", "Please tap the map to place your region center.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCreationStep("adjustingRadius");
  };

  // Handle radius confirmation
  const confirmRadius = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCreationStep("confirmRadius");
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
        mapType={"standard"}
        customMapStyle={customMapStyle}
        showsUserLocation={true}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        showsCompass={false}
        showsScale={false}
        scrollEnabled={creationStep === "idle" || creationStep === "placing" || isDraggingEdge}
        zoomEnabled={true}
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

        {/* Live circle preview during creation */}
        {regionCenter && (creationStep === "adjustingRadius" || creationStep === "confirmRadius") && (
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
            {/* Edge marker for resizing - only in adjustingRadius state */}
            {edgeMarkerCoord && creationStep === "adjustingRadius" && (
              <Marker
                coordinate={edgeMarkerCoord}
                draggable={true}
                onDragStart={() => {
                  console.log("Edge marker drag started");
                  setIsDraggingEdge(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                onDrag={(e) => {
                  handleEdgeMarkerDrag(e.nativeEvent.coordinate);
                }}
                onDragEnd={() => {
                  console.log("Edge marker drag ended");
                  setIsDraggingEdge(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <View style={styles.edgeMarker}>
                  <View style={styles.edgeDot} />
                  <Text style={styles.edgeLabel}>Drag</Text>
                </View>
              </Marker>
            )}
          </>
        )}

        {/* Center marker only during placing state */}
        {regionCenter && creationStep === "placing" && (
          <Marker coordinate={regionCenter} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.centerMarker}>
              <View style={styles.centerDot} />
            </View>
          </Marker>
        )}
      </MapView>



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
              isDraggingEdge && styles.instructionsCardDragging,
            ]}
          >
            {creationStep === "placing" ? (
              <>
                <Text style={styles.instructionsTitle}>📍 Place Center</Text>
                <Text style={styles.instructionsText}>
                  {regionCenter ? "Tap to reposition center" : "Tap anywhere on the map"}
                </Text>
              </>
            ) : creationStep === "adjustingRadius" ? (
              <>
                <Text
                  style={[
                    styles.instructionsTitle,
                    isDraggingEdge && { color: "#FFFFFF" },
                  ]}
                >
                  {regionName}
                </Text>
                <Text
                  style={[
                    styles.radiusDisplay,
                    isDraggingEdge && styles.radiusDisplayActive,
                  ]}
                >
                  {regionRadius}m
                </Text>
                <Text
                  style={[
                    styles.instructionsText,
                    isDraggingEdge && { color: "#FFFFFF" },
                  ]}
                >
                  {isDraggingEdge ? "🔵 Dragging..." : "🔵 Drag blue dot to resize"}
                </Text>
              </>
            ) : creationStep === "confirmRadius" ? (
              <>
                <Text style={styles.instructionsTitle}>✅ Confirm Region</Text>
                <Text style={styles.instructionsText}>
                  {regionName} - {regionRadius}m radius
                </Text>
              </>
            ) : null}
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
        ) : creationStep === "placing" ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={cancelCreation}
            >
              <Text style={styles.buttonText}>✕ Cancel</Text>
            </TouchableOpacity>
            {regionCenter && (
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={confirmCenter}
              >
                <Text style={styles.buttonText}>✓ Confirm Center</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : creationStep === "adjustingRadius" ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={() => setCreationStep("placing")}
            >
              <Text style={styles.buttonText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={confirmRadius}
            >
              <Text style={styles.buttonText}>✓ Confirm Size</Text>
            </TouchableOpacity>
          </View>
        ) : creationStep === "confirmRadius" ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={() => setCreationStep("adjustingRadius")}
            >
              <Text style={styles.buttonText}>← Back</Text>
            </TouchableOpacity>
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
                  <Text style={styles.buttonText}>Creating...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>🎉 Create Region</Text>
              )}
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

  // Edge marker styles
  edgeMarker: {
    width: 44,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  edgeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  edgeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#007AFF",
    marginTop: 2,
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: "hidden",
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
  instructionsCardDragging: {
    backgroundColor: "rgba(0, 122, 255, 0.95)",
    shadowColor: "#007AFF",
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
  confirmButton: {
    backgroundColor: "#34c759",
    shadowColor: "#34c759",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backButton: {
    backgroundColor: "#6c757d",
    shadowColor: "#6c757d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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