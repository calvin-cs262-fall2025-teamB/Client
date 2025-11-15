import { MOCK_ADVENTURES } from "@/components/home/MockData";

import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import themes from "@/assets/utils/themes";

import { Ionicons } from "@expo/vector-icons";

export default function AdventureView() {
  const router = useRouter();
  const { adventureId, completed } = useLocalSearchParams<{
    adventureId: string;
    completed: string;
  }>();
  const adventure = MOCK_ADVENTURES.find(
    (adventure) => adventure.id === adventureId
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={themes.primaryColor} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{adventure?.title}</Text>
        <Text style={styles.summary}>{adventure?.summary}</Text>
        <Text style={styles.description}>{adventure?.description}</Text>
        <Image source={adventure?.image_url} style={styles.image} />
        {completed === "true" ? (
          <TouchableOpacity>
            <Text>Adventure Completed!</Text>
            <Text>Play Again?</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Text>Play</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    marginTop: 50,
    maxWidth: 600,
    //  marginInline: "auto",
    justifyContent: "center",
  },
  backButton: {
    width: 50,
    height: 50,
    marginBottom: 20,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  summary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
});
