import themes from "@/assets/utils/themes";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
  onPress?: () => void;
  size?: number;
  color?: string;
};

export default function BackButton({ onPress, size = 30, color = themes.primaryColor }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={styles.button}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View>
        <Ionicons name="arrow-back" size={size} color={color} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
});
