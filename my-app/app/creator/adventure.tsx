import themes from "@/assets/utils/themes";
import Button from "@/components/home/Button";
import BackButton from "@/components/reusable/BackButton";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const REGIONS = [
  { id: "calvin", label: "Calvin University Campus" },
  { id: "hope", label: "Hope College Campus" },
];

export default function CreateAdventureScreen() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedRegion(id);
    setIsOpen(false);
  };

  const handleCreate = () => {
    if (!selectedRegion) {
      Alert.alert("Select a region", "Please choose a region before creating an adventure.");
      return;
    }

    const regionLabel = REGIONS.find((r) => r.id === selectedRegion)?.label ?? "";
    Alert.alert("Adventure Created (sample)", `Region: ${regionLabel}`);

    // For this sample screen we'll simply go back to the creator hub.
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <BackButton onPress={() => router.back()} />
      </View>

      <Text style={styles.title}>Create Adventure (Sample)</Text>

      <Text style={styles.label}>Select Region</Text>
      <View style={styles.dropdownWrapper}>
        <Pressable
          style={styles.dropdown}
          onPress={() => setIsOpen((v) => !v)}
        >
          <Text style={styles.dropdownText}>
            {REGIONS.find((r) => r.id === selectedRegion)?.label ?? "Select a region..."}
          </Text>
          <FontAwesome6 name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={themes.primaryColor} />
        </Pressable>

        {isOpen && (
          <View style={styles.options}>
            {REGIONS.map((r) => (
              <Pressable
                key={r.id}
                style={styles.option}
                onPress={() => handleSelect(r.id)}
              >
                <Text style={styles.optionText}>{r.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.createRow}>
        <Button label="Create" theme="primary" size="large" onPress={handleCreate} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 20, paddingTop: 40 },
  topRow: { alignItems: "flex-start", marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "bold", color: "#222", marginBottom: 20 },
  label: { fontSize: 16, color: "#444", marginBottom: 8 },
  dropdownWrapper: { marginBottom: 20 },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dropdownText: { fontSize: 16, color: "#111" },
  options: { marginTop: 8, backgroundColor: "#fff", borderRadius: 8, overflow: "hidden" },
  option: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  optionText: { fontSize: 15, color: "#111" },
  createRow: { marginTop: 12, alignItems: "center" },
  
});
