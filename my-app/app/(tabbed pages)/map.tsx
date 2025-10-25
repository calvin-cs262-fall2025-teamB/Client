import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Alert, Vibration } from "react-native";
import MapView, { Marker, LatLng, MapPressEvent, UrlTile, Circle } from "react-native-maps";
import * as Location from "expo-location";

// 1. Update Token interface to include 'hasVibrated'
interface Token {
  id: number;
  coord: LatLng;
  name: string;
  isVisible: boolean;
  hasVibrated: boolean; 
}

interface AdventureRegion {
  center: LatLng;
  radius: number;
}

// 2. Update the fake API to include 'hasVibrated: false'
const fetchAdventureData = (adventureId: string): Promise<{ region: AdventureRegion; tokens: Token[] }> => {
  console.log(`Fetching data for adventure: ${adventureId}...`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = {
        region: {
          center: { latitude: 42.9634, longitude: -85.6681 },
          radius: 500, // meters
        },
        tokens: [
          { id: 1001, name: "The Hidden Fountain", coord: { latitude: 42.9635, longitude: -85.6682 }, isVisible: false, hasVibrated: false },
          { id: 1002, name: "Old Oak Tree", coord: { latitude: 42.9630, longitude: -85.6675 }, isVisible: false, hasVibrated: false },
          { id: 1003, name: "River's Edge Cache", coord: { latitude: 42.9640, longitude: -85.6690 }, isVisible: false, hasVibrated: false },
        ],
      };
      resolve(data);
    }, 1500); 
  });
};


export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [adventureRegion, setAdventureRegion] = useState<AdventureRegion | null>(null);

  // --- Fetches the user's location ---
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        setIsLoadingLocation(false);
        return;
      }

      let current = await Location.getCurrentPositionAsync({});
      setLocation(current);
      setIsLoadingLocation(false); 

      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 1 },
        (pos) => {
          setLocation(pos);
          setTokens(currentTokens => checkProximity(pos.coords, currentTokens));
        }
      );
      return () => subscription.remove();
    })();
  }, []);

  // --- Fetches the adventure data ---
  useEffect(() => {
    const currentAdventureId = "adv_123"; 

    fetchAdventureData(currentAdventureId)
      .then(data => {
        setAdventureRegion(data.region);
        setTokens(data.tokens);
      })
      .catch(err => {
        console.error(err);
        Alert.alert("Error", "Could not load adventure data.");
      })
      .finally(() => {
        setIsLoadingData(false); 
      });
  }, []); 

  
  // 3. --- Updated handleMapPress to ask for visibility ---
  const handleMapPress = (event: MapPressEvent) => {
    const newCoord = event.nativeEvent.coordinate;

    // First, ask for the name
    Alert.prompt("Add Custom Token", "Enter a name:", (tokenName) => {
      if (!tokenName) return; // User cancelled name

      // Next, ask for visibility
      Alert.alert(
        "Set Visibility",
        "Should this token be visible immediately?",
        [
          {
            text: "Visible",
            onPress: () => createToken(tokenName, newCoord, true)
          },
          {
            text: "Hidden",
            onPress: () => createToken(tokenName, newCoord, false)
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    });
  };

  // 4. --- Helper function to create the new token ---
  const createToken = (name: string, coord: LatLng, isVisible: boolean) => {
    
    // --- TODO: This should be an API call to save the token ---
    Alert.alert("TODO", "This would save the token to your database.");

    const tempToken: Token = {
      id: Date.now(),
      coord: coord,
      name: name,
      isVisible: isVisible,   // Use the user's choice
      hasVibrated: false,   // Always start as 'false'
    };
    setTokens((prev) => [...prev, tempToken]);
  };

  // --- handleMarkerPress (sends a DELETE request) ---
  const handleMarkerPress = (token: Token) => {
    Alert.alert(
      `Remove ${token.name}`,
      "Are you sure you want to remove this token?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // --- TODO: Send DELETE request to your API ---
            Alert.alert("TODO", `This would delete token ${token.id} from your database.`);
            removeToken(token.id); 
          },
        },
      ]
    );
  };

  const removeToken = (idToRemove: number) => {
    setTokens((prev) => prev.filter((token) => token.id !== idToRemove));
  };
  
  // 5. --- Updated checkProximity logic ---
  const checkProximity = (userCoords: Location.LocationObjectCoords, currentTokens: Token[]): Token[] => {
    let tokenFound = false;
    const updatedTokens = currentTokens.map(token => {
      
      const distance = getDistance(userCoords, token.coord);

      // Check if user is close AND it hasn't vibrated before
      if (distance < 20 && !token.hasVibrated) {
        tokenFound = true;
        Vibration.vibrate(100); // Vibrate!
        
        // Show a different alert if it was hidden vs. already visible
        if (!token.isVisible) {
          Alert.alert("Token Found!", `You discovered ${token.name}!`);
        } else {
          Alert.alert("Token Nearby!", `You're close to ${token.name}!`);
        }
        
        // Return new token state:
        // It's now permanently visible and marked as vibrated
        return { ...token, isVisible: true, hasVibrated: true };
      }
      
      // Otherwise, return the token unchanged
      return token;
    });
    
    return tokenFound ? updatedTokens : currentTokens;
  };

  // --- getDistance (no change) ---
  const getDistance = (a: Location.LocationObjectCoords, b: LatLng) => {
    const R = 6371e3;
    const φ1 = (a.latitude * Math.PI) / 180;
    const φ2 = (b.latitude * Math.PI) / 180;
    const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
    const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
    const sinΔφ = Math.sin(Δφ / 2);
    const sinΔλ = Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(sinΔφ * sinΔφ + Math.cos(φ1) * Math.cos(φ2) * sinΔλ * sinΔλ), Math.sqrt(1 - (sinΔφ * sinΔφ + Math.cos(φ1) * Math.cos(φ2) * sinΔλ * sinΔλ)));
    return R * c;
  };
  
  // --- Loading check (no change) ---
  if (isLoadingLocation || isLoadingData || !location || !adventureRegion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // --- MapView (no change) ---
  return (
    <MapView
      style={styles.map}
      showsUserLocation={true}
      followsUserLocation={true}
      onPress={handleMapPress}
      initialRegion={{
        latitude: adventureRegion.center.latitude,
        longitude: adventureRegion.center.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <UrlTile
        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
      />
      
      <Circle
        center={adventureRegion.center}
        radius={adventureRegion.radius}
        strokeWidth={2}
        strokeColor="rgba(0, 122, 255, 0.5)" 
        fillColor="rgba(0, 122, 255, 0.1)"
      />

      {/* This filter is still correct. It will render tokens that
        are user-set to 'isVisible: true' AND tokens that
        have been discovered (which sets isVisible: true).
      */}
      {tokens.filter(token => token.isVisible).map((token) => (
        <Marker
          key={token.id}
          coordinate={token.coord}
          title={token.name}
          pinColor="orange"
          onPress={() => handleMarkerPress(token)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
