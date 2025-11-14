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
      const MOCK_ADVENTURES = [
        {
          id: "1",
          title: "Campus History Tour",
          description:
            "Discover the rich history of Calvin University through iconic landmarks. This guided tour will take you through historic buildings, memorable locations, and hidden gems that tell the story of our campus. Learn about the university's founding, significant events, and the people who shaped this institution.",
          difficulty: "Easy",
          estimatedTime: "30 min",
          rewards: "5 tokens",
          isCompleted: false,
          isUnlocked: true,
        },
        {
          id: "2",
          title: "Hidden Art Walk",
          description:
            "Find secret art installations scattered across campus. This artistic adventure will guide you to discover beautiful murals, sculptures, and installations that many students walk past every day. Each piece has a story - learn about the artists, the inspiration, and the meaning behind these creative works.",
          difficulty: "Medium",
          estimatedTime: "60 min",
          rewards: "8 tokens",
          isCompleted: false,
          isUnlocked: true,
        },
        {
          id: "3",
          title: "Science Building Quest",
          description:
            "Explore the wonders of our science facilities and discover the cutting-edge research happening on campus. Visit laboratories, planetariums, and experimental spaces while learning about groundbreaking discoveries made right here at Calvin. Perfect for curious minds who want to see science in action.",
          difficulty: "Medium",
          estimatedTime: "45 min",
          rewards: "6 tokens",
          isCompleted: false,
          isUnlocked: true,
        },
        {
          id: "4",
          title: "Athletic Heritage Trail",
          description:
            "Journey through Calvin's sports history and achievements. Visit iconic sports venues and learn about legendary athletes who made their mark. Experience the pride and tradition of Calvin athletics.",
          difficulty: "Easy",
          estimatedTime: "25 min",
          rewards: "4 tokens",
          isCompleted: false,
          isUnlocked: true,
        },
        {
          id: "5",
          title: "Ecosystem Discovery",
          description:
            "A challenging adventure through various ecosystems on campus. Learn about local flora and fauna while collecting tokens at ecological points of interest. Perfect for nature enthusiasts and biology students.",
          difficulty: "Hard",
          estimatedTime: "90 min",
          rewards: "10 tokens",
          isCompleted: false,
          isUnlocked: true,
        },
      ];

      const currentId = Array.isArray(adventureId) ? adventureId[0] : adventureId || "1";
      const foundAdventure = MOCK_ADVENTURES.find(adv => adv.id === currentId);

      if (!foundAdventure) {
        setError("Adventure not found");
        setLoading(false);
        return;
      }

      const mockAdventure: Adventure = {
        ...foundAdventure,
        image: "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Adventure+Image",
      };

      // Simulate network delay
      setTimeout(() => {
        setAdventure(mockAdventure);
        setLoading(false);
      }, 500);
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
    router.replace("/home");
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
