import themes from "@/assets/utils/themes";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import GreenButton from "@/components/reusable/GreenButton";

export default function ProfileForm() {
  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { email: userEmail, editUsername, editEmail, username } = useProfile();
  const { logout } = useAuth();
  //   console.log("ProfileForm userEmail:", userEmail);

  function handleSubmit() {
    if (isEditing) {
      if (!fullname && !email) {
        setIsEditing(isEditing ? false : true);
        return;
      }
      if (fullname) editUsername(fullname);
      if (email) editEmail(email);

      setFullname("");
      setEmail("");
    }

    setIsEditing(isEditing ? false : true);
  }

  return (
    <View style={styles.formContainer}>
      <View style={styles.form}>
        <View>
          <Text style={styles.formLabel}>Full Name</Text>
          <TextInput
            style={styles.formInput}
            placeholder={username}
            value={fullname}
            onChangeText={setFullname}
            accessibilityLabel="Profile form text input"
            editable={isEditing}
            returnKeyType="next"
            onSubmitEditing={() => {}}
          />
        </View>
        <View>
          <Text style={styles.formLabel}>Email Address</Text>
          <TextInput
            style={styles.formInput}
            placeholder={typeof userEmail === 'string' ? userEmail : user?.email || "Enter your email address"}
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Profile form email input"
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
