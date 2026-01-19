import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
  Callout,
  Circle,
  LatLng,
  Marker,
} from "react-native-maps";

// Import contexts for backend integration
import { HelpModal } from "@/components/reusable/help/HelpModal";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { CreateToken, Point } from "@/types";

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

// Cross-platform hint modal
const HintModal = ({ 
  visible, 
  onSubmit, 
  onCancel, 
}: {
  visible: boolean;
  onSubmit: (hint: string) => void;
  onCancel: () => void;
}) => {
  const [hint, setHint] = useState('');
  
  const handleSubmit = () => {
    onSubmit(hint.trim());
    setHint('');
  };
  
  const handleCancel = () => {
    onCancel();
    setHint('');
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={hintModalStyles.overlay}>
        <View style={hintModalStyles.container}>
          <Text style={hintModalStyles.title}>Add Token Hint</Text>
          <Text style={hintModalStyles.message}>
            Enter a hint to help players find this token
          </Text>
          <TextInput
            style={hintModalStyles.input}
            value={hint}
            onChangeText={setHint}
            placeholder="Enter hint..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            autoFocus
          />
          <View style={hintModalStyles.buttonContainer}>
            <TouchableOpacity 
              style={[hintModalStyles.button, hintModalStyles.cancelButton]} 
              onPress={handleCancel}
            >
              <Text style={hintModalStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[hintModalStyles.button, hintModalStyles.submitButton]} 
              onPress={handleSubmit}
            >
              <Text style={hintModalStyles.submitButtonText}>Add Token</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function CreateAdventureMapScreen() {
  // Get route parameters
  const { adventureName, regionId, regionName } = useLocalSearchParams<{
    adventureName: string;
    regionId: string;
    regionName: string;
  }>();

  // Get contexts for backend integration
  const { user } = useAuth();
  const { createAdventure, createToken, fetchLandmarks, landmarks, regions, fetchAdventures } = useDatabase();
  const router = useRouter();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Token placement state
  const [tokens, setTokens] = useState<Array<{
    id: string;
    coordinate: LatLng;
    hint: string;
  }>>([]);
  const [nextTokenId, setNextTokenId] = useState(1);
  const [hintModalVisible, setHintModalVisible] = useState(false);
  const [pendingTokenLocation, setPendingTokenLocation] = useState<LatLng | null>(null);

  // Creation state
  const [isCreating, setIsCreating] = useState(false);

  const mapRef = useRef<MapView>(null);

  // Get region data
  const region = regions.find(r => r.id === Number(regionId));
  const regionLandmarks = landmarks.filter(l => l.regionid === Number(regionId));

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

  // Fetch landmarks for this region
  useEffect(() => {
    if (regionId) {
      fetchLandmarks(Number(regionId));
    }
  }, [regionId, fetchLandmarks]);

  // Animate map to fit region and landmarks
  useEffect(() => {
    if (region && mapRef.current && regionLandmarks.length > 0) {
      // Add a small delay to ensure map is ready
      setTimeout(() => {
        const coordinates: LatLng[] = [
          { latitude: region.location.x, longitude: region.location.y },
          ...regionLandmarks
            .filter(l => l.location)
            .map(l => ({ latitude: l.location!.x, longitude: l.location!.y }))
        ];
        
        if (coordinates.length > 0) {
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
            animated: true,
          });
        }
      }, 500);
    }
  }, [region, regionLandmarks]);

  // Add token at current location
  const addTokenAtCurrentLocation = () => {
    if (!location) {
      Alert.alert("No Location", "Unable to get your current location.");
      return;
    }
    
    const tokenCoord = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };

    setPendingTokenLocation(tokenCoord);
    setHintModalVisible(true);
  };

  // Handle hint submission
  const handleHintSubmit = (hint: string) => {
    if (!hint.trim()) {
      Alert.alert("Hint Required", "Please enter a valid hint for this token.");
      return;
    }

    if (!pendingTokenLocation) {
      return;
    }

    const newToken = {
      id: `token_${nextTokenId}`,
      coordinate: pendingTokenLocation,
      hint: hint.trim()
    };
    
    setTokens(prev => [...prev, newToken]);
    setNextTokenId(prev => prev + 1);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHintModalVisible(false);
    setPendingTokenLocation(null);
  };

  // Remove token
  const removeToken = (tokenId: string) => {
    setTokens(prev => prev.filter(t => t.id !== tokenId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Create adventure with tokens
  const handleCreateAdventure = async () => {
    if (tokens.length === 0) {
      Alert.alert(
        "No Tokens", 
        "You must add at least one token to create an adventure.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!user || !user.id) {
      Alert.alert("Authentication Required", "You must be logged in to create an adventure.");
      return;
    }

    if (!region) {
      Alert.alert("Error", "Region not found.");
      return;
    }

    setIsCreating(true);

    try {
      // Create adventure data
      const adventureData = {
        adventurerid: user.id,
        regionid: Number(regionId),
        name: adventureName,
        numtokens: tokens.length,
        location: region.location, // Use region's center as adventure location
      };

      console.log("Creating adventure:", adventureData);
      const savedAdventure = await createAdventure(adventureData);
      console.log("Adventure created successfully:", savedAdventure);

      if (!savedAdventure || !savedAdventure.id) {
        throw new Error("Failed to create adventure - no adventure ID returned");
      }

      // Create tokens in database
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const tokenData: CreateToken = {
          adventureid: savedAdventure.id,
          location: { x: token.coordinate.latitude, y: token.coordinate.longitude } as Point,
          hint: token.hint,
          tokenorder: i + 1,
        };

        await createToken(tokenData);
        console.log(`Token ${i + 1} created with hint: "${token.hint}"`);
      }

      // Refresh adventures data to include the new adventure
      await fetchAdventures();

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "🎉 Adventure Created!",
        `"${adventureName}" has been created with ${tokens.length} token${tokens.length === 1 ? '' : 's'}!`,
        [{ 
          text: "Great!", 
          onPress: () => {
            router.back();
            router.back(); // Go back twice to return to create adventure page
          }
        }]
      );

    } catch (error) {
      console.error("Error creating adventure:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Error",
        `Failed to create adventure: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Cancel creation
  const handleCancel = () => {
    if (tokens.length > 0) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved tokens. Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  // Loading state
  if (isLoading || !location || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  const regionCenter: LatLng = {
    latitude: region.location.x,
    longitude: region.location.y
  };

  // Render
  return (
    <View style={{ flex: 1 }}>
      <HelpModal 
        pageId="createAdventureMap" 
        position="top-left"
        iconColor="#007AFF"
      />
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
        toolbarEnabled={false}
        initialRegion={{
          latitude: regionCenter.latitude,
          longitude: regionCenter.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      >
        {/* Region circle */}
        <Circle
          center={regionCenter}
          radius={region.radius}
          fillColor="rgba(52, 199, 89, 0.15)"
          strokeColor="rgba(52, 199, 89, 0.8)"
          strokeWidth={2}
        />

        {/* Landmarks */}
        {regionLandmarks.map((landmark, index) => {
          if (!landmark.location) {
            console.log('Landmark without location:', landmark);
            return null;
          }
          
          const landmarkCoord: LatLng = {
            latitude: landmark.location.x,
            longitude: landmark.location.y
          };
          
          return (
            <Marker
              key={`landmark-${landmark.id}`}
              coordinate={landmarkCoord}
              pinColor="orange"
              title={landmark.name}
            >
              <Callout><View /></Callout>
            </Marker>
          );
        })}

        {/* Token markers */}
        {tokens.map((token, index) => (
          <Marker
            key={token.id}
            coordinate={token.coordinate}
            pinColor="blue"
            title={`Token ${index + 1}`}
            description={token.hint}
            onPress={() => {
              Alert.alert(
                `Token ${index + 1}`,
                `Hint: "${token.hint}"\n\nWould you like to remove this token?`,
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Remove", style: "destructive", onPress: () => removeToken(token.id) }
                ]
              );
            }}
          >
            <View style={styles.tokenMarkerContainer}>
              <View style={styles.tokenPin} />
              <Text style={styles.tokenOrderLabel}>{index + 1}</Text>
            </View>
            <Callout><View /></Callout>
          </Marker>
        ))}
      </MapView>

      {/* Header info overlay */}
      <View style={styles.headerOverlay}>
        <View style={styles.headerCard}>
          <Text style={styles.tokenCount}>
            {tokens.length} token{tokens.length === 1 ? '' : 's'} placed
          </Text>
        </View>
      </View>

      {/* Main Action Controls */}
      <View style={styles.controls}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>✕ Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={addTokenAtCurrentLocation}
          >
            <Text style={styles.buttonText}>➕ Add Token</Text>
          </TouchableOpacity>
        </View>
        
        {tokens.length > 0 && (
          <TouchableOpacity
            style={[styles.createButton]}
            onPress={handleCreateAdventure}
            disabled={isCreating}
          >
            {isCreating ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.createButtonText}>Creating...</Text>
              </View>
            ) : (
              <Text style={styles.createButtonText}>
                🎉 Create Adventure with {tokens.length} token{tokens.length === 1 ? '' : 's'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Hint Modal */}
      <HintModal
        visible={hintModalVisible}
        onSubmit={handleHintSubmit}
        onCancel={() => {
          setHintModalVisible(false);
          setPendingTokenLocation(null);
        }}
      />
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
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#34c759",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },

  // Landmark marker styles
  landmarkMarker: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  landmarkDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF9500",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  landmarkLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FF9500",
    marginTop: 2,
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    maxWidth: 100,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },

  // Token marker styles
  tokenMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tokenPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  tokenOrderLabel: {
    position: "absolute",
    fontSize: 14,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tokenMarker: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  tokenDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
  },
  tokenLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#007AFF",
    marginTop: 2,
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },

  // Header overlay
  headerOverlay: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
    pointerEvents: "none",
  },
  headerCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  adventureTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  regionInfo: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  tokenCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },

  // Instructions overlay
  instructionsOverlay: {
    position: "absolute",
    top: 180,
    left: 16,
    right: 16,
    zIndex: 1000,
    pointerEvents: "none",
  },
  instructionsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  // Controls at bottom
  controls: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
    zIndex: 3000,
    gap: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: "#EF4444",
  },
  addButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  createButton: {
    backgroundColor: "#34C759",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

// Hint modal styles
const hintModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    minHeight: 80,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  submitButton: {
    backgroundColor: "#007AFF",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
