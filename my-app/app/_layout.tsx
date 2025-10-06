import { Stack } from "expo-router";
import { useState } from "react";

//I'm just renaming Stack.Screen to Screen for simplicity
const Screen = Stack.Screen;
console.log(Screen);

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    //this sets first page to index.tsx
    <Stack initialRouteName="login">
      <Screen name="login" options={{ headerShown: false }} />
      <Screen name="about" options={{ headerShown: false }} />
    </Stack>
  );
}
