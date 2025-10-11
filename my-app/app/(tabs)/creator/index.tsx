import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Button from "@/components/home/Button";

export default function CreatorIndex() {
  const router = useRouter();

  const handleCreateRegion = () => {
    router.push("/creator/region");
  };

  const handleCreateAdventure = () => {
    router.push("/creator/adventure");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create</Text>

      <View style={styles.buttonContainer}>
        <Button theme="primary" label="Create Region" onPress={handleCreateRegion} />
        <Button theme="primary" label="Create Adventure" onPress={handleCreateAdventure} />
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
