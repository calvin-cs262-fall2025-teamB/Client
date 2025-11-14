import { View, StyleSheet, Text, TextInput } from "react-native";
import { useState } from "react";
import themes from "@/assets/utils/themes";

import GreenButton from "@/components/reusable/GreenButton";
export default function ProfileForm() {
  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(true);

  return (
    <View style={styles.formContainer}>
      <View style={styles.form}>
        <View>
          <Text style={styles.formLabel}>Full Name</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Enter text..."
            value={fullname}
            onChangeText={setFullname}
            accessibilityLabel="Profile form text input"
          />
        </View>
        <View>
          <Text style={styles.formLabel}>Email Address</Text>
          <TextInput
            style={styles.formInput}
            placeholder={email || "@johndoe"}
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Profile form email input"
          />
        </View>
        <GreenButton info={isEditing ? "Submit" : "Edit"} />
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
