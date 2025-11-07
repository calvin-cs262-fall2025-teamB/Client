import { Text, StyleSheet } from "react-native";

export default function AppTitle() {
  return <Text style={styles.appTitle}>WayFind</Text>;
}

const styles = StyleSheet.create({
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#16A34A",
    marginBottom: 24,
    textAlign: "center",
  },
});
