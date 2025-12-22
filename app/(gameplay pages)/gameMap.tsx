import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Circle, Marker, Region } from "react-native-maps";

import { useAuth } from "../../contexts/AuthContext";
import { useDatabase } from "../../contexts/DatabaseContext";
import { Adventure, Landmark, Token } from "../../types/database";

type GeocodeResult = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

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
  const { adventureId } = useLocalSearchParams<{ adventureId: string }>();
  const {
    fetchAdventures,
    fetchTokens,
    fetchLandmarks,
    getTokensByAdventure,
    getLandmarksByRegion,
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

  const [score, setScore] = useState<number>(0);
  const [visitedLandmarks, setVisitedLandmarks] = useState<Set<number>>(
    () => new Set()
  );

  // Search any location state
  const [searchQuery, setSearchQuery] = useState("");
  const [geoResults, setGeoResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Floating landmark panel
  const [landmarksExpanded, setLandmarksExpanded] = useState(false);

  // ✅ map center/region (this is what updates when you move the map)
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const mapRef = useRef<MapView | null>(null);

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
  }, [adventureId]);

  // Define proximity check function for both landmarks and tokens
  const checkProximity = useCallback((loc: Location.LocationObject) => {
    const { latitude, longitude } = loc.coords;
    const proximityRadius = 50; // meters

    // Check landmarks
    adventureLandmarks.forEach((landmark) => {
      if (!landmark.location) return;
      if (visitedLandmarks.has(landmark.id)) return;

      const distance = getDistanceMeters(
        latitude,
        longitude,
        landmark.location.x,
        landmark.location.y
      );

      if (distance <= proximityRadius) {
        setVisitedLandmarks((prev) => {
          const updated = new Set(prev);
          updated.add(landmark.id);
          return updated;
        });

        setScore((prev) => prev + 10); // Default 10 points for landmarks

        Alert.alert(
          "Landmark discovered!",
          `You found ${landmark.name} and earned 10 points!`
        );
      }
    });

    // Check tokens
    adventureTokens.forEach((token) => {
      if (!token.location) return;
      if (visitedLandmarks.has(`token_${token.id}` as any)) return;

      const distance = getDistanceMeters(
        latitude,
        longitude,
        token.location.x,
        token.location.y
      );

      if (distance <= proximityRadius) {
        setVisitedLandmarks((prev) => {
          const updated = new Set(prev);
          updated.add(`token_${token.id}` as any);
          return updated;
        });

        setScore((prev) => prev + 25); // 25 points for tokens

        Alert.alert(
          "Token collected!",
          `You collected a token and earned 25 points!${token.hint ? ` Hint: ${token.hint}` : ''}`
        );
      }
    });
  }, [adventureLandmarks, adventureTokens, visitedLandmarks]);

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
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);

      // set initial map center to user's location
      setMapRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 1,
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

  // 🔎 Search any location using OpenStreetMap Nominatim
  // const searchAnyLocation = async () => {
  //   const q = searchQuery.trim();
  //   if (!q) {
  //     setGeoResults([]);
  //     return;
  //   }

  //   setIsSearching(true);
  //   try {
  //     const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
  //       q
  //     )}&format=json&limit=5`;

  //     const response = await fetch(url, {
  //       headers: {
  //         // Nominatim asks for an identifying header; replace with your app/email in real use
  //         "User-Agent": "CalvinLandmarkApp/1.0 (your-email@calvin.edu)",
  //       },
  //     });

  //     const data = await response.json();
  //     const mapped: GeocodeResult[] = data.map((item: any) => ({
  //       id: item.place_id.toString(),
  //       name: item.display_name,
  //       lat: parseFloat(item.lat),
  //       lon: parseFloat(item.lon),
  //     }));

  //     setGeoResults(mapped);

  //     if (mapped.length === 0) {
  //       Alert.alert(
  //         "No results",
  //         "Could not find any locations for that search."
  //       );
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     Alert.alert(
  //       "Search error",
  //       "Something went wrong while searching for that location."
  //     );
  //   } finally {
  //     setIsSearching(false);
  //   }
  // };

  // const focusOnGeocodeResult = (place: GeocodeResult) => {
  //   const region: Region = {
  //     latitude: place.lat,
  //     longitude: place.lon,
  //     latitudeDelta: 0.01,
  //     longitudeDelta: 0.01,
  //   };

  //   setMapRegion(region); // 👈 update map center
  //   mapRef.current?.animateToRegion(region, 800);

  //   setGeoResults([]);
  //   setSearchQuery(place.name);
  // };

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

  // const handleSearchClear = () => {
  //   setSearchQuery("");
  //   setGeoResults([]);
  // };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {loading.adventures || loading.landmarks || loading.tokens
            ? "Loading..."
            : currentAdventure
            ? currentAdventure.name
            : "Adventure"}
        </Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      {/* Search bar for ANY location */}
      {/* <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search any location..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            onSubmitEditing={searchAnyLocation}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchAnyLocation}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View> */}

        {/* Geocoding search results */}
        {/* {geoResults.length > 0 && (
          <View style={styles.searchResults}>
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={geoResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResultItem}
                  onPress={() => {
                    focusOnGeocodeResult(item);
                    handleSearchClear();
                  }}
                >
                  <Text style={styles.searchResultText} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View> */}

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
            const visited = visitedLandmarks.has(lm.id);
            const proximityRadius = 50; // meters

            return (
              <View key={`landmark_${lm.id}`}>
                <Marker
                  coordinate={{
                    latitude: lm.location.x,
                    longitude: lm.location.y,
                  }}
                  title={lm.name}
                  description={visited ? "(Visited) Landmark discovered!" : "Landmark"}
                  pinColor={visited ? "green" : "blue"}
                />
                <Circle
                  center={{
                    latitude: lm.location.x,
                    longitude: lm.location.y,
                  }}
                  radius={proximityRadius}
                  strokeWidth={1}
                  strokeColor="rgba(0, 150, 255, 0.8)"
                  fillColor="rgba(0, 150, 255, 0.15)"
                />
              </View>
            );
          })}
          
          {/* Tokens */}
          {adventureTokens.map((token) => {
            if (!token.location) return null;
            const visited = visitedLandmarks.has(`token_${token.id}` as any);
            const proximityRadius = 50; // meters

            return (
              <View key={`token_${token.id}`}>
                <Marker
                  coordinate={{
                    latitude: token.location.x,
                    longitude: token.location.y,
                  }}
                  title={`Token ${token.tokenorder || token.id}`}
                  description={
                    visited 
                      ? "(Collected) Token found!" 
                      : token.hint || "Collect this token!"
                  }
                  pinColor={visited ? "green" : "red"}
                />
                <Circle
                  center={{
                    latitude: token.location.x,
                    longitude: token.location.y,
                  }}
                  radius={proximityRadius}
                  strokeWidth={1}
                  strokeColor="rgba(255, 0, 0, 0.8)"
                  fillColor="rgba(255, 0, 0, 0.15)"
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

      {/* 🧷 Floating compressible landmark tab */}
      <View style={styles.landmarkPanel}>
        <TouchableOpacity
          style={styles.landmarkPanelHeader}
          onPress={() => setLandmarksExpanded((prev) => !prev)}
          activeOpacity={0.8}
        >
          <Text style={styles.landmarkPanelTitle}>
            Landmarks ({adventureLandmarks.length}) | Tokens ({adventureTokens.length})
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
                <Text style={styles.sectionHeader}>Landmarks</Text>
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
            
            {/* Tokens Section */}
            {adventureTokens.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Tokens</Text>
                <FlatList
                  data={adventureTokens}
                  keyExtractor={(item) => `token_${item.id}`}
                  renderItem={({ item }) => {
                    const visited = visitedLandmarks.has(`token_${item.id}` as any);
                    return (
                      <TouchableOpacity
                        style={styles.landmarkItem}
                        onPress={() => focusOnToken(item)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.landmarkName,
                            visited && styles.landmarkVisited,
                          ]}
                          numberOfLines={1}
                        >
                          Token {item.tokenorder || item.id}
                        </Text>
                        {item.hint && (
                          <Text style={styles.landmarkDesc} numberOfLines={1}>
                            Hint: {item.hint}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </>
            )}
          </View>
        )}
      </View>
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
    bottom: 20,
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
});
