import BackButton from "@/components/reusable/BackButton";
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

import { useHome } from "../../contexts/HomeContext";
//TODO: name the databaase properly, Jacob

// Define adventure type
interface Adventure {
  id: string | number;
  name: string;
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
  const { data } = useHome();
  const { adventureId } = useLocalSearchParams();

  // State for adventure data
  const [adventure, setAdventure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Fetch adventure data from database
  // ============================================================================
  const fetchAdventureData = async () => {
    try {
      setLoading(true);
      setError(null);

      // ============================================================================
      // TODO: Replace with actual Azure API call to PostgreSQL backend
      // ============================================================================
      // Expected API endpoint: GET https://your-app.azurewebsites.net/api/adventures/{adventureId}
      // Expected PostgreSQL query:
      // SELECT
      //   a.id,
      //   a.title,
      //   a.description,
      //   a.image_url,
      //   a.difficulty,
      //   a.estimated_time,
      //   COUNT(t.id) as token_count,
      //   COALESCE(ua.completed, false) as is_completed,
      //   COALESCE(ua.unlocked, true) as is_unlocked
      // FROM adventures a
      // LEFT JOIN tokens t ON t.adventure_id = a.id
      // LEFT JOIN user_adventures ua ON ua.adventure_id = a.id AND ua.user_id = $1
      // WHERE a.id = $2
      // GROUP BY a.id, ua.completed, ua.unlocked;
      //
      // Implementation example:
      // const response = await fetch(
      //   `https://your-app.azurewebsites.net/api/adventures/${adventureId}`,
      //   { headers: { 'Authorization': `Bearer ${authToken}` } }
      // );
      // const data = await response.json();
      // setAdventure(data);
      // setLoading(false);
      // ============================================================================

      // MOCK DATA - matching the adventures from home.tsx

      // const currentId = Array.isArray(adventureId)
      //   ? adventureId[0]
      //   : adventureId || "1";
      const foundAdventure = data.find(
        (adv) => adv.adventurerid === Number(adventureId)
      );

      if (!foundAdventure) {
        setError("Adventure not found");
        setLoading(false);
        return;
      }

      const mockAdventure = {
        ...foundAdventure,
        image:
          "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Adventure+Image",
      };

      // Simulate network delay

      setAdventure(mockAdventure);
      setLoading(false);
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
    console.log(`Starting adventure: ${adventure?.name}`);
    // TODO: Navigate to adventure gameplay
    // router.push(`/adventure/${adventure.id}/play`);
  };

  const handleBackPress = () => {
    router.replace("/home");
  };

  // Loading state
  if (loading) {
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
          <Text style={styles.title}>{adventure.name}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>Difficulty: Easy</Text>
            <Text style={styles.metaText}>Time: 60s</Text>
            <Text style={styles.metaText}>Rewards: None</Text>
          </View>
        </View>

        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: adventure.image }}
            style={styles.adventureImage}
            resizeMode="cover"
          />
        </View>

        {/* Description Section */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About this Adventure</Text>
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
