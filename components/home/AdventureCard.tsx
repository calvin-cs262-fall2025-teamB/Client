import DifficultyBadge from "@/components/home/DifficultyBadge";
import MapPlaceholder from "@/components/home/MapPlaceholder";
import { FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AdventureCardData {
  title: string;
  difficulty: string;
  summary: string;
  estimatedTime: string;
  tokenCount: number;
  region: {
    name: string;
  };
}

type Props = {
  adventure: AdventureCardData;
  onPress: () => void;
};

export default function AdventureCard({ adventure, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <MapPlaceholder regionName={adventure.region.name} height={160} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {adventure.title}
          </Text>
          <DifficultyBadge difficulty={adventure.difficulty} size="small" />
        </View>
        <Text style={styles.cardSummary} numberOfLines={2}>
          {adventure.summary}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.badge}>
            <FontAwesome6 name="location-dot" size={12} color="#6B7280" />
            <Text style={styles.badgeText}>{adventure.region.name}</Text>
          </View>
          <View style={styles.badge}>
            <FontAwesome6 name="clock" size={12} color="#6B7280" />
            <Text style={styles.badgeText}>{adventure.estimatedTime}</Text>
          </View>
          <View style={styles.badge}>
            <FontAwesome6 name="coins" size={12} color="#FFD700" />
            <Text style={styles.badgeText}>{adventure.tokenCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
});
