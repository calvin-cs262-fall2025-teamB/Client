import { StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Button from "@/components/home/Button";

export default function CreateAdventure() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Adventure</Text>
      <TextInput
        placeholder="Adventure name"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Short description"
        style={[styles.input, { height: 100 }]}
        multiline
        value={shortDesc}
        onChangeText={setShortDesc}
      />

      <View style={{ marginTop: 12 }}>
        <Button theme="primary" label="Back" onPress={() => router.back()} />
      </View>
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
