import { View, Text, StyleSheet, TextInput } from "react-native";

export default function CreateRegion() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Region</Text>
      <TextInput placeholder="Region name" style={styles.input} />
      <TextInput placeholder="Description" style={[styles.input, { height: 100 }]} multiline />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});
