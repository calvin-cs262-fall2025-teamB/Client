// === ADVENTURE CREATION SCREEN ===
// This screen provides a multi-step flow for creating adventures:
// Step 1: Enter adventure name and select region
// Step 2: Place tokens on map and add clues
// Step 3: Review and save to database

import themes from "@/assets/utils/themes";
import Button from "@/components/home/Button";
import BackButton from "@/components/reusable/BackButton";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// === CONTEXT IMPORTS ===
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import * as Haptics from "expo-haptics";

// === TYPE DEFINITIONS ===
import { Region } from "@/types/database";

export default function CreateAdventureScreen() {
  const router = useRouter();

  // === CONTEXT HOOKS ===
  const { user } = useAuth();
  const { regions, fetchRegions, fetchAdventures, loading, errors, createAdventure } = useDatabase();

  // === STATE MANAGEMENT ===
  // Step 1: Adventure details
  const [adventureName, setAdventureName] = useState<string>("");
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // === LOAD REGIONS FROM DATABASE ===
  // Fetch regions when component mounts
  useEffect(() => {
    if (regions.length === 0) {
      fetchRegions();
    }
  }, [regions.length, fetchRegions]);

  // === STEP 1: DETAILS - HANDLERS ===

  const handleRegionSelect = (regionId: number) => {
    setSelectedRegionId(regionId);
    setIsDropdownOpen(false);
    // Haptic feedback for selection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNextToTokens = () => {
    // Validation
    if (!adventureName.trim()) {
      Alert.alert("Name Required", "Please enter a name for your adventure.");
      return;
    }

    if (!selectedRegionId) {
      Alert.alert("Region Required", "Please select a region for your adventure.");
      return;
    }

    // Haptic feedback for progression
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Get selected region name
    const selectedRegion = regions.find((r: Region) => r.id === selectedRegionId);
    const regionNameValue = selectedRegion?.name || "Unknown Region";

    // Navigate to token placement screen
    router.push({
      pathname: "/(tabs)/createAdventureMap",
      params: {
        adventureName: adventureName.trim(),
        regionId: selectedRegionId.toString(),
        regionName: regionNameValue,
      },
    });
  };

  // === LOADING STATE ===
  if (loading.regions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themes.primaryColor} />
        <Text style={styles.loadingText}>Loading regions...</Text>
      </View>
    );
  }

  // === ERROR STATE ===
  if (errors.regions) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load regions</Text>
        <Text style={styles.errorSubtext}>{errors.regions}</Text>
        <Button label="Try Again" theme="primary" onPress={() => fetchRegions()} />
      </View>
    );
  }

  // === GET SELECTED REGION NAME FOR DISPLAY ===
  const selectedRegionName = regions.find((r: Region) => r.id === selectedRegionId)?.name || "Select a region...";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* === BACK BUTTON === */}
      <View style={styles.topRow}>
        <BackButton onPress={() => router.back()} />
      </View>

      {/* === TITLE === */}
      <Text style={styles.title}>Create Adventure</Text>
      <Text style={styles.subtitle}>Step 1: Adventure Details</Text>

      {/* === ADVENTURE NAME INPUT === */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Adventure Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter adventure name..."
          placeholderTextColor="#999"
          value={adventureName}
          onChangeText={setAdventureName}
          maxLength={100}
        />
        {adventureName.trim() && (
          <Text style={styles.charCount}>{adventureName.length}/100</Text>
        )}
      </View>

      {/* === REGION SELECTION === */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Select Region *</Text>

        {/* Dropdown button */}
        <Pressable
          style={styles.dropdown}
          onPress={() => {
            setIsDropdownOpen((v) => !v);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Text style={[
            styles.dropdownText,
            !selectedRegionId && styles.dropdownPlaceholder
          ]}>
            {selectedRegionName}
          </Text>
          <FontAwesome6
            name={isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={themes.primaryColor}
          />
        </Pressable>

        {/* Dropdown options */}
        {isDropdownOpen && (
          <View style={styles.options}>
            <ScrollView
              style={styles.optionsScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {regions.length === 0 ? (
                <View style={styles.option}>
                  <Text style={styles.optionTextEmpty}>No regions available</Text>
                  <Text style={styles.optionSubtext}>Create a region first from the Map tab</Text>
                </View>
              ) : (
                regions.map((region: Region) => (
                  <Pressable
                    key={region.id}
                    style={[
                      styles.option,
                      selectedRegionId === region.id && styles.optionSelected
                    ]}
                    onPress={() => handleRegionSelect(region.id)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedRegionId === region.id && styles.optionTextSelected
                    ]}>
                      {region.name}
                    </Text>
                    {region.description && (
                      <Text style={styles.optionSubtext}>{region.description}</Text>
                    )}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* === INFO BOX === */}
      <View style={styles.infoBox}>
        <FontAwesome6 name="circle-info" size={16} color={themes.primaryColor} />
        <Text style={styles.infoText}>
          After selecting a region, you&apos;ll be able to place tokens on the map in Step 2.
        </Text>
      </View>

      {/* === NEXT BUTTON === */}
      <View style={styles.buttonRow}>
        <Button
          label="Next: Place Tokens"
          theme="primary"
          size="large"
          onPress={handleNextToTokens}
        />
      </View>
    </ScrollView>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  // === CONTAINER STYLES ===
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },

  // === LOADING & ERROR STATES ===
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#FF3B30",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },

  // === HEADER ===
  topRow: {
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },

  // === INPUT SECTIONS ===
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#111",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },

  // === DROPDOWN ===
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 14,
  },
  dropdownText: {
    fontSize: 16,
    color: "#111",
  },
  dropdownPlaceholder: {
    color: "#999",
  },
  options: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    maxHeight: 300,
    overflow: "hidden",
  },
  optionsScrollView: {
    maxHeight: 300,
  },
  option: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionSelected: {
    backgroundColor: "#E8F5E9",
  },
  optionText: {
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: themes.primaryColor,
    fontWeight: "600",
  },
  optionTextEmpty: {
    fontSize: 15,
    color: "#999",
    fontWeight: "500",
    marginBottom: 4,
  },
  optionSubtext: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  // === INFO BOX ===
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1976D2",
    lineHeight: 20,
  },

  // === BUTTONS ===
  buttonRow: {
    marginTop: 12,
    alignItems: "center",
  },

  // === SAVING INDICATOR ===
  savingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  savingText: {
    fontSize: 14,
    color: "#666",
  },
});