//Custom libraries and components

//TODO: install tailwind and use it for styling
// TODO: Replace the link to Sign in with a sin2@calvin.edu
//TODO: Make Help Page. Authentication Page. Forgot Password
import { useRouter } from "expo-router";
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
  TouchableOpacity,
  View,
} from "react-native";

//Custom libraries
import { useAuth } from "../../contexts/AuthContext";

//Components
import AppTitle from "../../components/reusable/AppTitle";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login, isAuthenticated, isLoading, setIsLoading } = useAuth();
  // console.log("Authentication status:", isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async () => {
    if (username && password) {
      // Validate username format (alphanumeric, underscores, hyphens)
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        Alert.alert(
          "Validation",
          "Username can only contain letters, numbers, underscores, and hyphens"
        );
        return;
      }
      if (!/[A-Za-z0-9]/.test(password) || !(password.length >= 10)) {
        Alert.alert(
          "Validation",
          "Passwords must be alphanumeric and at least 10 characters"
        );
        return;
      }

      setIsLoading(true);
      try {
        login(username.toLowerCase(), password);
      } catch (err: any) {
        Alert.alert("Login failed", err.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert("Validation", "Please enter username and password.");
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
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="your_username"
            autoComplete={"username"}
            style={styles.input}
            returnKeyType="next"
            onSubmitEditing={() => {}}
            autoCapitalize="none"
          />

          <Text style={styles.warningText}>Warning: passwords are not encrypted, DO NOT use sensitive or reused passwords</Text>

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
            <View style={{ gap: 2 }}>
              <TouchableOpacity onPress={() => router.push("/signin")}>
                <Text style={styles.authenticationHelpText}>Sign Up</Text>
              </TouchableOpacity>
              {/* <Text style={styles.authenticationHelpText}>
                Forgot password?
              </Text> */}
            </View>
          </View>
          
          {/* Debug Section */}
          <View style={styles.debugSection}>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => router.push("/debug")}
            >
              <Text style={styles.debugButtonText}>Debug Console</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  authenticationHelp: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "flex-end",
  },
  authenticationHelpText: {
    fontSize: 12,
    color: "blue",
  },
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
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 6 },
  label: { fontSize: 14, fontWeight: "600" },
  warningText: {
    fontSize: 12,
    color: "#d32f2f",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 8,
    paddingHorizontal: 10,
  },
  debugSection: {
    marginTop: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  debugButton: {
    backgroundColor: "#f39c12",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  debugButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
});
