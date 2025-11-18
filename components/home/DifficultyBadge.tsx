import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DifficultyBadgeProps {
  difficulty: string;
  size?: "small" | "medium" | "large";
}

export default function DifficultyBadge({
  difficulty,
  size = "medium",
}: DifficultyBadgeProps) {
  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "easy":
        return { bg: "#D1FAE5", text: "#065F46", border: "#34D399" };
      case "medium":
        return { bg: "#FEF3C7", text: "#92400E", border: "#FBBF24" };
      case "hard":
        return { bg: "#FEE2E2", text: "#991B1B", border: "#F87171" };
      default:
        return { bg: "#F3F4F6", text: "#4B5563", border: "#9CA3AF" };
    }
  };

  const colors = getDifficultyColor(difficulty);
  const sizeStyles =
    size === "small"
      ? styles.small
      : size === "large"
      ? styles.large
      : styles.medium;

  return (
    <View
      style={[
        styles.badge,
        sizeStyles,
        { backgroundColor: colors.bg, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>
        {difficulty.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
