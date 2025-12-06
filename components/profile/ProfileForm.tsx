import themes from "@/assets/utils/themes";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import GreenButton from "@/components/reusable/GreenButton";

export default function ProfileForm() {
  const [newUsername, setNewUsername] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { editUsername, username } = useProfile();
  const { logout } = useAuth();

  function handleSubmit() {
    if (isEditing) {
      if (!newUsername) {
        setIsEditing(isEditing ? false : true);
        return;
      }
      if (newUsername) editUsername(newUsername);

      setNewUsername("");
    }

    setIsEditing(isEditing ? false : true);
  }

  return (
    <View style={styles.formContainer}>
      <View style={styles.form}>
        <View>
          <Text style={styles.formLabel}>Username</Text>
          <TextInput
            style={styles.formInput}
            placeholder={username || "Enter your username"}
            value={newUsername}
            onChangeText={setNewUsername}
            accessibilityLabel="Profile form username input"
            editable={isEditing}
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
          />
        </View>
        <GreenButton
          onPress={handleSubmit}
          info={isEditing ? "Submit" : "Edit"}
        />
        <GreenButton onPress={logout} info={"Logout"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 5,
    gap: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  formLabel: {
    fontSize: 14,
    color: themes.primaryColorDark,
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: themes.primaryColorGreyDark,
    marginBottom: 12,
  },
});
