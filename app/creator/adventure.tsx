import themes from "@/assets/utils/themes";
import Button from "@/components/home/Button";
import BackButton from "@/components/reusable/BackButton";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Backend API base used elsewhere in the project (kept in sync with DatabaseContext)
const API_BASE_URL =
  "https://beautifulguys-bsayggeve3c6esba.canadacentral-01.azurewebsites.net/";

export default function CreateAdventureScreen() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [regions, setRegions] = useState<Array<{ id: string | number; label: string }>>([]);
  const [loadingRegions, setLoadingRegions] = useState<boolean>(false);
  const [regionsError, setRegionsError] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedRegion(id);
    setIsOpen(false);
  };

  useEffect(() => {
    let mounted = true;
    const fetchRegions = async () => {
      setLoadingRegions(true);
      setRegionsError(null);
      try {
        const res = await fetch(`${API_BASE_URL}regions`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Map backend region objects to {id, label}
        const mapped = (data || []).map((r: any) => ({
          id: r.id ?? r.regionid ?? r.regionId ?? r.ID,
          label: r.name ?? r.label ?? `Region ${r.id ?? r.regionid ?? "?"}`,
        }));

        if (mounted) setRegions(mapped);
      } catch (err: any) {
        console.error("Error fetching regions:", err);
        if (mounted) setRegionsError(err.message ?? String(err));
      } finally {
        if (mounted) setLoadingRegions(false);
      }
    };

    fetchRegions();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreate = () => {
    if (!selectedRegion) {
      Alert.alert(
        "Select a region",
        "Please choose a region before creating an adventure."
      );
      return;
    }

    const regionLabel =
      regions.find((r) => String(r.id) === String(selectedRegion))?.label ?? "";
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
        <Pressable style={styles.dropdown} onPress={() => setIsOpen((v) => !v)}>
          <Text style={styles.dropdownText}>
            {regions.find((r) => String(r.id) === String(selectedRegion))?.label ??
              "Select a region..."}
          </Text>
          <FontAwesome6
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={themes.primaryColor}
          />
        </Pressable>

        {isOpen && (
          <View style={styles.options}>
            {loadingRegions && <Text style={styles.optionText}>Loading regions...</Text>}
            {regionsError && <Text style={styles.optionText}>Error: {regionsError}</Text>}
            {!loadingRegions && !regionsError && regions.length === 0 && (
              <Text style={styles.optionText}>No regions available</Text>
            )}
            {!loadingRegions && !regionsError &&
              regions.map((r) => (
                <Pressable
                  key={String(r.id)}
                  style={styles.option}
                  onPress={() => handleSelect(String(r.id))}
                >
                  <Text style={styles.optionText}>{r.label}</Text>
                </Pressable>
              ))}
          </View>
        )}
      </View>

      <View style={styles.createRow}>
        <Button
          label="Create"
          theme="primary"
          size="large"
          onPress={handleCreate}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 20, paddingTop: 40 },
  createRow: { marginTop: 12, alignItems: "center" },
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
  dropdownWrapper: { marginBottom: 20 },
  label: { fontSize: 16, color: "#444", marginBottom: 8 },
  option: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  optionText: { fontSize: 15, color: "#111" },
  options: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#222", marginBottom: 20 },
  topRow: { alignItems: "flex-start", marginBottom: 8 },
});
