import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from "expo-router";

import CompletedAdventuresSection from '@/components/profile/CompletedAdventuresButtons'

export default function Profile() {
  // Static data that will be replaced with dynamic data
  const statsData = [
    'Total Tokens: 0',
    'Adventures Completed: 0', 
    'Adventure Upvotes: 0',
    'Completion Rate: 0%'
  ];
  
  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.content}>
        <Text style={styles.title}>Profile Name</Text>
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
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
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
