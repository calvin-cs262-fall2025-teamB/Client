import themes from "@/assets/utils/themes";
import FilterChip from "@/components/home/FilterChip";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  selectedDifficulty: string | null;
  setSelectedDifficulty: (s: string | null) => void;
  selectedDuration: string | null;
  setSelectedDuration: (s: string | null) => void;
  regions: string[];
  selectedRegion: string | null;
  setSelectedRegion: (s: string | null) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
};

export default function FiltersRow({
  selectedDifficulty,
  setSelectedDifficulty,
  selectedDuration,
  setSelectedDuration,
  regions,
  selectedRegion,
  setSelectedRegion,
  clearFilters,
  hasActiveFilters,
}: Props) {
  return (
    <View style={styles.filtersSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        <FilterChip
          label="Easy"
          selected={selectedDifficulty === "easy"}
          onPress={() =>
            setSelectedDifficulty(selectedDifficulty === "easy" ? null : "easy")
          }
        />
        <FilterChip
          label="Medium"
          selected={selectedDifficulty === "medium"}
          onPress={() =>
            setSelectedDifficulty(
              selectedDifficulty === "medium" ? null : "medium"
            )
          }
        />
        <FilterChip
          label="Hard"
          selected={selectedDifficulty === "hard"}
          onPress={() =>
            setSelectedDifficulty(selectedDifficulty === "hard" ? null : "hard")
          }
        />

        <View style={styles.filterDivider} />

        <FilterChip
          label="< 30 min"
          selected={selectedDuration === "quick"}
          onPress={() =>
            setSelectedDuration(selectedDuration === "quick" ? null : "quick")
          }
        />
        <FilterChip
          label="30-60 min"
          selected={selectedDuration === "medium"}
          onPress={() =>
            setSelectedDuration(selectedDuration === "medium" ? null : "medium")
          }
        />
        <FilterChip
          label="> 60 min"
          selected={selectedDuration === "long"}
          onPress={() =>
            setSelectedDuration(selectedDuration === "long" ? null : "long")
          }
        />

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
  );
}

const styles = StyleSheet.create({
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
});
