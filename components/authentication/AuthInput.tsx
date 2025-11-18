import { TextInput, StyleSheet } from "react-native";

export default function AuthInput({
  value,
  setOnChangeText,
  setHandleSubmit,
  returnKeyType,
  autoComplete,
  placeholder,
  keyboardType,
  secureTextEntry,
}: {
  value: string;
  setOnChangeText: (text: string) => void;
  setHandleSubmit?: () => void;
  returnKeyType: "next" | "done" | "go" | "search" | "send";
  autoComplete:
    | "off"
    | "email"
    | "name"
    | "name-family"
    | "name-given"
    | "password";
  placeholder: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  secureTextEntry?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={setOnChangeText}
      keyboardType={keyboardType || "default"}
      autoCapitalize="none"
      autoComplete={autoComplete || "off"}
      placeholder={placeholder}
      style={styles.input}
      returnKeyType={returnKeyType || "next"}
      onSubmitEditing={setHandleSubmit || (() => {})}
      secureTextEntry={secureTextEntry || false}
    />
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 6 },
});
