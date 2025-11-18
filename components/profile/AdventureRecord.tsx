import { CompletedAdventure, Adventure as DbAdventure } from "@/types";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useDatabase } from "../../contexts/DatabaseContext";

import themes from "../../assets/utils/themes";

// Interface for display adventures
interface DisplayAdventure {
  id: number;
  title: string;
  tokens: number;
  completionDate?: string | null;
}
// Mock data fallback for development
const MOCK_COMPLETED_ADVENTURES = [
  { id: 1, title: "Campus History Tour", tokens: 25 },
  { id: 2, title: "Hidden Art Walk", tokens: 30 },
  { id: 3, title: "Science Building Quest", tokens: 20 },
  { id: 4, title: "Athletic Heritage Trail", tokens: 35 },
  { id: 5, title: "Ecosystem Discovery", tokens: 15 },
];

export default function AdventureRecord() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    adventures, 
    completedAdventures, 
    loading, 
    errors, 
    fetchAdventures, 
    fetchCompletedAdventures 
  } = useDatabase();

  // Load user's completed adventures
  useEffect(() => {
    if (user?.id) {
      fetchCompletedAdventures(user.id);
      fetchAdventures(); // Also fetch adventures for full data
    }
  }, [user?.id, fetchCompletedAdventures, fetchAdventures]);

  // Transform database data to UI format
  const transformedAdventures = completedAdventures?.map((completed: CompletedAdventure) => {
    const adventure = adventures?.find((adv: DbAdventure) => adv.id === completed.adventureId);
    return {
      id: completed.adventureId,
      title: adventure?.name || `Adventure ${completed.adventureId}`,
      tokens: adventure?.numTokens || 0,
      completionDate: completed.completionDate,
    };
  }) || [];

  // Use transformed data or fallback to mock data if empty or in development
  const displayAdventures = transformedAdventures.length > 0 
    ? transformedAdventures 
    : (errors.completedAdventures && __DEV__ ? MOCK_COMPLETED_ADVENTURES : []);

  const handleAdventurePress = (adventure: DisplayAdventure) => {
    // Navigate using expo-router to the AdventureView screen with the adventureId as a query param
    router.push(
      `/adventureView?adventureId=${adventure.id}&completed=true`
    );
  };

  // Show loading indicator
  if (loading.completedAdventures || loading.adventures) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completed Adventures</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themes.primaryColor} />
          <Text style={styles.loadingText}>Loading your adventures...</Text>
        </View>
      </View>
    );
  }

  // Show error state if API fails and no fallback data
  if (errors.completedAdventures && displayAdventures.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completed Adventures</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Unable to load adventures</Text>
          <Text style={styles.emptySubtext}>Please check your connection and try again</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Completed Adventures</Text>
      <View style={styles.adventuresContainer}>
        {displayAdventures.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No completed adventures yet</Text>
            <Text style={styles.emptySubtext}>Start exploring to see your achievements here!</Text>
          </View>
        ) : (
          displayAdventures.map((adventure: DisplayAdventure) => (
          <TouchableOpacity
            key={adventure.id}
            style={styles.adventureCard}
            onPress={() => handleAdventurePress(adventure)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              {/* Icon */}
              <View style={[styles.iconContainer, styles.completedIconBg]}>
                <Text style={styles.adventureIcon}>🗺️</Text>
              </View>

              {/* Title and Info */}
              <View style={styles.textContainer}>
                <Text style={styles.adventureTitle}>
                  {adventure.title}
                </Text>

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
              </View>
            </View>
          </TouchableOpacity>
          ))
        )}
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

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: themes.primaryColorGreyDark,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: themes.primaryColorDark,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: themes.primaryColorGreyDark,
    textAlign: 'center',
  },
});
