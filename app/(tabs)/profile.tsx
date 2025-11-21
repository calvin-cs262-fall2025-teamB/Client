import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  const { user } = useAuth();
  const {
    adventures,
    completedAdventures,
    tokens,
    loading,
    errors,
    fetchAdventures,
    fetchCompletedAdventures,
    fetchTokens,
  } = useDatabase();

  const [viewingInfo, setViewingInfo] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    undefined
  );

  const PlaceholderImage = require("@/assets/images/icon.png");

  // Load user data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchCompletedAdventures(user.id);
      fetchAdventures();
      fetchTokens();
    }
  }, [user?.id, fetchCompletedAdventures, fetchAdventures, fetchTokens]);

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

  // Calculate user stats from database context
  const userStats = useMemo(() => {
    const userCompletedAdventures = completedAdventures || [];
    const userCreatedAdventures = adventures?.filter((adv: any) => adv.adventurerId === user?.id) || [];
    
    // Debug logging
    if (__DEV__) {
      console.log('PROFILE STAT DEBUG');
      console.log('Profile stats calculation:');
      console.log('- User ID:', user?.id);
      console.log('- Completed adventures:', userCompletedAdventures.length);
      console.log('- Total adventures available:', adventures?.length || 0);
      console.log('- Sample completed adventure:', userCompletedAdventures[0]);
      console.log('- Sample adventure:', adventures?.[0]);
    }
    
    // Calculate total tokens from completed adventures with enhanced field mapping
    const totalTokens = userCompletedAdventures.reduce((sum: number, completed: any, index: number) => {
      // Handle different field naming conventions for adventure ID
      const adventureId = completed.adventureId || completed.adventureid || completed.adventure_id;
      
      // Find matching adventure with flexible ID matching
      const adventure = adventures?.find((adv: any) => {
        const advId = adv.id || adv.adventureid || adv.adventure_id;
        return advId === adventureId;
      });
      
      // Handle different field naming conventions for token count
      const tokenCount = adventure?.numTokens || adventure?.numtokens || adventure?.num_tokens || adventure?.tokencount || 0;
      
      if (__DEV__ && index < 3) { // Log first 3 for debugging
        console.log(`Token calculation ${index + 1}:`, {
          completedAdventureId: adventureId,
          foundAdventure: !!adventure,
          adventureName: adventure?.name || adventure?.adventurename,
          tokenCount,
          runningSum: sum + tokenCount
        });
      }
      
      return sum + tokenCount;
    }, 0);
    
    // Calculate completion rate
    const totalAvailableAdventures = adventures?.length || 0;
    const completionRate = totalAvailableAdventures > 0 
      ? Math.round((userCompletedAdventures.length / totalAvailableAdventures) * 100)
      : 0;
    
    // Type transformation: Add upvote property (not in database data)
    // Generate upvotes based on completed adventures and created adventures
    // This is a mock calculation since upvotes aren't stored in the database
    const upvotes = Math.max(0, 
      (userCompletedAdventures.length * 3) + // 3 upvotes per completed adventure
      (userCreatedAdventures.length * 5) +   // 5 upvotes per created adventure
      Math.floor(totalTokens / 10)          // 1 upvote per 10 tokens
    );
    
    // Alternative token calculation: check if tokens are directly in completed adventures
    const alternativeTokens = userCompletedAdventures.reduce((sum: number, completed: any) => {
      const directTokens = completed.tokens || completed.tokencount || completed.token_count || 0;
      return sum + directTokens;
    }, 0);
    
    // Use the higher of the two calculations (in case one method works better)
    const finalTokens = Math.max(totalTokens, alternativeTokens);
    
    if (__DEV__) {
      console.log('Token calculation results:', {
        fromAdventureData: totalTokens,
        fromCompletedData: alternativeTokens,
        finalTotal: finalTokens,
        completedAdventures: userCompletedAdventures.length,
        availableAdventures: totalAvailableAdventures
      });
    }
    
    return {
      totalTokens: finalTokens,
      adventuresCompleted: userCompletedAdventures.length,
      adventuresTotal: totalAvailableAdventures,
      upvotes, // Type transformation: not in database but required for UI
      completionRate,
    };
  }, [completedAdventures, adventures, user?.id]);

  // Show loading state while data is being fetched
  const isLoading = loading.completedAdventures || loading.adventures || loading.tokens;
  
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
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={themes.primaryColor} />
                  <Text style={styles.loadingText}>Loading your stats...</Text>
                </View>
              ) : (
                <>
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
                </>
              )}
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: themes.primaryColorDark,
    marginTop: 12,
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
