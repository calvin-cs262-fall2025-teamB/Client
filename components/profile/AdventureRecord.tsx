import { CompletedAdventure, Adventure as DbAdventure, Region } from "@/types";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useDatabase } from "../../contexts/DatabaseContext";

import themes from "../../assets/utils/themes";

export default function AdventureRecord() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    adventures, 
    regions,
    completedAdventures, 
    loading, 
    errors, 
    fetchAdventures, 
    fetchRegions,
    fetchCompletedAdventures 
  } = useDatabase();

  // Load user's completed adventures and related data
  useEffect(() => {
    if (user?.id) {
      fetchCompletedAdventures(user.id);
      fetchAdventures(); // Also fetch adventures for full data
      fetchRegions(); // Fetch regions for region names
    }
  }, [user?.id, fetchCompletedAdventures, fetchAdventures, fetchRegions]);

  // Get completed adventure data with proper joins
  const completedAdventureData = completedAdventures?.map((completed: CompletedAdventure) => {
    const adventure = adventures?.find((adv: DbAdventure) => adv.id === completed.adventureid);
    const region = regions?.find((r: Region) => r.id === adventure?.regionid);
    
    return {
      completed,
      adventure,
      region,
    };
  }).filter((item: { completed: CompletedAdventure; adventure: DbAdventure | undefined; region: Region | undefined }) => item.adventure) || [];

  const handleAdventurePress = (adventure: DbAdventure) => {
    // Navigate using expo-router to the AdventureView screen with the adventureId as a query param
    router.push(
      `/adventureView?adventureId=${adventure.id}&completed=true`
    );
  };

  // Show loading indicator
  if (loading.completedAdventures || loading.adventures || loading.regions) {
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

  // Show error state if API fails
  if (errors.completedAdventures) {
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
        {completedAdventureData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No completed adventures yet</Text>
            <Text style={styles.emptySubtext}>Start exploring to see your achievements here!</Text>
          </View>
        ) : (
          completedAdventureData.map((item: { completed: CompletedAdventure; adventure: DbAdventure; region?: Region }, index: number) => (
          <TouchableOpacity
            key={`${item.adventure.id}-${index}`}
            style={styles.adventureCard}
            onPress={() => handleAdventurePress(item.adventure)}
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
                  {item.adventure.name}
                </Text>
                
                {/* Region information */}
                {item.region && (
                  <View style={styles.regionContainer}>
                    <FontAwesome6
                      name="location-dot"
                      size={12}
                      color={themes.primaryColor}
                    />
                    <Text style={styles.regionText}>
                      {item.region.name}
                    </Text>
                  </View>
                )}

                <View style={styles.rewardContainer}>
                  <FontAwesome6
                    name="coins"
                    size={14}
                    color="#FFD700"
                    solid
                  />
                  <Text style={styles.rewardText}>
                    {item.adventure.numtokens || 0} tokens earned
                  </Text>
                  
                  {/* Completion date */}
                  {item.completed.completiondate && (
                    <>
                      <Text style={styles.divider}>•</Text>
                      <Text style={styles.dateText}>
                        {new Date(item.completed.completiondate).toLocaleDateString()}
                      </Text>
                    </>
                  )}
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
  regionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  regionText: {
    fontSize: 12,
    color: themes.primaryColor,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: themes.primaryColorGreyDark,
    fontStyle: 'italic',
  },
  divider: {
    fontSize: 12,
    color: themes.primaryColorGreyDark,
    marginHorizontal: 6,
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
