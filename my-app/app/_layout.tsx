import { AuthProvider } from "@/contexts/AuthContext";
import { Slot } from "expo-router";
import { HomeProvider } from "../contexts/HomeContext";

// TODO: what is Slot
export default function RootLayout() {
  return (
    <AuthProvider>
      <HomeProvider>
        <Slot />
      </HomeProvider>
    </AuthProvider>
  );
}
