import { Stack } from "expo-router";
//I'm just renaming Stack.Screen to Screen for simplicity
// const Screen = Stack.Screen;
// console.log(Screen);

// export default function RootLayout() {
//   return (
//     //this sets first page to index.tsx
//     <Stack>
//       <Screen name="login" options={{ headerShown: false }} />
//       <Screen name="signin" options={{ headerShown: false }} />
//       <Screen name="about" options={{ headerShown: false }} />
//     </Stack>
//   );
// }

export default function RootLayout() {
  // Let file-system routing auto-wire screens. Use screenOptions to set defaults.
  return <Stack screenOptions={{ headerShown: false }} />;
}
