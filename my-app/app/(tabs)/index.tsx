import { Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import Button from "@/components/home/Button";

export default function Index() {
  const router = useRouter();

  const handleProfilePress = () => {
    router.push("/profile");
  };

  const handleStartPress = () => {
    router.push("/start");
  };

  const handleMapPress = () => {
    router.push("/map");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Four Beautiful Guys!</Text>

      <View style={styles.buttonContainer}>
        <Button theme="primary" label="Profile" onPress={handleProfilePress} />
        <Button theme="primary" label="Start" onPress={handleStartPress} />
        <Button theme="primary" label="Map" onPress={handleMapPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 50,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 15,
  },
});

