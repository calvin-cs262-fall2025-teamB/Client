import { AuthProvider } from "@/contexts/AuthContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { Stack } from "expo-router";
import { useTokenSync } from "@/data/useTokenSync";

function AppContent() {
  // Sync JWT tokens between AuthContext and HybridDataService
  useTokenSync();
  
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DatabaseProvider>
  );
}
