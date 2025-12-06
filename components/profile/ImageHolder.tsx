import { ImageSourcePropType, StyleSheet } from "react-native";
import { Image } from "expo-image";

type Props = {
  imgSource: ImageSourcePropType;
  selectedImage?: string;
};

export default function ImageHolder({ imgSource, selectedImage }: Props) {
  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;

  return <Image source={imageSource} style={styles.image} />;
}

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
  },
});
