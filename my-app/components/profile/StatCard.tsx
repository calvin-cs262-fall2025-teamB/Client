import themes from "@/assets/utils/themes";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatCardProps {
  icon: string;
  iconFamily?: "fontawesome" | "antdesign";
  value: string | number;
  label: string;
  color?: string;
  backgroundColor?: string;
}

export default function StatCard({
  icon,
  iconFamily = "fontawesome",
  value,
  label,
  color = themes.primaryColor,
  backgroundColor = themes.backgroundColorLight,
}: StatCardProps) {
  const IconComponent = iconFamily === "fontawesome" ? FontAwesome6 : AntDesign;

  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <IconComponent name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: themes.primaryColorGreyDark,
    textAlign: "center",
  },
  value: {
    fontSize: 28,
    fontWeight: "bold",
    color: themes.primaryColorDark,
    marginBottom: 4,
  },
});
