import BackButton from "@/components/reusable/BackButton";
import { Adventure as DbAdventure } from "@/types";
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
  const [adventure, setAdventure] = useState<DbAdventure | null>(null);
  const [adventureTokens, setAdventureTokens] = useState<any[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  // Transform database adventure to display format
  const transformAdventureForDisplay = (dbAdventure: DbAdventure) => {
    return {
      id: dbAdventure.id,
      name: dbAdventure.name || 'Unnamed Adventure',
      description: dbAdventure.name || 'No description available',
      image: "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Adventure+Image",
      difficulty: 'Medium',
      estimatedTime: '30 min',
      rewards: `${dbAdventure.numTokens || 0} tokens`,
      isCompleted: false, // TODO: Check against CompletedAdventure table using user.id
      isUnlocked: true, // TODO: Check unlock requirements
    };
  };

  // Load adventure data from DatabaseContext
  useEffect(() => {
    if (adventures.length === 0) {
      fetchAdventures();
    }
  }, [adventures.length, fetchAdventures]);

  // Find current adventure when data is loaded
  useEffect(() => {
    if (adventures.length > 0 && adventureId) {
      const currentId = Array.isArray(adventureId) ? adventureId[0] : adventureId;
      const foundAdventure = adventures.find(
        (adv: DbAdventure) => adv.id.toString() === currentId.toString()
      );
      
      if (foundAdventure) {
        setAdventure(foundAdventure);
        // Fetch tokens for this adventure
        fetchTokens(foundAdventure.id);
      } else {
        setLocalError('Adventure not found');
      }
    }
  }, [adventures, adventureId, fetchTokens]);

  // Update adventure tokens when tokens are loaded
  useEffect(() => {
    if (adventure && tokens.length > 0) {
      const adventureSpecificTokens = tokens.filter(
        (token: any) => token.adventureId === adventure.id
      );
      setAdventureTokens(adventureSpecificTokens);
    }
  }, [tokens, adventure]);

  const handlePlayPress = () => {
    if (displayAdventure) {
      console.log(`Starting adventure: ${displayAdventure.name}`);
      // TODO: Navigate to adventure gameplay
      // router.push(`/adventure/${displayAdventure.id}/play`);
    }
  };

  const handleBackPress = () => {
    router.replace("/home");
  };

  // Transform current adventure for display
  const displayAdventure = adventure ? transformAdventureForDisplay(adventure) : null;

  // Loading state
  if (loading.adventures || loading.tokens || !displayAdventure) {
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
  if (errors.adventures || localError || !displayAdventure) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{localError || errors.adventures || "Adventure not found"}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Adventure Content Container */}
      <View style={styles.contentContainer}>
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{displayAdventure.name}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>Difficulty: {displayAdventure.difficulty}</Text>
            <Text style={styles.metaText}>Time: {displayAdventure.estimatedTime}</Text>
            <Text style={styles.metaText}>Rewards: {displayAdventure.rewards}</Text>
            <Text style={styles.metaText}>Tokens: {adventureTokens.length} available</Text>
          </View>
        </View>

        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: displayAdventure.image }}
            style={styles.adventureImage}
            resizeMode="cover"
          />
        </View>

        {/* Description Section */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About this Adventure</Text>
          <Text style={styles.description}>{displayAdventure.description}</Text>
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
