import themes from "@/assets/utils/themes";
import AdventureCard from "@/components/home/AdventureCard";
import DifficultyBadge from "@/components/home/DifficultyBadge";
import FiltersRow from "@/components/home/FiltersRow";
import HomeHeader from "@/components/home/HomeHeader";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useHome } from "@/contexts/HomeContext";

// ============================================================================
// Type definitions
// ============================================================================
interface Adventure {
  id: string;
  title: string;
  summary: string;
  description?: string;
  image_url: string | null;
  region: {
    id: string;
    name: string;
    center: { lat: number; lng: number };
  };
  tokenCount: number;
  difficulty: string;
  estimatedTime: string;
  status: string;
}

export default function HomePage() {
  const router = useRouter();
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter states
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // API state
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  //Context states -- this might be problem

  //Prevent loading from API everytime. Just gets data
  const { data } = useHome();

  // Transform data when it becomes available
  useEffect(() => {
    if (!data) {
      return;
    }

    try {
      const transformedAdventures: Adventure[] = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.name, // API uses 'name' field
        summary: item.name, // Use name as summary since no separate summary field
        description: item.name, // Use name as description fallback
        image_url: null, // No image_url in current API response
        region: {
          id: item.regionid?.toString() || "1",
          name: `Region ${item.regionid}`, // Create region name from ID
          center: {
            lat: item.location?.x || 42.9301, // Use location.x as latitude
            lng: item.location?.y || -85.5883, // Use location.y as longitude
          },
        },
        tokenCount: item.numtokens || 0,
        difficulty: "Medium", // Default since not in API response
        estimatedTime: "30 min", // Default since not in API response
        status: "published", // Default since not in API response
      }));

      setAdventures(transformedAdventures);
      setIsLoading(false);
    } catch (err) {
      console.error("Error transforming adventures:", err);
      setIsLoading(false);
    }
  }, [data]);

  // Get unique regions for filter
  const regions = Array.from(new Set(adventures.map((adv) => adv.region.name)));

  // Apply filters
  const filteredAdventures = adventures.filter((adv) => {
    const matchesSearch =
      adv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adv.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      !selectedDifficulty ||
      adv.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    const matchesDuration =
      !selectedDuration ||
      (selectedDuration === "quick" && parseInt(adv.estimatedTime) < 30) ||
      (selectedDuration === "medium" &&
        parseInt(adv.estimatedTime) >= 30 &&
        parseInt(adv.estimatedTime) <= 60) ||
      (selectedDuration === "long" && parseInt(adv.estimatedTime) > 60);

    const matchesRegion = !selectedRegion || adv.region.name === selectedRegion;

    return (
      matchesSearch && matchesDifficulty && matchesDuration && matchesRegion
    );
  });

  const handleAdventurePress = (adventure: Adventure) => {
    setSelectedAdventure(adventure);
    setIsModalOpen(true);
  };

  const handleStartAdventure = () => {
    if (!selectedAdventure) return;
    setIsModalOpen(false);
    router.push(`/adventurePage?adventureId=${selectedAdventure.id}`);
  };

  const clearFilters = () => {
    setSelectedDifficulty(null);
    setSelectedDuration(null);
    setSelectedRegion(null);
  };

  const hasActiveFilters = !!(
    selectedDifficulty ||
    selectedDuration ||
    selectedRegion
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Filter Chips */}
      <FiltersRow
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        selectedDuration={selectedDuration}
        setSelectedDuration={setSelectedDuration}
        regions={regions}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Adventure Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading ? (
          // Loading state
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading adventures...</Text>
          </View>
        ) : filteredAdventures.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome6 name="map-location-dot" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {hasActiveFilters
                ? "No adventures match your filters"
                : searchQuery
                ? "No adventures found"
                : "No adventures available"}
            </Text>
            <Text style={styles.emptySubtext}>
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "Check back soon for new adventures!"}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.clearFiltersButtonLarge}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredAdventures.map((adventure) => (
            <AdventureCard
              key={adventure.id}
              adventure={adventure}
              onPress={() => handleAdventurePress(adventure)}
            />
          ))
        )}
      </ScrollView>

      {/* Enhanced Modal */}
      {isModalOpen && selectedAdventure && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {selectedAdventure.title}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsModalOpen(false)}
                  style={styles.closeIconButton}
                >
                  <FontAwesome6 name="xmark" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <DifficultyBadge
                difficulty={selectedAdventure.difficulty}
                size="medium"
              />
            </View>

            {/* Key Info Bar */}
            <View style={styles.modalInfoBar}>
              <View style={styles.modalInfoItem}>
                <FontAwesome6
                  name="clock"
                  size={16}
                  color={themes.primaryColor}
                />
                <Text style={styles.modalInfoText}>
                  {selectedAdventure.estimatedTime}
                </Text>
              </View>
              <View style={styles.modalInfoDivider} />
              <View style={styles.modalInfoItem}>
                <FontAwesome6
                  name="location-dot"
                  size={16}
                  color={themes.primaryColor}
                />
                <Text style={styles.modalInfoText}>
                  {selectedAdventure.region.name}
                </Text>
              </View>
              <View style={styles.modalInfoDivider} />
              <View style={styles.modalInfoItem}>
                <FontAwesome6 name="coins" size={16} color="#FFD700" />
                <Text style={styles.modalInfoText}>
                  {selectedAdventure.tokenCount} tokens
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.modalDescriptionSection}>
              <Text style={styles.modalSectionTitle}>
                What you will discover
              </Text>
              <Text style={styles.modalDescription}>
                {selectedAdventure.description || selectedAdventure.summary}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartAdventure}
              >
                <FontAwesome6 name="play" size={16} color="#fff" />
                <Text style={styles.startButtonText}>Start Adventure</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  skeleton: {
    height: 280,
    backgroundColor: "#E5E7EB",
  },
  emptyState: {
    paddingTop: 80,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  clearFiltersButtonLarge: {
    marginTop: 20,
    backgroundColor: themes.primaryColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearFiltersButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalInfoBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalInfoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  modalInfoDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E7EB",
  },
  modalDescriptionSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  modalActions: {
    gap: 12,
  },
  startButton: {
    backgroundColor: themes.primaryColor,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: themes.primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
