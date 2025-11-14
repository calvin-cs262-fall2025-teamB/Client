import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import themes from "@/assets/utils/themes";

type Props = {
  onPress?: () => void;
  size?: number;
  color?: string;
  info?: string;
};

export default function BackButton({
  onPress,
  size = 30,
  color = themes.primaryColor,
  info = "touch me",
}: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={styles.button}
    >
      <Text>{info}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: themes.primaryColor,
    width: "50%",
  },
});
