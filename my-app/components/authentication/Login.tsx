//TODO: install tailwind and use it for styling
// TODO: Replace the link to Sign in with a sin2@calvin.edu
//TODO: Make Help Page. Authentication Page. Forgot Password
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, // Acts as a spinner while waiting for login
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

//Custom libraries
import { useAuth } from "../../contexts/AuthContext";

//Components
import AppTitle from "../reusable/AppTitle";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isAuthenticated, isLoading, setIsLoading } = useAuth();
  // console.log("Authentication status:", isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    if (email && password) {
      setIsLoading(true);
      try {
        login(email, password);
      } catch (err: any) {
        Alert.alert("Login failed", err.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert("Validation", "Please enter email and password.");
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.container}
      >
        <View style={styles.form}>
          <AppTitle />
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoComplete={"email"}
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={() => {}}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            style={styles.input}
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
          />

          {isLoading ? (
            <ActivityIndicator style={{ marginTop: 12 }} />
          ) : (
            <Button title="Login" onPress={handleSubmit} />
          )}
          <View style={styles.authenticationHelp}>
            <Text style={styles.authenticationHelpText}>Help</Text>
            <View style={{ gap: 2 }}>
              <Link href="/signin" style={styles.authenticationHelpText}>
                Sign in
              </Link>
              <Text style={styles.authenticationHelpText}>
                Forgot password?
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // centers horizontally for flex box, not grid
    padding: 20,
    backgroundColor: "#fff",
    width: "100%",
    height: "100%", //takes in pixels as numbers, but percentages as strings
  },
  form: {
    width: "85%",
    flexBasis: "50%", //takes in pixels as numbers, but percentages as strings. flexbasis instead of height to allow for flexbox resizing
    borderRadius: 12,
    paddingRight: 20,
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    transform: [{ translateY: -50 }],
    //  shadow instead of box-shadow
    shadowColor: "#030303ba",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: "#fffefe",
    justifyContent: "center",

    gap: 8,
  },
  label: { fontSize: 14, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 6 },
  authenticationHelp: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  authenticationHelpText: {
    fontSize: 12,
    color: "blue",
  },
});
