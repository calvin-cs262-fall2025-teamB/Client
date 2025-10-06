import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Authenticate() {
  return (
    <View style={styles.container}>
      <Text style={{ color: "#fff" }}>Welcome to the App!</Text>
      <Link href="/map">Checkout our maps</Link>
      <Link href="/+not-found">See not found page</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
});
