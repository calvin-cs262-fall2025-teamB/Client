import themes from "@/assets/utils/themes";
import FilterChip from "@/components/home/FilterChip";
import MapPlaceholder from "@/components/home/MapPlaceholder";
import { Adventure as DbAdventure, Region } from "@/types";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDatabase } from "../../contexts/DatabaseContext";

// Filter type definitions
type RegionFilter = string | null;

export default function HomePage() {
  const router = useRouter();
  const [selectedAdventure, setSelectedAdventure] = useState<DbAdventure | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter states with proper typing
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>(null);

  // API state from DatabaseContext
  const {
    adventures,
    regions: regionsData,
    loading,
    errors,
    fetchAdventures,
    fetchRegions,
  } = useDatabase();

  // Load adventures and regions on component mount
  useEffect(() => {
    fetchAdventures();
    fetchRegions();
  }, [fetchAdventures, fetchRegions]);

  // Use adventures directly from database
  const displayAdventures = adventures;

  // Helper function to get region name for an adventure
  const getRegionName = (adventure: DbAdventure): string => {
    const adv = adventure;
    // Handle both lowercase (PostgreSQL default) and camelCase field names
    const regionId = adv.regionid;
    const region = regionsData.find((r: Region) => r.id === regionId);
    return region?.name || `Region ${regionId}`;
  };

  // Get unique regions for filter
  const regions: string[] = Array.from(
    new Set(displayAdventures.map((adv: DbAdventure) => getRegionName(adv)))
  );

  // Apply filters
  const filteredAdventures = displayAdventures.filter((adv: DbAdventure) => {
    const adventureName = adv.name || '';
    const matchesSearch = adventureName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = !selectedRegion || getRegionName(adv) === selectedRegion;

    return matchesSearch && matchesRegion;
  });

  const handleAdventurePress = (adventure: DbAdventure) => {
    setSelectedAdventure(adventure);
    setIsModalOpen(true);
  };

  const handleStartAdventure = () => {
    if (!selectedAdventure) return;
    setIsModalOpen(false);
    const adventureId = selectedAdventure.id;
    router.push(`/adventurePage?adventureId=${adventureId}`);
  };

  const clearFilters = () => {
    setSelectedRegion(null);
  };

  const hasActiveFilters = selectedRegion;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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
        <Text style={styles.filtersLabel}>Regions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {/* Region Filters */}
          {regions.length > 1 && (
            regions.map((region, index) => (
              <FilterChip
                key={`${region}-${index}`}
                label={region}
                selected={selectedRegion === region}
                onPress={() =>
                  setSelectedRegion(selectedRegion === region ? null : region)
                }
              />
            ))
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
            <FontAwesome6
              name="triangle-exclamation"
              size={48}
              color="#FF3B30"
            />
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
          filteredAdventures.map((adventure: DbAdventure, index: number) => (
            <TouchableOpacity
              key={`${adventure.id}-${index}`}
              style={styles.card}
              onPress={() => handleAdventurePress(adventure)}
              activeOpacity={0.8}
            >
              <MapPlaceholder regionName={getRegionName(adventure)} height={160} />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {adventure.name || 'Unnamed Adventure'}
                  </Text>
                </View>
                <Text style={styles.cardSummary} numberOfLines={2}>
                  {adventure.name || 'No description available'}
                </Text>
                <View style={styles.cardFooter}>
                  <View style={styles.badge}>
                    <FontAwesome6
                      name="location-dot"
                      size={12}
                      color="#6B7280"
                    />
                    <Text style={styles.badgeText}>{getRegionName(adventure)}</Text>
                  </View>

                  <View style={styles.badge}>
                    <FontAwesome6 name="coins" size={12} color="#FFD700" />
                    <Text style={styles.badgeText}>{adventure.numtokens}</Text>
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
                  {selectedAdventure.name || 'Unnamed Adventure'}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsModalOpen(false)}
                  style={styles.closeIconButton}
                >
                  <FontAwesome6 name="xmark" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Key Info Bar */}
            <View style={styles.modalInfoBar}>
              <View style={styles.modalInfoItem}>
                <FontAwesome6
                  name="location-dot"
                  size={16}
                  color={themes.primaryColor}
                />
                <Text style={styles.modalInfoText}>
                  {getRegionName(selectedAdventure)}
                </Text>
              </View>
              <View style={styles.modalInfoDivider} />
              <View style={styles.modalInfoItem}>
                <FontAwesome6 name="coins" size={16} color="#FFD700" />
                <Text style={styles.modalInfoText}>
                  {selectedAdventure.numtokens} tokens
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.modalDescriptionSection}>
              <Text style={styles.modalSectionTitle}>
                What you will discover
              </Text>
              <Text style={styles.modalDescription}>
                {selectedAdventure.name || 'No description available'}
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
  filtersLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    paddingHorizontal: 20,
    paddingBottom: 8,
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
