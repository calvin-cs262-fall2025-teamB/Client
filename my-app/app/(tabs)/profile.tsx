//Methods
import { useState } from "react";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";

//Components
import { Text, View, StyleSheet, ScrollView, TextInput } from "react-native";
import CompletedAdventuresSection from "@/components/profile/CompletedAdventuresButtons";
import ImageHolder from "@/components/profile/ImageHolder";
import DisplayList from "@/components/reusable/displayList";
import Button from "@/components/home/Button";

//Icons
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AntDesign from "@expo/vector-icons/AntDesign";

//Colors
import themes from "@/assets/utils/themes";

//TODO:
/**
 * 1. Create templates for all the pages after finishing ptofile
 * 2. Create Context APIS for all the pages
 * 3. Start working on the create page
 * 4. Create color scheme
 * 5. Separate completed adventures from incomplete ones
 */

export default function Profile() {
  const { user, editUsername } = useAuth();

  const [showStats, setShowStats] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempEditName, setTempEditName] = useState(user);

  //TODO: Go through image selecting code -- lowest priority
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
  /* TODO: use floating point to ajust the camera icons position */
  /* TODO: figure out why 'user' displays nothing */
  /* TODO: Figure out how to hide stats withoutdistorting the screen */
  /*TDOD:  Fix DisplatList */
  /* {showStats ? DisplayList({ items: statsData }) : <View />} */

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContent}>
        <View style={{ position: "relative" }}>
          <ImageHolder
            imgSource={PlaceholderImage}
            selectedImage={selectedImage}
          />

          <FontAwesome6
            onPress={pickImageAsync}
            name="camera"
            size={36}
            color={themes.primaryColorGreyDark}
            style={{
              position: "absolute",
              bottom: 0, // floating-point values allowed
              right: 15,
            }}
          />
        </View>

        <View
          style={
            isEditing
              ? styles.profileEditContainer__editing
              : styles.profileEditContainer
          }
        >
          <TextInput
            style={styles.profileName}
            value={tempEditName}
            editable={isEditing}
            onChangeText={(text) => {
              setTempEditName(text);
            }}
            onSubmitEditing={() => {
              editUsername(tempEditName);
              setIsEditing(false);
            }}
            returnKeyType="done"
          />
          <FontAwesome6
            name={isEditing ? "check" : "edit"}
            size={24}
            // Make bold
            color={themes.primaryColorDark}
            onPress={() => {
              setIsEditing(!isEditing);
            }}
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
              color={themes.textColorLight}
              onPress={() => setShowStats(!showStats)}
            />
          ) : (
            <AntDesign
              name="line"
              size={16}
              color={themes.textColorLight}
              onPress={() => setShowStats(!showStats)}
            />
          )}
        </View>

        {showStats && <DisplayList fontSize={18} items={statsData} />}
      </View>
      )
      <CompletedAdventuresSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.backgroundColorLight,
  },
  content: {
    padding: 20,
    paddingTop: 60, // Extra padding to move title to top
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: themes.primaryColorDark,
  },
  profileEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 25,
    marginTop: 10,
  },
  profileEditContainer__editing: {
    backgroundColor: themes.primaryColorLight,
    padding: 8,
    borderRadius: 8,
    width: "75%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

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

  statItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statText: { fontSize: 16, fontWeight: "bold", color: themes.textColorLight },
  statsTitleContainer: {
    backgroundColor: themes.primaryColor,
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
});
