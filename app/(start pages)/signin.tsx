//TODO: Optimize by making one component for login and sign in
//TODO: install tailwind and use it for styling
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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

// TODO: Options to let you go back ti login from sign up

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, seConfirmedtPassword] = useState("");
  const { signup, isAuthenticated, setIsLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("../home");
    }
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    if (username && password) {
      // Validate username
      if (username.length < 3) {
        Alert.alert(
          "Validation",
          "Username must be at least 3 characters long"
        );
        return;
      }

      if (!/^[A-Za-z0-9_]+$/.test(username)) {
        Alert.alert(
          "Validation",
          "Username can only contain letters, numbers, and underscores"
        );
        return;
      }

      // Validate password
      if (!/[A-Za-z0-9]/.test(password) || !(password.length >= 10)) {
        Alert.alert(
          "Validation",
          "Passwords must be alphanumeric and at least 10 characters"
        );
        return;
      }

      if (password !== confirmedPassword) {
        Alert.alert("Validation", "Passwords do not match.");
        return;
      }

      setIsLoading(true);
      try {
        signup(username, password);
      } catch (err: any) {
        Alert.alert("Signup failed", err.message || "Unknown error");
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert("Validation", "Please don't leave any field empty");
    }
  };

  return (
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
          keyboardType="default"
          autoCapitalize="none"
          autoComplete="username"
          placeholder="Enter your username"
          style={styles.input}
          returnKeyType="next"
          onSubmitEditing={() => {
            // Focus password next — you can use refs for nicer UX
          }}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          style={styles.input}
          returnKeyType="next"
        />

        <Text style={styles.label}>Re-Enter Password</Text>
        <TextInput
          value={confirmedPassword}
          onChangeText={seConfirmedtPassword}
          secureTextEntry
          placeholder="••••••••"
          style={styles.input}
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
        />

        <Button title="Sign up" onPress={handleSubmit} />

        <View style={styles.authenticationHelp}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.authenticationHelpText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
    flexBasis: "75%", //takes in pixels as numbers, but percentages as strings. flexbasis instead of height to allow for flexbox resizing
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
});
