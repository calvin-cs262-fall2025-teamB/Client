import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
    label: string;
    theme?: 'primary';
    size?: 'small' | 'medium' | 'large';
    onPress?: () => void;
}

export default function Button({ label, theme, size = 'medium', onPress }: Props) {

    if (theme === 'primary') {
        return (
            <View
                style = {[
                    styles.buttonContainer,
                    size === 'large' ? styles.largeContainer : {},
                    {borderWidth: 4, borderColor: '#ffd33d', borderRadius: 18},
                ]}>
                <Pressable
                    style = {[styles.button, size === 'large' ? styles.largeButton : {}, { backgroundColor: '#fff' }]}
                    onPress = {onPress}>
                    <Text style = {[styles.buttonText, { color: '#25292e' }]}>{label}</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={() => alert('You pressed a button.')}>
            <Text style={styles.buttonText}>{label}</Text>
        </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
    largeContainer: {
        maxWidth: 360,
    },
    largeButton: {
        paddingVertical: 22,
        paddingHorizontal: 38,
        borderRadius: 22,
    },
});