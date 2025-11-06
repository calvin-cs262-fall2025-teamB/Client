import { TouchableOpacity, StyleSheet, View, Text } from "react-native";
import themes from "../../assets/utils/themes";
//Colors

export default function CompletedAdventuresSection() {
  // Adventure data that will eventually come from database
  const completedAdventures = [
    { id: 1, title: "Downtown Explorer", completed: true },
    { id: 2, title: "Historic District Tour", completed: true },
    { id: 3, title: "Waterfront Adventure", completed: true },
    { id: 4, title: "Campus Quest", completed: false },
    { id: 5, title: "Park Discovery", completed: true },
  ];

  const handleAdventurePress = (adventure: {
    id: number;
    title: string;
    completed: boolean;
  }) => {
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
              adventure.completed
                ? styles.completedButton
                : styles.incompleteButton,
            ]}
            onPress={() => handleAdventurePress(adventure)}
          >
            <Text
              style={[
                styles.adventureButtonText,
                adventure.completed
                  ? styles.completedText
                  : styles.incompleteText,
              ]}
            >
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
    fontWeight: 500,
    color: "primaryColorDark",
    textAlign: "left",
    marginBottom: 10,
  },
  adventuresContainer: {
    gap: 2,
  },
  adventureButton: {
    padding: 15,
    borderRadius: 2,
    //  shadow instead of box-shadow
    shadowColor: "#03030356",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  completedButton: {
    backgroundColor: themes.backgroundColorLight, // Green for completed
  },
  incompleteButton: {
    backgroundColor: themes.primaryColorGreyDark, // Orange for incomplete
  },
  adventureButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left",
    color: themes.primaryColorDark,
  },
  completedText: {
    color: themes.primaryColor,
  },
  incompleteText: {
    color: themes.textColorLight,
  },
});
