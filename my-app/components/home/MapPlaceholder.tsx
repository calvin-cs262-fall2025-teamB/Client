import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import themes from "@/assets/utils/themes";

interface MapPlaceholderProps {
  regionName?: string;
  height?: number;
}

export default function MapPlaceholder({
  regionName = "Region",
  height = 160,
}: MapPlaceholderProps) {
  return (
    <LinearGradient
      colors={["#e4f5e8", "#d0edd8", "#c0e5ca"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { height }]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 200 120">
        {/* Stylized map grid lines */}
        <Path
          d="M 20 20 Q 40 40, 60 30 T 100 40 T 140 35 T 180 45"
          stroke="#34c75940"
          strokeWidth="2"
          fill="none"
        />
        <Path
          d="M 20 45 Q 40 65, 60 55 T 100 65 T 140 60 T 180 70"
          stroke="#34c75940"
          strokeWidth="2"
          fill="none"
        />
        <Path
          d="M 20 70 Q 40 90, 60 80 T 100 90 T 140 85 T 180 95"
          stroke="#34c75940"
          strokeWidth="2"
          fill="none"
        />

        {/* Vertical grid lines */}
        <Path
          d="M 50 15 L 50 105"
          stroke="#34c75930"
          strokeWidth="1.5"
          fill="none"
        />
        <Path
          d="M 100 15 L 100 105"
          stroke="#34c75930"
          strokeWidth="1.5"
          fill="none"
        />
        <Path
          d="M 150 15 L 150 105"
          stroke="#34c75930"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Location marker pin in center */}
        <Path
          d="M 100 45 C 100 35, 90 35, 90 45 C 90 55, 100 65, 100 65 C 100 65, 110 55, 110 45 C 110 35, 100 35, 100 45 Z"
          fill={themes.primaryColor}
          opacity="0.9"
        />
        <Circle cx="100" cy="45" r="4" fill="#fff" />

        {/* Small decorative dots representing points of interest */}
        <Circle cx="70" cy="35" r="3" fill="#34c75960" />
        <Circle cx="130" cy="50" r="3" fill="#34c75960" />
        <Circle cx="85" cy="75" r="3" fill="#34c75960" />
        <Circle cx="115" cy="70" r="3" fill="#34c75960" />
      </Svg>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e4f5e8",
  },
});
