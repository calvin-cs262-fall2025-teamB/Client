import { AuthProvider } from "@/contexts/AuthContext";
import { HomeProvider } from "@/contexts/HomeContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <HomeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </HomeProvider>
    </AuthProvider>
  );
}
