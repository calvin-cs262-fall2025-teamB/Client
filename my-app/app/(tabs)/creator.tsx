//TODO: Work on the creat experience

import Button from "@/components/home/Button";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View, Alert, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Creator() {
  const router = useRouter();

  const handleCreateRegion = () => router.push("/creator/region");
  const handleCreateAdventure = () => router.push("/creator/adventure");

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.centered}>
          <View style={styles.buttonWrapper}>
            <View style={styles.actionRow}>
              <Button
                size="large"
                theme="primary"
                label="Create Region"
                onPress={handleCreateRegion}
              />
              <Pressable
                style={styles.infoButton}
                onPress={() =>
                  Alert.alert(
                    "Region",
                    "A region is a defined area composed of landmarks (points of interest), essentially a template map where your adventure will take place."
                  )
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={26}
                  color="#666"
                />
              </Pressable>
            </View>
            <View style={styles.actionRow}>
              <Button
                size="large"
                theme="primary"
                label="Create Adventure"
                onPress={handleCreateAdventure}
              />
              <Pressable
                style={styles.infoButton}
                onPress={() =>
                  Alert.alert(
                    "Adventure",
                    "An adventure is a guided sequence of tokens to collect inside a region, with tasks or descriptions for users to follow."
                  )
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={26}
                  color="#666"
                />
              </Pressable>
            </View>
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
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoButton: {
    marginLeft: 6,
    padding: 6,
  },
  hintText: {
    color: "#666",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    maxWidth: 420,
  },
});
