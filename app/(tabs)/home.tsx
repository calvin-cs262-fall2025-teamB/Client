import themes from "@/assets/utils/themes";
import DifficultyBadge from "@/components/home/DifficultyBadge";
import FilterChip from "@/components/home/FilterChip";
import MapPlaceholder from "@/components/home/MapPlaceholder";
import { Adventure as DbAdventure, FrontendAdventure } from "@/types";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDatabase } from "../../contexts/DatabaseContext";

// Use FrontendAdventure as the main Adventure type for UI components
type Adventure = FrontendAdventure;

// Filter type definitions
type DifficultyFilter = 'Easy' | 'Medium' | 'Hard' | null;
type DurationFilter = 'quick' | 'medium' | 'long' | null;
type RegionFilter = string | null;

// ============================================================================
// MOCK DATA - Fallback for if Azure Web Service fetch fails
// ============================================================================
const MOCK_ADVENTURES: Adventure[] = [
  {
    id: "1",
    title: "Campus History Tour",
    summary:
      "Discover the rich history of Calvin University through iconic landmarks",
    description:
      "Explore historic buildings, memorable locations, and hidden gems that tell the story of our campus. Learn about the university's founding and significant events.",
    image_url: null,
    region: {
      id: "1",
      name: "North Campus",
      center: { lat: 42.9301, lng: -85.5883 },
    },
    tokenCount: 5,
    difficulty: "Easy",
    estimatedTime: "30 min",
    status: "published",
  },
  {
    id: "2",
    title: "Hidden Art Walk",
    summary: "Find secret art installations scattered across campus",
    description:
      "Discover beautiful murals, sculptures, and installations that many students walk past every day. Each piece has a story about the artists and their inspiration.",
    image_url: null,
    region: {
      id: "2",
      name: "South Campus",
      center: { lat: 42.929, lng: -85.587 },
    },
    tokenCount: 8,
    difficulty: "Medium",
    estimatedTime: "60 min",
    status: "published",
  },
  {
    id: "3",
    title: "Science Building Quest",
    summary: "Explore the wonders of our science facilities",
    description:
      "Visit laboratories, planetariums, and experimental spaces while learning about groundbreaking discoveries made right here at Calvin. Perfect for curious minds.",
    image_url: null,
    region: {
      id: "1",
      name: "North Campus",
      center: { lat: 42.9301, lng: -85.5883 },
    },
    tokenCount: 6,
    difficulty: "Medium",
    estimatedTime: "45 min",
    status: "published",
  },
  {
    id: "4",
    title: "Athletic Heritage Trail",
    summary: "Journey through Calvin's sports history and achievements",
    description:
      "Visit iconic sports venues and learn about legendary athletes who made their mark. Experience the pride and tradition of Calvin athletics.",
    image_url: null,
    region: {
      id: "3",
      name: "Athletic Complex",
      center: { lat: 42.9315, lng: -85.5895 },
    },
    tokenCount: 4,
    difficulty: "Easy",
    estimatedTime: "25 min",
    status: "published",
  },
  {
    id: "5",
    title: "Ecosystem Discovery",
    summary: "Explore Calvin's natural habitats and biodiversity",
    description:
      "A challenging adventure through various ecosystems on campus. Learn about local flora and fauna while collecting tokens at ecological points of interest.",
    image_url: null,
    region: {
      id: "4",
      name: "Ecosystem Preserve",
      center: { lat: 42.9285, lng: -85.5870 },
    },
    tokenCount: 10,
    difficulty: "Hard",
    estimatedTime: "90 min",
    status: "published",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter states with proper typing
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationFilter>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>(null);

  // API state from DatabaseContext
  const { 
    adventures, 
    regions: regionsData,
    loading, 
    errors, 
    fetchAdventures,
    fetchRegions
  } = useDatabase();

  // Load adventures and regions on component mount
  useEffect(() => {
    fetchAdventures();
    fetchRegions();
  }, [fetchAdventures, fetchRegions]);

  // Transform database adventures to match the FrontendAdventure interface
  const transformedAdventures: Adventure[] = adventures.map((item: DbAdventure) => {
    // Debug: Log the raw adventure data to understand the structure
    if (__DEV__) {
      console.log('Raw adventure data:', JSON.stringify(item, null, 2));
    }
    
    // Handle both camelCase and snake_case field names from database
    const itemAny = item as any;
    const regionId = item.regionId || itemAny.regionid || itemAny.regionID;
    const numTokens = item.numTokens || itemAny.numtokens || itemAny.num_tokens;
    
    // Find the corresponding region data
    const region = regionsData.find((r: any) => r.id === regionId || r.ID === regionId);
    
    if (__DEV__) {
      console.log(`Adventure "${item.name}": regionId=${regionId}, numTokens=${numTokens}, foundRegion=${!!region}`);
      if (region) {
        console.log('Found region:', JSON.stringify(region, null, 2));
      }
    }
    
    return {
      id: item.id?.toString() || '',
      title: item.name || 'Unnamed Adventure',
      summary: item.name || 'No description available',
      description: item.name || 'No description available',
      image_url: null,
      region: {
        id: regionId?.toString() || '1',
        name: region?.name || `Region ${regionId || 1}`,
        center: {
          lat: region?.location?.x || item.location?.x || 42.9301,
          lng: region?.location?.y || item.location?.y || -85.5883,
        },
      },
      tokenCount: numTokens || 0,
      difficulty: 'Medium' as const,
      estimatedTime: '30 min',
      status: 'published' as const,
    };
  });

  // Debug: Log regions data
  if (__DEV__) {
    console.log('Regions data loaded:', regionsData?.length || 0, 'regions');
    if (regionsData?.length > 0) {
      console.log('Sample region:', JSON.stringify(regionsData[0], null, 2));
    }
  }

  // Use transformed adventures or fallback to mock data if empty
  const displayAdventures = transformedAdventures.length > 0 ? transformedAdventures : (errors.adventures && __DEV__ ? MOCK_ADVENTURES : []);

  // Get unique regions for filter
  const regions: string[] = Array.from(new Set(displayAdventures.map((adv: Adventure) => adv.region.name)));

  // Apply filters
  const filteredAdventures = displayAdventures.filter((adv: Adventure) => {
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

    return matchesSearch && matchesDifficulty && matchesDuration && matchesRegion;
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

  const hasActiveFilters =
    selectedDifficulty || selectedDuration || selectedRegion;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>WayFind</Text>
        <Text style={styles.subtitle}>Discover campus adventures</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome6
            name="magnifying-glass"
            size={18}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search adventures..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <FontAwesome6 name="xmark" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {/* Difficulty Filters */}
          <FilterChip
            label="Easy"
            selected={selectedDifficulty === "Easy"}
            onPress={() =>
              setSelectedDifficulty(
                selectedDifficulty === "Easy" ? null : "Easy"
              )
            }
          />
          <FilterChip
            label="Medium"
            selected={selectedDifficulty === "Medium"}
            onPress={() =>
              setSelectedDifficulty(
                selectedDifficulty === "Medium" ? null : "Medium"
              )
            }
          />
          <FilterChip
            label="Hard"
            selected={selectedDifficulty === "Hard"}
            onPress={() =>
              setSelectedDifficulty(
                selectedDifficulty === "Hard" ? null : "Hard"
              )
            }
          />

          {/* Duration Filters */}
          <View style={styles.filterDivider} />
          <FilterChip
            label="< 30 min"
            selected={selectedDuration === "quick"}
            onPress={() =>
              setSelectedDuration(
                selectedDuration === "quick" ? null : "quick"
              )
            }
          />
          <FilterChip
            label="30-60 min"
            selected={selectedDuration === "medium"}
            onPress={() =>
              setSelectedDuration(
                selectedDuration === "medium" ? null : "medium"
              )
            }
          />
          <FilterChip
            label="> 60 min"
            selected={selectedDuration === "long"}
            onPress={() =>
              setSelectedDuration(selectedDuration === "long" ? null : "long")
            }
          />

          {/* Region Filters */}
          {regions.length > 1 && (
            <>
              <View style={styles.filterDivider} />
              {regions.map((region) => (
                <FilterChip
                  key={region}
                  label={region}
                  selected={selectedRegion === region}
                  onPress={() =>
                    setSelectedRegion(selectedRegion === region ? null : region)
                  }
                />
              ))}
            </>
          )}
        </ScrollView>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <FontAwesome6 name="xmark" size={12} color={themes.primaryColor} />
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Adventure Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {loading.adventures ? (
          // Loading state
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading adventures...</Text>
          </View>
        ) : errors.adventures && displayAdventures.length === 0 ? (
          // Error state
          <View style={styles.errorContainer}>
            <FontAwesome6 name="triangle-exclamation" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{errors.adventures}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchAdventures}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
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
          filteredAdventures.map((adventure: Adventure) => (
            <TouchableOpacity
              key={adventure.id}
              style={styles.card}
              onPress={() => handleAdventurePress(adventure)}
              activeOpacity={0.8}
            >
              <MapPlaceholder
                regionName={adventure.region.name}
                height={160}
              />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {adventure.title}
                  </Text>
                  <DifficultyBadge
                    difficulty={adventure.difficulty}
                    size="small"
                  />
                </View>
                <Text style={styles.cardSummary} numberOfLines={2}>
                  {adventure.summary}
                </Text>
                <View style={styles.cardFooter}>
                  <View style={styles.badge}>
                    <FontAwesome6
                      name="location-dot"
                      size={12}
                      color="#6B7280"
                    />
                    <Text style={styles.badgeText}>{adventure.region.name}</Text>
                  </View>
                  <View style={styles.badge}>
                    <FontAwesome6 name="clock" size={12} color="#6B7280" />
                    <Text style={styles.badgeText}>
                      {adventure.estimatedTime}
                    </Text>
                  </View>
                  <View style={styles.badge}>
                    <FontAwesome6 name="coins" size={12} color="#FFD700" />
                    <Text style={styles.badgeText}>
                      {adventure.tokenCount}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
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
                <FontAwesome6 name="clock" size={16} color={themes.primaryColor} />
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
              <Text style={styles.modalSectionTitle}>What you will discover</Text>
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
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: themes.primaryColor,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  filtersSection: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filtersContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  clearFiltersButton: {
    position: "absolute",
    right: 20,
    top: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themes.primaryColorLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: "600",
    color: themes.primaryColor,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  skeleton: {
    height: 280,
    backgroundColor: "#E5E7EB",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  cardSummary: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  badgeText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
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
