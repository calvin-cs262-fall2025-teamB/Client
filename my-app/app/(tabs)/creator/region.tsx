import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform, Alert } from "react-native";
import Button from "@/components/home/Button";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateRegion() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    Alert.alert(
      "Not implemented",
      "This feature hasn't been implemented yet.",
      [
        {
          text: "OK",
          onPress: () => router.push("/creator"),
        },
      ]
    );
  };

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

        <Text style={styles.title}>Create Region</Text>
        <TextInput
          placeholder="Region name"
          style={styles.input}
          value={name}
          onChangeText={setName}
          returnKeyType="done"
          onFocus={() => console.log('[CreateRegion] name onFocus')}
          onBlur={() => console.log('[CreateRegion] name onBlur')}
          onKeyPress={(e) => console.log('[CreateRegion] name onKeyPress', e.nativeEvent.key)}
        />
        <TextInput
          placeholder="Description"
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          multiline
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />
        <View style={styles.actionsRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Button size="large" theme="primary" label="Create" onPress={handleCreate} />
          </View>
          <Pressable style={[styles.cancelButton, { flex: 1 }]} onPress={() => router.push("/creator") }>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
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
  topBar: {
    width: "100%",
    marginBottom: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    // gap is not supported across all RN versions; use spacing on the text instead
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    color: "#25292e",
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#25292e',
    fontSize: 18,
    fontWeight: '600',
  },
});
