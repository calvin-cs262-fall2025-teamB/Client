//Methods
import { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";

//Components
import { Text, View, StyleSheet, ScrollView } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import CompletedAdventuresSection from "@/components/profile/CompletedAdventuresButtons";
import ImageHolder from "@/components/profile/ImageHolder";
import Button from "@/components/home/Button";

export default function Profile() {
  const { user } = useAuth();

  //TODO: Go through image selecting code.
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );
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
          <Text style={styles.profileName}>{user || "Jack Scoone"}</Text>
          <FontAwesome6 name="edit" size={24} color="black" />
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsContainer}>
          {statsData.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statText}>{stat}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Completed Adventures Section */}
      <CompletedAdventuresSection />
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
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
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
  statText: {
    fontSize: 16,
    color: "#555",
  },
});
