import { Text, View, StyleSheet, ScrollView } from "react-native";

type Props = {
  items: string[];
  fontSize?: number;
  delineate?: boolean;
};

export default function DisplayList({
  items,
  fontSize = 16,
  delineate = false,
}: Props) {
  const styles = StyleSheet.create({
    container: {
      fontSize,
      padding: 20,
      alignItems: "center",
    },
  });
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <Text key={index}> {item}</Text>
      ))}{" "}
    </View>
  );
}
