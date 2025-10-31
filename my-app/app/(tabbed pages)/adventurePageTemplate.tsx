import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";

// Define adventure type
interface Adventure {
  id: string | number;
  title: string;
  description: string;
  image: string;
  difficulty: string;
  estimatedTime: string;
  rewards: string;
  isCompleted: boolean;
  isUnlocked: boolean;
}

export default function AdventurePageTemplate() {
  const router = useRouter();
  const { adventureId } = useLocalSearchParams();

  // State for adventure data
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch adventure data from database
  const fetchAdventureData = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/adventures/${adventureId}`);
      // const data = await response.json();

      // Mock data for now - replace with actual database call
      let mockAdventure: Adventure = {
        id: Array.isArray(adventureId) ? adventureId[0] : adventureId || "1",
        title: "Downtown Explorer Adventure",
        description:
          "Discover the hidden gems of downtown! This adventure will take you through historic buildings, local cafes, and secret spots that only locals know about. Complete challenges, collect tokens, and learn about the rich history of our city center.",
        image:
          "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Adventure+Image",
        difficulty: "Easy",
        estimatedTime: "45-60 minutes",
        rewards: "50 tokens",
        isCompleted: false,
        isUnlocked: true,
      };

      // Simulate network delay
      setTimeout(() => {
        setAdventure(mockAdventure);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching adventure:", err);
      setError("Failed to load adventure data");
      setLoading(false);
    }
  };

  // Load adventure data on component mount
  useEffect(() => {
    fetchAdventureData();
  }, [adventureId]);

  const handlePlayPress = () => {
    if (!adventure?.isUnlocked) {
      console.log("Adventure is locked");
      return;
    }

    console.log(`Starting adventure: ${adventure.title}`);
    // TODO: Navigate to adventure gameplay
    // router.push(`/adventure/${adventure.id}/play`);
  };

  const handleBackPress = () => {
    router.back();
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading adventure...</Text>
      </View>
    );
  }

  // Error state
  if (error || !adventure) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || "Adventure not found"}</Text>
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
          <Text style={styles.title}>{adventure.title}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              Difficulty: {adventure.difficulty}
            </Text>
            <Text style={styles.metaText}>Time: {adventure.estimatedTime}</Text>
            <Text style={styles.metaText}>Rewards: {adventure.rewards}</Text>
          </View>
        </View>

        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: adventure.image }}
            style={styles.adventureImage}
            resizeMode="cover"
          />
          {adventure.isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✓ Completed</Text>
            </View>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About this Adventure</Text>
          <Text style={styles.description}>{adventure.description}</Text>
        </View>

        {/* Play Button Section */}
        <View style={styles.playButtonContainer}>
          <TouchableOpacity
            style={[
              styles.playButton,
              !adventure.isUnlocked && styles.playButtonDisabled,
            ]}
            onPress={handlePlayPress}
            disabled={!adventure.isUnlocked}
          >
            <Text
              style={[
                styles.playButtonText,
                !adventure.isUnlocked && styles.playButtonTextDisabled,
              ]}
            >
              {adventure.isCompleted
                ? "Play Again"
                : adventure.isUnlocked
                ? "Start Adventure"
                : "Locked"}
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
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
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
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
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
  adventureImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#e0e0e0",
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
  description: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  playButtonContainer: {
    marginBottom: 20,
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
});
