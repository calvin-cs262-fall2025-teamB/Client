import BackButton from "@/components/reusable/BackButton";
import { Adventure as DbAdventure, FrontendAdventure } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useDatabase } from "../../contexts/DatabaseContext";

export default function AdventurePageTemplate() {
  const router = useRouter();
  const { adventureId } = useLocalSearchParams();

  // Use DatabaseContext
  const { adventures, tokens, loading, errors, fetchAdventures, fetchTokens } = useDatabase();
  const { user } = useAuth();
  
  // State for current adventure
  const [adventure, setAdventure] = useState<FrontendAdventure | null>(null);
  const [adventureTokens, setAdventureTokens] = useState<any[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Transform database adventure to FrontendAdventure format
  const transformAdventureToFrontend = (dbAdventure: DbAdventure, regionsData: any[]): FrontendAdventure => {
    const dbAny = dbAdventure as any;
    
    // Handle different field naming conventions
    const adventureId = dbAdventure.ID || dbAny.id;
    const regionId = dbAdventure.regionID || dbAny.regionid || dbAny.regionID;
    const adventureName = dbAdventure.name || dbAny.adventurename || dbAny.adventure_name || dbAny.Name;
    const numTokens = dbAdventure.numTokens || dbAny.numtokens || dbAny.num_tokens;
    
    const region = regionsData.find((r: any) => r.id === regionId || r.ID === regionId);
    
    return {
      id: (adventureId && adventureId.toString()) || `adventure-${Date.now()}`,
      title: adventureName || 'Unnamed Adventure',
      summary: adventureName || 'No description available',
      description: adventureName || 'No description available',
      image_url: "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Adventure+Image",
      region: {
        id: regionId?.toString() || '1',
        name: region?.name || `Region ${regionId || 1}`,
        center: {
          lat: region?.location?.x || dbAdventure.location?.x || 42.9301,
          lng: region?.location?.y || dbAdventure.location?.y || -85.5883,
        },
      },
      tokenCount: numTokens || 0,
    };
  };

  // Load adventure data from DatabaseContext
  useEffect(() => {
    if (adventures.length === 0) {
      fetchAdventures();
    }
  }, [adventures.length, fetchAdventures]);

  // Get regions data
  const { regions: regionsData, fetchRegions } = useDatabase();

  // Load regions on component mount
  useEffect(() => {
    if (regionsData.length === 0) {
      fetchRegions();
    }
  }, [regionsData.length, fetchRegions]);

  // Find current adventure when data is loaded
  useEffect(() => {
    if (adventures.length > 0 && adventureId && !adventure) {
      const currentId = Array.isArray(adventureId) ? adventureId[0] : adventureId;
      
      // Debug logging
      // console.log('Adventure Page Debug:');
      // console.log('- Looking for adventure ID:', currentId);
      // console.log('- Available adventures:', adventures.length);
      // console.log('- Sample adventure IDs:', adventures.slice(0, 3).map((adv: any) => ({ 
      //   ID: adv.ID, 
      //   id: adv.id,
      //   name: adv.name 
      // })));
      
      const foundDbAdventure = adventures.find((adv: DbAdventure) => {
        const advAny = adv as any;
        const advId = adv.ID || advAny.id;
        const idMatch = advId && (advId.toString() === currentId || advId === parseInt(currentId));
        
        if (idMatch) {
          console.log('Found matching adventure:', { ID: advId, name: adv.name });
        }
        
        return idMatch;
      });
      
      if (foundDbAdventure) {
        console.log('Successfully found adventure:', foundDbAdventure.name);
        const transformedAdventure = transformAdventureToFrontend(foundDbAdventure, regionsData || []);
        setAdventure(transformedAdventure);
        setIsInitializing(false);
        // Fetch tokens for this adventure
        const adventureIdForTokens = foundDbAdventure.ID || (foundDbAdventure as any).id;
        if (adventureIdForTokens) {
          fetchTokens(adventureIdForTokens);
        }
      } else {
        console.log('Adventure not found. Available IDs:', adventures.map((adv: any) => adv.ID || adv.id));
        setLocalError(`Adventure not found (ID: ${currentId})`);
        setIsInitializing(false);
      }
    } else if (adventures.length > 0 && adventureId) {
      setIsInitializing(false);
    }
  }, [adventures, regionsData, adventureId, fetchTokens, adventure]);

  // Update adventure tokens when tokens are loaded
  useEffect(() => {
    if (adventure && tokens.length > 0) {
      const adventureSpecificTokens = tokens.filter(
        (token: any) => token.adventureId && token.adventureId.toString() === adventure.id
      );
      setAdventureTokens(adventureSpecificTokens);
    }
  }, [tokens, adventure]);

  const handlePlayPress = () => {
    if (adventure) {
      console.log(`Starting adventure: ${adventure.title}`);
      // TODO: Navigate to adventure gameplay
      // router.push(`/adventure/${adventure.id}/play`);
    }
  };

  const handleBackPress = () => {
    router.replace("/home");
  };

  // Loading state
  if (loading.adventures || isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingTopRow}>
          <BackButton onPress={handleBackPress} />
        </View>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading adventure...</Text>
      </View>
    );
  }

  // Error state
  if (errors.adventures || localError || (!loading.adventures && !isInitializing && !adventure)) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{localError || errors.adventures || "Adventure not found"}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Final safety check - this shouldn't happen due to loading/error conditions above
  if (!adventure) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Adventure Content Container */}
      <View style={styles.contentContainer}>
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{adventure.title}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>Region: {adventure.region.name}</Text>
            <Text style={styles.metaText}>Tokens: {adventure.tokenCount}</Text>
          </View>
        </View>

        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: adventure.image_url || "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Adventure+Image" }}
            style={styles.adventureImage}
            resizeMode="cover"
          />
        </View>

        {/* Description Section */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About this Adventure</Text>
          <Text style={styles.description}>{adventure.description}</Text>
        </View>

        {/* Play Button Section */}
        <View style={styles.playButtonContainer}>
          <TouchableOpacity
            style={[styles.playButton, styles.playButtonDisabled]}
            onPress={handlePlayPress}
          >
            <Text
              style={[styles.playButtonText, styles.playButtonTextDisabled]}
            >
              Start Adventure
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  adventureImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#e0e0e0",
  },
  backButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  completedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#34C759",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  completedBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  description: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  descriptionContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    position: "relative",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  loadingTopRow: {
    position: "absolute",
    top: 48,
    left: 12,
    zIndex: 10,
  },
  metaInfo: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    textAlign: "center",
  },
  playButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  playButtonContainer: {
    marginBottom: 20,
  },
  playButtonDisabled: {
    backgroundColor: "#ccc",
  },
  playButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  playButtonTextDisabled: {
    color: "#999",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  titleContainer: {
    marginBottom: 20,
  },
});
