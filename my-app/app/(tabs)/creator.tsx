import Button from "@/components/home/Button";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Start() {
  const router = useRouter();

  const handleCreateRegion = () => {
    router.push("/creator/region");
  };

  const handleCreateAdventure = () => {
    router.push("/creator/adventure");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create</Text>

        <View style={styles.centered}>
          <View style={styles.buttonWrapper}>
            <Button size="large" theme="primary" label="Create Region" onPress={handleCreateRegion} />
            <Button size="large" theme="primary" label="Create Adventure" onPress={handleCreateAdventure} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
    paddingTop: 60, // Extra padding to move title to top
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  buttonWrapper: {
    gap: 18,
    marginTop: 10,
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});