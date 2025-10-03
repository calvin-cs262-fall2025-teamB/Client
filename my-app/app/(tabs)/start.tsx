import { Text, View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

export default function Start() {
  const handleLandmarkPress = (landmarkNumber: number) => {
    console.log(`Landmark ${landmarkNumber} button pressed`);
    // You can add navigation to specific landmark screens here later
    // router.push(`/landmark${landmarkNumber}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Start</Text>
        
        <View style={styles.landmarkButtonsContainer}>
          {[1, 2, 3, 4, 5].map((number) => (
            <TouchableOpacity 
              key={number}
              style={styles.landmarkButton} 
              onPress={() => handleLandmarkPress(number)}
            >
              <Text style={styles.landmarkButtonText}>Landmark {number}</Text>
            </TouchableOpacity>
          ))}
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
  landmarkButtonsContainer: {
    marginBottom: 30,
    gap: 15,
  },
  landmarkButton: {
    backgroundColor: "#34C759",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  landmarkButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});