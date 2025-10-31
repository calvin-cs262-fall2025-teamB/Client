import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateAdventure() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
          <View style={styles.topBar}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#25292e" />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Create Adventure</Text>
          <TextInput
            placeholder="Adventure name"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            returnKeyType="done"
          />
          <TextInput
            placeholder="Short description"
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            multiline
            value={shortDesc}
            onChangeText={setShortDesc}
            textAlignVertical="top"
          />
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
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
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBar: {
    height: 44,
    justifyContent: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    // gap is not supported across all RN versions; use margin on the text instead
    // leave layout as row; spacing applied on backText
  },
  backText: {
    fontSize: 16,
    color: "#25292e",
    marginLeft: 8,
  },
});
