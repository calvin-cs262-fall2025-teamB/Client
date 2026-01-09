import BackButton from "@/components/reusable/BackButton";
import { Adventure as DbAdventure } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useDatabase } from "../../contexts/DatabaseContext";

export default function AdventurePageTemplate() {
  const router = useRouter();
  const { adventureId } = useLocalSearchParams();

  // Use DatabaseContext
  const { adventures, loading, errors, fetchAdventures } =
    useDatabase();

  // State for current adventure
  const [adventure, setAdventure] = useState<DbAdventure | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Accuracy selection state
  const [selectedAccuracy, setSelectedAccuracy] = useState<'normal' | 'high'>('normal');

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
      const foundDbAdventure = adventures.find((adv: DbAdventure) => {
        const advId = adv.id;
        const idMatch = advId && (advId.toString() === currentId || advId === parseInt(currentId));
        
        return idMatch;
      });
      
      if (foundDbAdventure) {
        setAdventure(foundDbAdventure);
        setIsInitializing(false);
      } else {
        console.log('Adventure not found. Available IDs:', adventures.map((adv: any) => adv.ID || adv.id));
        setLocalError(`Adventure not found (ID: ${currentId})`);
        setIsInitializing(false);
      }
    } else if (adventures.length > 0 && adventureId) {
      setIsInitializing(false);
    }
  }, [adventures, regionsData, adventureId, adventure]);



  const handlePlayPress = () => {
    if (adventure) {
      console.log(`Starting adventure: ${adventure.name} with ${selectedAccuracy} accuracy`);
      router.push(`/gameMap?adventureId=${adventureId}&accuracy=${selectedAccuracy}`);
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
        <Text style={styles.errorText}>
          {localError || errors.adventures || "Adventure not found"}
        </Text>
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
          <Text style={styles.title}>{adventure.name}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              Tokens: {adventure.numtokens} available
            </Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About this Adventure</Text>
          <Text style={styles.description}>{adventure.name}</Text>
        </View>

        {/* Accuracy Selection */}
        <View style={styles.accuracyContainer}>
          <Text style={styles.accuracyTitle}>Location Accuracy</Text>
          <View style={styles.accuracyOptions}>
            <TouchableOpacity
              style={[
                styles.accuracyOption,
                selectedAccuracy === 'normal' && styles.accuracyOptionSelected
              ]}
              onPress={() => setSelectedAccuracy('normal')}
            >
              <Text style={[
                styles.accuracyOptionText,
                selectedAccuracy === 'normal' && styles.accuracyOptionTextSelected
              ]}>Normal</Text>
              <Text style={styles.accuracyOptionSubtext}>
                Balanced battery usage • ~15m precision
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.accuracyOption,
                selectedAccuracy === 'high' && styles.accuracyOptionSelected
              ]}
              onPress={() => setSelectedAccuracy('high')}
            >
              <Text style={[
                styles.accuracyOptionText,
                selectedAccuracy === 'high' && styles.accuracyOptionTextSelected
              ]}>High Precision</Text>
              <Text style={styles.accuracyOptionSubtext}>
                Higher battery usage • ~6m precision
              </Text>
            </TouchableOpacity>
          </View>
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
              Play
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
  accuracyContainer: {
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
  accuracyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  accuracyOptions: {
    gap: 10,
  },
  accuracyOption: {
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 15,
    backgroundColor: "#f9fafb",
  },
  accuracyOptionSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#eff6ff",
  },
  accuracyOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  accuracyOptionTextSelected: {
    color: "#007AFF",
  },
  accuracyOptionSubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
});
