//Methods
import { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";

//Components
import { Text, View, StyleSheet, ScrollView } from "react-native";
import CompletedAdventuresSection from "@/components/profile/CompletedAdventuresButtons";
import ImageHolder from "@/components/profile/ImageHolder";
import DisplayList from "@/components/reusable/displayList";
import Button from "@/components/home/Button";

//Icons
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";

//Colors
const primaryColor = "#34c759";
const primaryColorLight = "#aeeabd";
const primaryColorDark = "#041007";
const backgroundColorLight = "#EFFBF2";

//TODO:
/**
 * 1. Create templates for all the pages after finishing ptofile
 * 2. Create Context APIS for all the pages
 * 3. Start working on the create page
 * 4. Create color scheme
 */

export default function Profile() {
  const { user } = useAuth();

  //TODO: Go through image selecting code -- lowest priority
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
  const [showStats, setShowStats] = useState(false);

  const PlaceholderImage = require("@/assets/images/icon.png");

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      // console.log(result);
      setSelectedImage(result.assets[0].uri);
    } else {
      alert("You did not select any image.");
    }
  };

  // Static data that will be replaced with dynamic data
  const statsData = [
    "Total Tokens: 0",
    "Adventures Completed: 0",
    "Adventure Upvotes: 0",
    "Completion Rate: 0%",
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileContent}>
        <ImageHolder
          imgSource={PlaceholderImage}
          selectedImage={selectedImage}
        />
        {/* TODO: use floating point to ajust the camera icons position */}
        <FontAwesome6
          onPress={pickImageAsync}
          name="camera"
          size={24}
          color="black"
        />
        {/* TODO: figure out why 'user' displays nothing */}
        <View style={styles.profileEditContainer}>
          <Text style={styles.profileName}>{user || "Beautiful Boys"}</Text>
          <FontAwesome6
            name="edit"
            size={24}
            // Make bold
            color={primaryColor}
          />
        </View>
      </View>
      {/* Stats Section */}(
      <View style={styles.content}>
        <View style={styles.statsTitleContainer}>
          <Text style={styles.statText}>Stats</Text>
          {!showStats ? (
            <AntDesign
              name="down"
              size={16}
              color={primaryColor}
              onPress={() => setShowStats(!showStats)}
            />
          ) : (
            <AntDesign
              name="line"
              size={16}
              color={primaryColor}
              onPress={() => setShowStats(!showStats)}
            />
          )}
        </View>

        {/* TODO: Figure out how to hide stats withoutdistorting the screen */}
        {showStats && (
          <View style={styles.statsContainer}>
            {statsData.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statText}>{stat}</Text>
              </View>
            ))}
          </View>
        )}
        {/*TDOD:  Fix DisplatList */}
        {/* {showStats ? DisplayList({ items: statsData }) : <View />} */}
      </View>
      ){/* Completed Adventures Section */}
      <CompletedAdventuresSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColorLight,
  },
  content: {
    padding: 20,
    paddingTop: 60, // Extra padding to move title to top
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: primaryColorDark,
  },
  profileEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  profileContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  statsContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statText: { fontSize: 16, fontWeight: "bold", color: "#555" },
  statsTitleContainer: {
    backgroundColor: primaryColorLight,
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
});
