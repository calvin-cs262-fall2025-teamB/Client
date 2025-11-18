import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import themes from "@/assets/utils/themes";
import { HomeProvider } from "../../contexts/HomeContext";

//TODO
export default function TabLayout() {
  return (
    <HomeProvider>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: themes.primaryColor,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
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
            title: "profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </HomeProvider>
  );
}
