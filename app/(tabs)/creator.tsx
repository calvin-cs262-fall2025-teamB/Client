//TODO: Work on the creat experience

import Button from "@/components/home/Button";
import { HelpModal } from "@/components/reusable/help/HelpModal";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  View
} from "react-native";

export default function Creator() {
  const router = useRouter();

  const handleCreateRegion = () => router.push("/(tabs)/createRegion");
  const handleCreateAdventure = () => router.push("/(tabs)/createAdventure");

  return (
    <ScrollView style={styles.container}>
      <HelpModal 
        pageId="creator" 
        position="top-right"
        iconColor="#007AFF"
      />
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
            </View>
            <View style={styles.actionRow}>
              <Button
                size="large"
                theme="primary"
                label="Create Adventure"
                onPress={handleCreateAdventure}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
    paddingTop: 60, // Extra padding to move title to top
  },
  guideContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eaeaea",
  },
  guideStep: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
    lineHeight: 20,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  hintText: {
    color: "#666",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    maxWidth: 420,
  },
  infoButton: {
    marginLeft: 6,
    padding: 6,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
});
