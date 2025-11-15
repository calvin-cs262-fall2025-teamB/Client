import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import BackButton from "@/components/reusable/BackButton";
import { router } from "expo-router";

export default function AdventureView() {
  const { adventureId } = useLocalSearchParams<{ adventureId: string }>();

  return (
    <>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Adventure id: {adventureId}</Text>
      </View>
      <BackButton onPress={() => router.back()} />
    </>
  );
}
