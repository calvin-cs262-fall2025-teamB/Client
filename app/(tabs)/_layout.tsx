import themes from "@/assets/utils/themes";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

//TODO
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: themes.primaryColor,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "WayFind",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="creator"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden tab screens - these pages will have tabs but won't show in the tab bar */}
      <Tabs.Screen
        name="createRegion"
        options={{
          title: "Create Region",
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="createAdventure"
        options={{
          title: "Create Adventure",
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="createAdventureMap"
        options={{
          title: "Place Tokens",
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
