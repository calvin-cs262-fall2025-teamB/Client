import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Circle, Region } from "react-native-maps";
import * as Location from "expo-location";

import { useAuth } from "../../contexts/AuthContext";

type Point = {
  latitude: number;
  longitude: number;
};

type Landmark = {
  id: number;
  regionID: number;
  name: string;
  description?: string | null;
  location?: Point | null;
  radius: number; // meters
  points: number;
};

type GeocodeResult = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

// Calvin landmarks (example)
const LANDMARKS: Landmark[] = [
  {
    id: 1,
    regionID: 5,
    name: "Commons Lawn",
    description: "The heart of campus life at Calvin.",
    location: { latitude: 42.93237, longitude: -85.58149 },
    radius: 60,
    points: 10,
  },
  {
    id: 2,
    regionID: 5,
    name: "Hekman Library",
    description: "Study spot and home to the Meeter Center.",
    location: { latitude: 42.92985, longitude: -85.58743 },
    radius: 50,
    points: 15,
  },
  {
    id: 3,
    regionID: 5,
    name: "Spoelhof Fieldhouse Complex",
    description: "Home of the Knights and the fieldhouse facilities.",
    location: { latitude: 42.93334, longitude: -85.58952 },
    radius: 70,
    points: 20,
  },
];

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
  const { user } = useAuth(); // not used yet, but available

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Define proximity check function before useEffect
  const checkLandmarkProximity = useCallback((loc: Location.LocationObject) => {
    const { latitude, longitude } = loc.coords;

    LANDMARKS.forEach((landmark) => {
      if (!landmark.location) return;
      if (visitedLandmarks.has(landmark.id)) return;

      const distance = getDistanceMeters(
        latitude,
        longitude,
        landmark.location.latitude,
        landmark.location.longitude
      );

      if (distance <= landmark.radius) {
        setVisitedLandmarks((prev) => {
          const updated = new Set(prev);
          updated.add(landmark.id);
          return updated;
        });

        setScore((prev) => prev + landmark.points);

        Alert.alert(
          "Landmark found!",
          `You discovered ${landmark.name} and earned ${landmark.points} points!`
        );
      }
    });
  }, [visitedLandmarks]);

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

          checkLandmarkProximity(loc);
        }
      );

      locationSubscription.current = subscription;
    })();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [checkLandmarkProximity]);

  // 🔎 Search any location using OpenStreetMap Nominatim
  const searchAnyLocation = async () => {
    const q = searchQuery.trim();
    if (!q) {
      setGeoResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&format=json&limit=5`;

      const response = await fetch(url, {
        headers: {
          // Nominatim asks for an identifying header; replace with your app/email in real use
          "User-Agent": "CalvinLandmarkApp/1.0 (your-email@calvin.edu)",
        },
      });

      const data = await response.json();
      const mapped: GeocodeResult[] = data.map((item: any) => ({
        id: item.place_id.toString(),
        name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));

      setGeoResults(mapped);

      if (mapped.length === 0) {
        Alert.alert(
          "No results",
          "Could not find any locations for that search."
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Search error",
        "Something went wrong while searching for that location."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const focusOnGeocodeResult = (place: GeocodeResult) => {
    const region: Region = {
      latitude: place.lat,
      longitude: place.lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setMapRegion(region); // 👈 update map center
    mapRef.current?.animateToRegion(region, 800);

    setGeoResults([]);
    setSearchQuery(place.name);
  };

  const focusOnLandmark = (lm: Landmark) => {
    if (!lm.location) return;

    const region: Region = {
      latitude: lm.location.latitude,
      longitude: lm.location.longitude,
      latitudeDelta: 0.004,
      longitudeDelta: 0.004,
    };

    setMapRegion(region); // 👈 update map center
    mapRef.current?.animateToRegion(region, 800);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setGeoResults([]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Landmark Hunt</Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      {/* Search bar for ANY location */}
      <View style={styles.searchContainer}>
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
        </View>

        {/* Geocoding search results */}
        {geoResults.length > 0 && (
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
          {LANDMARKS.map((lm) => {
            if (!lm.location) return null;
            const visited = visitedLandmarks.has(lm.id);

            return (
              <View key={lm.id}>
                <Marker
                  coordinate={{
                    latitude: lm.location.latitude,
                    longitude: lm.location.longitude,
                  }}
                  title={lm.name}
                  description={
                    (visited ? "(Visited) " : "") + (lm.description ?? "")
                  }
                  pinColor={visited ? "green" : "red"}
                />
                <Circle
                  center={{
                    latitude: lm.location.latitude,
                    longitude: lm.location.longitude,
                  }}
                  radius={lm.radius}
                  strokeWidth={1}
                  strokeColor="rgba(0, 150, 255, 0.8)"
                  fillColor="rgba(0, 150, 255, 0.15)"
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
            Landmarks ({LANDMARKS.length})
          </Text>
          <Text style={styles.landmarkPanelToggle}>
            {landmarksExpanded ? "▾" : "▴"}
          </Text>
        </TouchableOpacity>

        {landmarksExpanded && (
          <View style={styles.landmarkListWrapper}>
            <FlatList
              data={LANDMARKS}
              keyExtractor={(item) => item.id.toString()}
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
                    {item.description ? (
                      <Text style={styles.landmarkDesc} numberOfLines={1}>
                        {item.description}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
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
    paddingTop: 50,
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
});
