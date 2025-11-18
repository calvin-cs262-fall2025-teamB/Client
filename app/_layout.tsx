import { AuthProvider } from "@/contexts/AuthContext";
import { Slot } from "expo-router";
import { HomeProvider } from "../contexts/HomeContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";

// TODO: what is Slot
export default function RootLayout() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <HomeProvider>
          <Slot />
        </HomeProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
}
