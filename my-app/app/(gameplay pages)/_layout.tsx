import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    //TODO: figure out how to add the back button
    <Stack>
      <Stack.Screen name="adventurePage" options={{ headerShown: false }} />
      <Stack.Screen name="adventureView" options={{ headerShown: false }} />
    </Stack>
  );
}

// export default function RootLayout() {
//   // Let file-system routing auto-wire screens. Use screenOptions to set defaults.
//   return <Stack screenOptions={{ headerShown: false }} />;
// }
