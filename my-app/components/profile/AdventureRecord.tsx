import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import themes from "../../assets/utils/themes";
const completedAdventures = [
  { id: 1, title: "Campus History Tour", completed: true, tokens: 25 },
  { id: 2, title: "Hidden Art Walk", completed: true, tokens: 30 },
  { id: 3, title: "Science Building Quest", completed: true, tokens: 20 },
  { id: 4, title: "Athletic Heritage Trail", completed: false, progress: 60 },
  { id: 5, title: "Ecosystem Discovery", completed: true, tokens: 15 },
];

export default function AdventureRecord() {
  // ============================================================================
  // MOCK DATA - Replace with actual PostgreSQL data via Azure API
  // ============================================================================
  // TODO: Fetch user's adventures from Azure backend
  // Expected API endpoint: GET https://your-app.azurewebsites.net/api/users/{userId}/adventures
  // Expected PostgreSQL query:
  // SELECT
  //   a.id,
  //   a.title,
  //   ua.completed,
  //   ua.tokens_earned as tokens,
  //   ua.progress_percentage as progress
  // FROM user_adventures ua
  // JOIN adventures a ON ua.adventure_id = a.id
  // WHERE ua.user_id = $1
  // ORDER BY ua.last_updated DESC;
  //
  // Implementation example:
  // const { data: completedAdventures, isLoading } = useQuery({
  //   queryKey: ['userAdventures', user?.id],
  //   queryFn: async () => {
  //     const response = await fetch(
  //       `https://your-app.azurewebsites.net/api/users/${user.id}/adventures`,
  //       { headers: { 'Authorization': `Bearer ${authToken}` } }
  //     );
  //     return response.json();
  //   }
  // });

  // ============================================================================
  const router = useRouter();

  const handleAdventurePress = (adventure: {
    id: number;
    title: string;
    completed: boolean;
  }) => {
    // Navigate using expo-router to the AdventureView screen with the adventureId as a query param
    router.push(
      `/adventureView?adventureId=${adventure.id}&completed=${adventure.completed}`
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>My Adventures</Text>
      <View style={styles.adventuresContainer}>
        {completedAdventures.map((adventure) => (
          <TouchableOpacity
            key={adventure.id}
            style={[
              styles.adventureCard,
              !adventure.completed && styles.incompleteCard,
            ]}
            onPress={() => handleAdventurePress(adventure)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  adventure.completed
                    ? styles.completedIconBg
                    : styles.incompleteIconBg,
                ]}
              >
                <Text style={styles.adventureIcon}>🗺️</Text>
              </View>

              {/* Title and Info */}
              <View style={styles.textContainer}>
                <Text
                  style={[
                    styles.adventureTitle,
                    !adventure.completed && styles.incompleteTitle,
                  ]}
                >
                  {adventure.title}
                </Text>
                {adventure.completed ? (
                  <View style={styles.rewardContainer}>
                    <FontAwesome6
                      name="coins"
                      size={14}
                      color="#FFD700"
                      solid
                    />
                    <Text style={styles.rewardText}>
                      {adventure.tokens} tokens earned
                    </Text>
                  </View>
                ) : (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${adventure.progress || 0}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {adventure.progress || 0}% complete
                    </Text>
                  </View>
                )}
              </View>

              {/* Status Badge */}
              {adventure.completed && (
                <View style={styles.completedBadge}>
                  <FontAwesome6 name="check" size={16} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  adventureCard: {
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  adventureIcon: {
    fontSize: 28,
  },
  adventuresContainer: {
    gap: 8,
  },
  adventureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: themes.primaryColorDark,
    marginBottom: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: themes.primaryColor,
    justifyContent: "center",
    alignItems: "center",
  },
  completedIconBg: {
    backgroundColor: themes.primaryColorLight,
  },
  incompleteCard: {
    backgroundColor: "#f9f9f9",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  incompleteIconBg: {
    backgroundColor: "#f0f0f0",
  },
  incompleteTitle: {
    color: themes.primaryColorGreyDark,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressContainer: {
    gap: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: themes.primaryColor,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: themes.primaryColorGreyDark,
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rewardText: {
    fontSize: 13,
    color: themes.primaryColorGreyDark,
  },
  section: {
    padding: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: themes.primaryColorDark,
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
  },
});
