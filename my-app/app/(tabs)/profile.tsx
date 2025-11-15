// import { useAuth } from "@/contexts/AuthContext"; // unused
import { ProfileProvider } from "@/contexts/ProfileContext";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Components
import AdventureRecord from "@/components/profile/AdventureRecord";
import ImageHolder from "@/components/profile/ImageHolder";
// ProgressRing component is not used in this file at the moment
// import ProgressRing from "@/components/profile/ProgressRing";
import StatCard from "@/components/profile/StatCard";

// Icons
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

// Colors
import themes from "@/assets/utils/themes";
import ProfileForm from "@/components/profile/ProfileForm";

/*Sign Up
{
Full Name: string,
Email: string,
Password: encrypted,
ImageURL: string (optional),
Adventures: [AdventureID], // the adventures a user has started / finished playing,
CollectedTokens: number, Associated with adventures completed
}


*/
export default function Profile() {
  //TODO: use profile context to manage the user's state
  const [viewingInfo, setViewingInfo] = useState(false);
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
      setSelectedImage(result.assets[0].uri);

      // TODO: Upload image to Azure storage and update user profile
      // Example implementation:
      // const formData = new FormData();
      // formData.append('profileImage', { uri: result.assets[0].uri, type: 'image/jpeg', name: 'profile.jpg' });
      // await fetch('https://your-azure-endpoint.azurewebsites.net/api/users/profile/image', {
      //   method: 'POST',
      //   body: formData,
      //   headers: { 'Authorization': `Bearer ${authToken}` }
      // });
    } else {
      alert("You did not select any image.");
    }
  };

  // ============================================================================
  // MOCK DATA - Replace with actual PostgreSQL data via Azure API
  // ============================================================================
  // TODO: Fetch user stats from Azure backend
  // Expected API endpoint: GET https://your-app.azurewebsites.net/api/users/{userId}/stats
  // Expected response shape:
  // {
  //   totalTokens: number,
  //   adventuresCompleted: number,
  //   adventuresTotal: number,
  //   upvotes: number,
  //   completionRate: number
  // }
  //
  // Implementation example:
  // const { data: userStats, isLoading } = useQuery({
  //   queryKey: ['userStats', user?.id],
  //   queryFn: async () => {
  //     const response = await fetch(`https://your-app.azurewebsites.net/api/users/${user.id}/stats`);
  //     return response.json();
  //   }
  // });

  const userStats = {
    totalTokens: 125,
    adventuresCompleted: 8,
    adventuresTotal: 12,
    upvotes: 42,
    completionRate: 67, // percentage
  };
  // ============================================================================

  return (
    <ProfileProvider>
      <ScrollView style={styles.container}>
        {/* Gradient Header */}
        <LinearGradient
          colors={["#4ed964", "#4ed964", "#4ed964"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientHeader}
        >
          {/* Profile Image */}
          <View style={styles.imageSection}>
            <View style={styles.imageWrapper}>
              <ImageHolder
                imgSource={PlaceholderImage}
                selectedImage={selectedImage}
              />
              <TouchableOpacity
                onPress={pickImageAsync}
                style={styles.cameraButton}
              >
                <FontAwesome6
                  name="camera"
                  size={20}
                  color={themes.backgroundColorLight}
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        {/* TODO: Set Hover and active nav*/}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setViewingInfo(false)}
            style={[
              styles.nav,
              !viewingInfo ? styles.navActive : styles.navInactive,
            ]}
          >
            <Text onPress={() => setViewingInfo(false)}>My experience</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewingInfo(true)}
            style={[
              styles.nav,
              viewingInfo ? styles.navActive : styles.navInactive,
            ]}
          >
            <Text onPress={() => setViewingInfo(true)}>Personal Info</Text>
          </TouchableOpacity>
        </View>

        {!viewingInfo ? (
          <>
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Detailed Statistics</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  icon="coins"
                  iconFamily="fontawesome"
                  value={userStats.totalTokens}
                  label="Total Tokens"
                  color="#FFD700"
                />
                <StatCard
                  icon="map-location-dot"
                  iconFamily="fontawesome"
                  value={userStats.adventuresCompleted}
                  label="Completed"
                  color="#34c759"
                />
              </View>
              <View style={styles.statsGrid}>
                <StatCard
                  icon="trophy"
                  iconFamily="fontawesome"
                  value={userStats.upvotes}
                  label="Upvotes"
                  color="#FF9500"
                />
              </View>
            </View>

            {/* Completed Adventures */}
            <AdventureRecord />

            {/* Bottom Padding */}
            <View style={styles.bottomPadding} />
          </>
        ) : (
          <ProfileForm />
        )}
      </ScrollView>
    </ProfileProvider>
  );
}

const styles = StyleSheet.create({
  bottomPadding: {
    height: 40,
  },
  cameraButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: themes.primaryColor,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 12,
  },

  gradientHeader: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  imageSection: {
    alignItems: "center",
  },
  imageWrapper: {
    position: "relative",
  },
  nav: {
    // fontSize: 16,
    padding: 10,
  },
  navText: {
    fontSize: 16,
  },
  navActive: {
    backgroundColor: themes.primaryColor,
    borderColor: themes.primaryColor,
    borderRadius: 5,
    borderStyle: "dashed",
  },
  navInactive: {
    backgroundColor: "transparent",
  },
  progressBold: {
    fontWeight: "bold",
    color: themes.primaryColor,
    fontSize: 18,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  progressSection: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressStats: {
    flex: 1,
  },
  progressSubtext: {
    fontSize: 14,
    color: themes.primaryColorGreyDark,
    fontStyle: "italic",
  },
  progressText: {
    fontSize: 16,
    color: themes.primaryColorDark,
    marginBottom: 8,
  },
  quickStatBadge: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  quickStatContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
  },
  quickStatIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.9,
    marginTop: 2,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: themes.primaryColorDark,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statsSection: {
    padding: 20,
    paddingTop: 16,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 20,
    justifyContent: "space-around",
  },
  username: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  usernameDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  usernameInput: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    minWidth: 150,
  },
  usernameSection: {
    alignItems: "center",
    marginBottom: 20,
  },
});
