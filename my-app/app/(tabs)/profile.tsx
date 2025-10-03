import { Text, View, StyleSheet, ScrollView } from "react-native";
import { router } from "expo-router";

export default function Profile() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        
        <View style={styles.landmarksContainer}>
          <Text style={styles.landmarksTitle}>Landmarks</Text>
          <View style={styles.landmarksBox}>
            {/* This box will hold images or icons */}
          </View>
        </View>
      </View>
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
  landmarksContainer: {
    marginBottom: 30,
  },
  landmarksTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  landmarksBox: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    minHeight: 200,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
