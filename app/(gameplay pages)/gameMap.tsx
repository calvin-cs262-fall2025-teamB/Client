import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

import { useAuth } from "../../contexts/AuthContext";
import { useDatabase } from "../../contexts/DatabaseContext";
import { Adventure, Landmark, Token } from "../../types/database";

// Haversine distance (in meters) between two lat/lng coordinates
function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // earth radius in m
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function GameMap() {
  const { user } = useAuth();
  const { adventureId, accuracy } = useLocalSearchParams<{ 
    adventureId: string;
    accuracy?: 'normal' | 'high';
  }>();
  const router = useRouter();
  const {
    fetchAdventures,
    fetchTokens,
    fetchLandmarks,
    getTokensByAdventure,
    getLandmarksByRegion,
    completeAdventure,
    adventures,
    tokens,
    landmarks,
    loading
  } = useDatabase();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentAdventure, setCurrentAdventure] = useState<Adventure | null>(null);
  const [adventureLandmarks, setAdventureLandmarks] = useState<Landmark[]>([]);
  const [adventureTokens, setAdventureTokens] = useState<Token[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [collectedTokens, setCollectedTokens] = useState<number>(0);
  const [visitedLandmarks, setVisitedLandmarks] = useState<Set<number>>(
    () => new Set()
  );

  const [tokenNum, setTokenNum] = useState<number>(1);
  const [hasVibratedForCurrentToken, setHasVibratedForCurrentToken] = useState<boolean>(false);

  // Floating landmark panel
  const [landmarksExpanded, setLandmarksExpanded] = useState(false);
  
  // Floating hint panel
  const [hintExpanded, setHintExpanded] = useState(false);

  // Completion modal state
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Adventure timing
  const [adventureStartTime, setAdventureStartTime] = useState<Date | null>(null);
  const [completionTimeFormatted, setCompletionTimeFormatted] = useState<string>("");

  // ✅ map center/region (this is what updates when you move the map)
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const mapRef = useRef<MapView | null>(null);

  // Get location settings based on selected accuracy
  const getLocationSettings = useCallback(() => {
    if (accuracy === 'high') {
      return {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 500,
        distanceInterval: 0.5,
        proximityRadius: 6
      };
    } else {
      return {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 1,
        proximityRadius: 15
      };
    }
  }, [accuracy]);

  // Load adventure data when component mounts or adventureId changes
  useEffect(() => {
    if (!adventureId || dataLoaded) return;

    const loadAdventureData = async () => {
      try {
        setDataLoaded(true);
        
        // Fetch all required data
        const [adventuresData, allTokensData, allLandmarksData] = await Promise.all([
          fetchAdventures(),
          fetchTokens(), // Fetch all tokens first
          fetchLandmarks() // Fetch all landmarks first
        ]);
        
        // Find the current adventure from the fetched data or existing state
        const adventure = adventures.find(a => a.id === parseInt(adventureId)) || 
                         adventuresData?.find(a => a.id === parseInt(adventureId));
        
        if (adventure) {
          setCurrentAdventure(adventure);
          
          // Start timing the adventure if not already started
          if (!adventureStartTime) {
            setAdventureStartTime(new Date());
          }
          
          // Filter tokens for this specific adventure from the returned data
          const adventureTokensList = allTokensData ? 
            allTokensData.filter(token => token.adventureid === adventure.id) :
            getTokensByAdventure(adventure.id);
          setAdventureTokens(adventureTokensList);
          
          // Filter landmarks for the adventure's region from the returned data
          const regionLandmarks = allLandmarksData ?
            allLandmarksData.filter(landmark => landmark.regionid === adventure.regionid) :
            getLandmarksByRegion(adventure.regionid);
          setAdventureLandmarks(regionLandmarks);
        }
      } catch (error) {
        console.error('Error loading adventure data:', error);
        Alert.alert('Error', 'Failed to load adventure data');
        setDataLoaded(false); // Allow retry if there was an error
      }
    };

    loadAdventureData();
  }, [adventureId]); // Only depend on adventureId

  // Reset data loaded flag when adventure ID changes
  useEffect(() => {
    setDataLoaded(false);
    setCurrentAdventure(null);
    setAdventureLandmarks([]);
    setAdventureTokens([]);
    setAdventureStartTime(null);
    setCompletionTimeFormatted("");
  }, [adventureId]);

  // Reset vibration state when tokenNum changes
  useEffect(() => {
    setHasVibratedForCurrentToken(false);
  }, [tokenNum]);

  // Check for adventure completion
  useEffect(() => {
    if (adventureTokens.length > 0 && collectedTokens === adventureTokens.length && !isCompleted) {
      setIsCompleted(true);
      setShowCompletionModal(true);
    }
  }, [collectedTokens, adventureTokens.length, isCompleted]);

  // Define proximity check function for both landmarks and tokens
  const checkProximity = useCallback((loc: Location.LocationObject) => {
    const { latitude, longitude } = loc.coords;
    const { proximityRadius } = getLocationSettings();

    // Check tokens
    adventureTokens.forEach((token) => {
      if (!token.location) return;
      if (visitedLandmarks.has(`token_${token.id}` as any)) return;

      const tokenOrder = token.tokenorder || 1;
      const distance = getDistanceMeters(
        latitude,
        longitude,
        token.location.x,
        token.location.y
      );

      // Check if this is the current token and user is in proximity
      if (tokenOrder === tokenNum && distance <= 10 && !hasVibratedForCurrentToken) {
        // Vibrate for current token when in close proximity
        Vibration.vibrate([0, 500, 200, 500]); // Pattern: wait, vibrate, pause, vibrate
        setHasVibratedForCurrentToken(true);
      }

      if (distance <= proximityRadius) {
        setVisitedLandmarks((prev) => {
          const updated = new Set(prev);
          updated.add(`token_${token.id}` as any);
          return updated;
        });

        setCollectedTokens((prev) => prev + 1); // Increment collected tokens count

        Alert.alert(
          "Token collected!",
          `You collected token ${tokenOrder}!${token.hint ? ` Hint: ${token.hint}` : ''}`
        );
        
        // Move to next token
        if (tokenOrder === tokenNum) {
          setTokenNum(prev => prev + 1);
        }
      }
    });
  }, [adventureLandmarks, adventureTokens, visitedLandmarks, tokenNum, hasVibratedForCurrentToken, getLocationSettings]);

  // Request user location & start watching
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        Alert.alert("Location Required", "Enable location services to play.");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: getLocationSettings().accuracy,
      });
      setLocation(currentLocation);

      // set initial map center to user's location
      setMapRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      const locationSettings = getLocationSettings();
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: locationSettings.accuracy,
          timeInterval: locationSettings.timeInterval,
          distanceInterval: locationSettings.distanceInterval,
        },
        (loc) => {
          setLocation(loc);
          // optionally keep map following user; comment this out if you
          // only want map center to move when the user drags the map
          setMapRegion((prev) => ({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: prev?.latitudeDelta ?? 0.01,
            longitudeDelta: prev?.longitudeDelta ?? 0.01,
          }));

          checkProximity(loc);
        }
      );

      locationSubscription.current = subscription;
    })();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [checkProximity]);

  const focusOnLandmark = (lm: Landmark) => {
    if (!lm.location) return;

    const region: Region = {
      latitude: lm.location.x,
      longitude: lm.location.y,
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    };

    setMapRegion(region); // 👈 update map center
    mapRef.current?.animateToRegion(region, 800);
  };

  const focusOnToken = (token: Token) => {
    if (!token.location) return;

    const region: Region = {
      latitude: token.location.x,
      longitude: token.location.y,
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    };

    setMapRegion(region);
    mapRef.current?.animateToRegion(region, 800);
  };

  const formatDuration = (startTime: Date, endTime: Date): string => {
    const durationMs = endTime.getTime() - startTime.getTime();
    const totalSeconds = Math.floor(durationMs / 1000);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const handleAdventureCompletion = async () => {
    if (!user || !currentAdventure || !adventureStartTime) {
      Alert.alert('Error', 'Unable to save adventure completion');
      return;
    }

    const completionEndTime = new Date();
    const durationMs = completionEndTime.getTime() - adventureStartTime.getTime();
    const totalSeconds = Math.floor(durationMs / 1000);
    
    // Format as PostgreSQL interval string (e.g., "00:15:30" for 15 minutes 30 seconds)
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const completionTimeInterval = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Store formatted time for display in modal
    setCompletionTimeFormatted(formatDuration(adventureStartTime, completionEndTime));

    setIsSaving(true);
    try {
      // Save the completed adventure
      await completeAdventure({
        adventurerid: user.id,
        adventureid: currentAdventure.id,
        completiondate: completionEndTime.toISOString(),
        completiontime: completionTimeInterval
      });

      // Close modal and navigate to profile
      setShowCompletionModal(false);
      router.push('/(tabs)/profile');
    } catch (error) {
      console.error('Failed to save adventure completion:', error);
      Alert.alert('Error', 'Failed to save adventure completion. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.score}>Tokens Collected: {collectedTokens} / {adventureTokens.length}</Text>
      </View>

      {errorMsg && (
        <View style={styles.message}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Map */}
      {mapRegion ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={mapRegion} // 👈 controlled region
          onRegionChangeComplete={setMapRegion} // 👈 updates when you move the map
          showsUserLocation
        >
          {/* Landmarks */}
          {adventureLandmarks.map((lm) => {
            if (!lm.location) return null;
            return (
              <View key={`landmark_${lm.id}`}>
                <Marker
                  coordinate={{
                    latitude: lm.location.x,
                    longitude: lm.location.y,
                  }}
                  title={lm.name}
                  pinColor="Red"
                />
              </View>
            );
          })}
          
          {/* Tokens - Show collected tokens or current token if in proximity */}
          {adventureTokens
            .filter(token => {
              if (!token.location || !location) return false;
              
              const tokenOrder = token.tokenorder || 1;
              
              // Show if token has been collected (tokenNum > tokenorder)
              if (tokenNum > tokenOrder) return true;
              
              // Show current token if user is within proximity
              if (tokenOrder === tokenNum) {
                const proximityRadius = 10; // meters
                const distance = getDistanceMeters(
                  location.coords.latitude,
                  location.coords.longitude,
                  token.location.x,
                  token.location.y
                );
                return distance <= proximityRadius;
              }
              
              return false;
            })
            .map((token) => {
              if (!token.location) return null;
              const visited = visitedLandmarks.has(`token_${token.id}` as any);
              const tokenOrder = token.tokenorder || 1;
              const isCollected = tokenNum > tokenOrder;
              const proximityRadius = 10; // meters

              return (
                <View key={`token_${token.id}`}>
                  <Marker
                    coordinate={{
                      latitude: token.location.x,
                      longitude: token.location.y,
                    }}
                    title={`Token ${tokenOrder}`}
                    description={
                      isCollected
                        ? "(Collected) Token found!" 
                        : token.hint || "Collect this token!"
                    }
                    pinColor={isCollected ? "green" : "blue"}
                  />
                </View>
              );
            })}
        </MapView>
      ) : (
        <View style={styles.message}>
          <Text style={styles.infoText}>
            Getting your location… make sure GPS is enabled.
          </Text>
        </View>
      )}

      {/* 🧷 Floating compressible hint tab */}
      <View style={styles.hintPanel}>
        <TouchableOpacity
          style={styles.landmarkPanelHeader}
          onPress={() => setHintExpanded((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Text style={styles.landmarkPanelTitle}>
            Current Token Hint
          </Text>
          <Text style={styles.landmarkPanelToggle}>
            {hintExpanded ? "▾" : "▴"}
          </Text>
        </TouchableOpacity>

        {hintExpanded && (
          <View style={styles.landmarkListWrapper}>
            <View style={styles.hintContent}>
              {(() => {
                const currentToken = adventureTokens.find(token => (token.tokenorder || 1) === tokenNum);
                if (currentToken && currentToken.hint) {
                  return (
                    <Text style={styles.hintText}>
                      {currentToken.hint}
                    </Text>
                  );
                } else {
                  return (
                    <Text style={styles.noHintText}>
                      No hint available for current token.
                    </Text>
                  );
                }
              })()} 
            </View>
          </View>
        )}
      </View>

      {/* 🧷 Floating compressible landmark tab */}
      <View style={styles.landmarkPanel}>
        <TouchableOpacity
          style={styles.landmarkPanelHeader}
          onPress={() => setLandmarksExpanded((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Text style={styles.landmarkPanelTitle}>
            Landmarks
          </Text>
          <Text style={styles.landmarkPanelToggle}>
            {landmarksExpanded ? "▾" : "▴"}
          </Text>
        </TouchableOpacity>

        {landmarksExpanded && (
          <View style={styles.landmarkListWrapper}>
            {/* Landmarks Section */}
            {adventureLandmarks.length > 0 && (
              <>
                <FlatList
                  data={adventureLandmarks}
                  keyExtractor={(item) => `landmark_${item.id}`}
                  renderItem={({ item }) => {
                    const visited = visitedLandmarks.has(item.id);
                    return (
                      <TouchableOpacity
                        style={styles.landmarkItem}
                        onPress={() => focusOnLandmark(item)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.landmarkName,
                            visited && styles.landmarkVisited,
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </>
            )}
          </View>
        )}
      </View>

      {/* Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🎉 Adventure Complete! 🎉</Text>
            <Text style={styles.modalMessage}>
              Congratulations! You've successfully completed the adventure "{currentAdventure?.name}" by collecting all {adventureTokens.length} tokens!
            </Text>
            {completionTimeFormatted && (
              <Text style={styles.completionTime}>
                Completion Time: {completionTimeFormatted}
              </Text>
            )}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.completionButton]}
                onPress={handleAdventureCompletion}
                disabled={isSaving}
              >
                <Text style={styles.modalButtonText}>
                  {isSaving ? 'Saving...' : 'Continue to Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    zIndex: 20,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  score: {
    color: "#facc15",
    fontSize: 18,
    fontWeight: "700",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#111827",
    zIndex: 19,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#1f2937",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "white",
    fontSize: 14,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  searchResults: {
    marginTop: 4,
    backgroundColor: "#1f2937",
    borderRadius: 8,
    maxHeight: 180,
    overflow: "hidden",
  },
  searchResultItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#374151",
  },
  searchResultText: {
    color: "white",
    fontSize: 13,
  },
  map: {
    flex: 1,
  },
  message: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  errorText: {
    color: "#f87171",
    fontSize: 16,
    textAlign: "center",
  },
  infoText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },

  // Floating landmark panel
  landmarkPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 60, // Position below header
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(17,24,39,0.95)",
    overflow: "hidden",
    zIndex: 30,
  },
  
  // Floating hint panel  
  hintPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20, // Position at bottom of screen
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(17,24,39,0.95)",
    overflow: "hidden",
    zIndex: 30,
  },
  landmarkPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  landmarkPanelTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  landmarkPanelToggle: {
    color: "#9ca3af",
    fontSize: 18,
    marginLeft: 8,
  },
  landmarkListWrapper: {
    maxHeight: 220,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#374151",
  },
  landmarkItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#374151",
  },
  landmarkName: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  landmarkVisited: {
    color: "#22c55e",
  },
  landmarkDesc: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    color: "#facc15",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#1f2937",
  },
  hintContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  hintText: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
  },
  noHintText: {
    color: "#9ca3af",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    marginHorizontal: 20,
    minWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
    marginBottom: 30,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  completionButton: {
    backgroundColor: "#22c55e",
  },
  completionTime: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#22c55e",
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
