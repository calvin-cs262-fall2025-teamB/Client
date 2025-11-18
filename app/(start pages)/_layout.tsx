import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    //this sets first page to index.tsx
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signin" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
    </Stack>
  );
}

// export default function RootLayout() {
//   // Let file-system routing auto-wire screens. Use screenOptions to set defaults.
//   return <Stack screenOptions={{ headerShown: false }} />;
// }
