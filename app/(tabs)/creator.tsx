//TODO: Work on the creat experience

import Button from "@/components/home/Button";
import { HelpModal } from "@/components/reusable/help/HelpModal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
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
      {/* Guides / Instructions */}
      <View style={styles.guideContainer}>
        <Text style={styles.guideTitle}>Quick Guide — Create a Region</Text>
        <Text style={styles.guideStep}>
          1) Name the region — enter a clear, unique name first.
        </Text>
        <Text style={styles.guideStep}>
          2) Open the map — center on the area where the region will be.
        </Text>
        <Text style={styles.guideStep}>
          3) Place landmarks — tap the map to drop landmarks (points of
          interest) around the location.
        </Text>
        <Text style={styles.guideStep}>
          4) Choose other settings — (visibility, access, radius, tags, etc.).
        </Text>
        <Text style={styles.guideStep}>
          5) Create — tap Create. The app will build the region using the
          landmarks you placed.
        </Text>

        <Text style={[styles.guideTitle, { marginTop: 18 }]}>
          Quick Guide — Create an Adventure
        </Text>
        <Text style={styles.guideStep}>
          1) Name the adventure — give it a short, memorable title.
        </Text>
        <Text style={styles.guideStep}>
          2) Pick a region — choose an existing region where this adventure will
          run.
        </Text>
        <Text style={styles.guideStep}>
          3) Place tokens — drop token locations (the things players find) on
          the region map.
        </Text>
        <Text style={styles.guideStep}>
          4) Write clues — add a short clue or hint for each token.
        </Text>
        <Text style={styles.guideStep}>
          5) Choose other settings — (difficulty, time limit, rewards, privacy,
          etc.).
        </Text>
        <Text style={styles.guideStep}>
          6) Create — tap Create to publish the adventure.
        </Text>
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
