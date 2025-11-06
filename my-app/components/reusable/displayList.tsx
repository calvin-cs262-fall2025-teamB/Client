import { Text, View, StyleSheet } from "react-native";
// TODO: use tailwind to style this card. That is, creating lines separating each stat
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
      padding: 20,
      alignItems: "center",
      gap: 10,
      backgroundColor: "#fff",
      borderRadius: 10,
      shadowColor: "#000000eb",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    text: {
      fontSize,
      fontWeight: 400,
    },
  });
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <Text style={styles.text} key={index}>
          {" "}
          {item}
        </Text>
      ))}
    </View>
  );
}
