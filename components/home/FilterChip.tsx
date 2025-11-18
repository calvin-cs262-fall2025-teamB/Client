import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import themes from "@/assets/utils/themes";

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export default function FilterChip({
  label,
  selected = false,
  onPress,
}: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: themes.primaryColorLight,
    borderColor: themes.primaryColor,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  chipTextSelected: {
    color: themes.primaryColor,
    fontWeight: "600",
  },
});
