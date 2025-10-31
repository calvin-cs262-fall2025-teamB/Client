import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
//Notes: green

//TODO
export default function TabLayout() {
  return (
    <AuthProvider>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: "#007AFF",
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
          name="adventurePageTemplate"
          options={{
            title: "Adventure",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="compass" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "profile",
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}
