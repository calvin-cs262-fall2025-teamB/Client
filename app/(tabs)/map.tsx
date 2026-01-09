import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, {
  Circle,
  LatLng,
  Marker,
  UrlTile
} from "react-native-maps";

// Import contexts
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";

// Import types
import { Adventure, Landmark, Point, Region } from "@/types/database";

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



// Type definitions
type ViewMode = 'regions' | 'adventures';

export default function MapScreen() {
  // Contexts
  const { user } = useAuth();
  const { regions, adventures, landmarks, fetchRegions, fetchAdventures, fetchLandmarks } = useDatabase();
  const router = useRouter();

  // Location state
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('regions');
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedAdventureId, setSelectedAdventureId] = useState<number | null>(null);
  const [allLandmarks, setAllLandmarks] = useState<Landmark[]>([]);
  const [regionLandmarks, setRegionLandmarks] = useState<Landmark[]>([]);
  const [adventurePositions, setAdventurePositions] = useState<Map<number, LatLng>>(new Map());

  const mapRef = useRef<MapView>(null);

  // Get selected region/adventure data
  const selectedRegion: Region | undefined = selectedRegionId ? regions.find((r: Region) => r.id === selectedRegionId) : undefined;
  const selectedAdventure: Adventure | undefined = selectedAdventureId ? adventures.find((a: Adventure) => a.id === selectedAdventureId) : undefined;

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

  // --- Load data ---
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const [, adventuresData, landmarksData] = await Promise.all([
          fetchRegions(),
          fetchAdventures(),
          fetchLandmarks(null) // Fetch all landmarks
        ]);
        
        if (landmarksData) {
          setAllLandmarks(landmarksData);
        }
      } catch (error: unknown) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [fetchRegions, fetchAdventures, fetchLandmarks]);

  // --- Calculate adventure positions when adventures or regions change ---
  useEffect(() => {
    if (adventures.length > 0 && regions.length > 0) {
      const positions = new Map<number, LatLng>();
      
      adventures.forEach((adventure: Adventure) => {
        const region: Region | undefined = regions.find((r: Region) => r.id === adventure.regionid);
        if (region) {
          const position = getRandomPointInRadius(region.location, region.radius * 0.8);
          positions.set(adventure.id, position);
        }
      });
      
      setAdventurePositions(positions);
    }
  }, [adventures, regions]);

  // --- Filter landmarks when region is selected ---
  useEffect(() => {
    if (selectedRegionId && allLandmarks.length > 0) {
      const filteredLandmarks: Landmark[] = allLandmarks.filter((l: Landmark) => l.regionid === selectedRegionId);
      setRegionLandmarks(filteredLandmarks);
    } else {
      setRegionLandmarks([]);
    }
  }, [selectedRegionId, allLandmarks]);

  // --- Helper functions ---
  const getRandomPointInRadius = (center: Point, radiusMeters: number): LatLng => {
    // Convert radius to degrees (rough approximation)
    const radiusDegrees: number = radiusMeters / 111320;
    
    // Generate random angle and distance
    const angle: number = Math.random() * 2 * Math.PI;
    const distance: number = Math.random() * radiusDegrees;
    
    // Calculate new coordinates
    const lat: number = center.x + distance * Math.cos(angle);
    const lng: number = center.y + (distance * Math.sin(angle)) / Math.cos((center.x * Math.PI) / 180);
    
    return { latitude: lat, longitude: lng };
  };

  // --- Handlers ---
  const handleViewModeChange = (mode: ViewMode): void => {
    setViewMode(mode);
    setSelectedRegionId(null);
    setSelectedAdventureId(null);
  };

  const handleRegionPress = (regionId: number): void => {
    if (selectedRegionId === regionId) {
      setSelectedRegionId(null);
    } else {
      setSelectedRegionId(regionId);
      setSelectedAdventureId(null);
    }
  };

  const handleAdventurePress = (adventureId: number): void => {
    if (selectedAdventureId === adventureId) {
      setSelectedAdventureId(null);
    } else {
      setSelectedAdventureId(adventureId);
      setSelectedRegionId(null);
    }
  };

  const handleGoToAdventure = (): void => {
    if (selectedAdventure) {
      router.push({
        pathname: '/(gameplay pages)/adventurePage',
        params: {
          adventureId: selectedAdventure.id.toString(),
          adventureName: selectedAdventure.name,
        }
      });
    }
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
        onPress={() => {
          // Clear selections when pressing empty area
          setSelectedRegionId(null);
          setSelectedAdventureId(null);
        }}
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

        {/* Selected Region Highlight */}
        {selectedRegion && (
          <Circle
            center={{ latitude: selectedRegion.location.x, longitude: selectedRegion.location.y }}
            radius={selectedRegion.radius}
            fillColor="rgba(52, 199, 89, 0.2)"
            strokeColor="rgba(52, 199, 89, 0.8)"
            strokeWidth={3}
          />
        )}

        {/* Region Icons (when regions mode) */}
        {viewMode === 'regions' && !selectedAdventureId && regions
          .filter((region: Region) => !selectedRegionId || region.id === selectedRegionId)
          .map((region: Region) => (
          <Marker
            key={`region-${region.id}`}
            coordinate={{ latitude: region.location.x, longitude: region.location.y }}
            pinColor="green"
            title={region.name}
            onPress={() => handleRegionPress(region.id)}
          />
        ))}

        {/* Adventure Icons (when adventures mode) */}
        {viewMode === 'adventures' && !selectedRegionId && adventures.map((adventure: Adventure) => {
          const adventurePosition = adventurePositions.get(adventure.id);
          if (!adventurePosition) return null;
          
          return (
            <Marker
              key={`adventure-${adventure.id}`}
              coordinate={adventurePosition}
              pinColor="blue"
              title={adventure.name}
              onPress={() => handleAdventurePress(adventure.id)}
            />
          );
        })}

        {/* Landmark Icons (when region is selected) */}
        {selectedRegionId && regionLandmarks.map((landmark: Landmark) => {
          if (!landmark.location) return null;
          
          return (
            <Marker
              key={`landmark-${landmark.id}`}
              coordinate={{ latitude: landmark.location.x, longitude: landmark.location.y }}
              pinColor="orange"
              title={landmark.name}
            />
          );
        })}
      </MapView>

      {/* View Mode Toggle Buttons */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'regions' && styles.viewModeButtonActive]}
          onPress={() => handleViewModeChange('regions')}
        >
          <Text style={[styles.viewModeText, viewMode === 'regions' && styles.viewModeTextActive]}>
            Regions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'adventures' && styles.viewModeButtonActive]}
          onPress={() => handleViewModeChange('adventures')}
        >
          <Text style={[styles.viewModeText, viewMode === 'adventures' && styles.viewModeTextActive]}>
            Adventures
          </Text>
        </TouchableOpacity>
      </View>

      {/* Adventure Action Button */}
      {selectedAdventure && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.adventureButton}
            onPress={handleGoToAdventure}
          >
            <Text style={styles.adventureButtonText}>
              🎮 Play "{selectedAdventure.name}"
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // === Map and loading ===
  map: { flex: 1 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f8f9fa"
  },

  // === View Mode Toggle ===
  viewModeContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#007AFF',
  },
  viewModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },

  // === Action Container ===
  actionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  adventureButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  adventureButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
