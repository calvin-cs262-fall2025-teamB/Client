import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';


export default function CompletedAdventuresSection() {
  // Adventure data that will eventually come from database
  const completedAdventures = [
    { id: 1, title: 'Downtown Explorer', completed: true },
    { id: 2, title: 'Historic District Tour', completed: true },
    { id: 3, title: 'Waterfront Adventure', completed: true },
    { id: 4, title: 'Campus Quest', completed: false },
    { id: 5, title: 'Park Discovery', completed: true },
  ];
  
  const handleAdventurePress = (adventure: { id: number; title: string; completed: boolean }) => {
    console.log(`Selected adventure: ${adventure.title}`);
    // TODO: Navigate to adventure details or replay
    // router.push(`/adventure/${adventure.id}`);
  };

  return (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Completed Adventures</Text>
      <View style={styles.adventuresContainer}>
        {completedAdventures.map((adventure) => (
          <TouchableOpacity
            key={adventure.id}
            style={[
              styles.adventureButton,
              adventure.completed ? styles.completedButton : styles.incompleteButton
            ]}
            onPress={() => handleAdventurePress(adventure)}
          >
            <Text style={[
              styles.adventureButtonText,
              adventure.completed ? styles.completedText : styles.incompleteText
            ]}>
              {adventure.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 60, // Extra padding to move title to top
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  adventuresContainer: {
    gap: 10,
  },
  adventureButton: {
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedButton: {
    backgroundColor: "#34C759", // Green for completed
  },
  incompleteButton: {
    backgroundColor: "#FF9500", // Orange for incomplete
  },
  adventureButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  completedText: {
    color: "#fff",
  },
  incompleteText: {
    color: "#fff",
  },
});
