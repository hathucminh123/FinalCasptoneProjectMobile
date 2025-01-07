import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

const ProfileCard = ({
  fullName,
  setModalVisible,
  phoneNumber
}: {
  fullName: string | undefined |null;
  phoneNumber:string |undefined|null;
  setModalVisible: (visible: boolean) => void;
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: "https://tuyendung.topcv.vn/app/_nuxt/img/noavatar-2.18f0212.svg",
          }}
          resizeMode="contain"
          style={styles.image}
        />
      </View>
      <TouchableOpacity
        style={styles.name}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ fontSize: 15, lineHeight: 22.5 }}> My name is</Text>
        <Text style={{ fontSize: 15, lineHeight: 30, fontWeight: "bold" }}>
          Email:{fullName}
        </Text>
        <Text style={{ fontSize: 15, lineHeight: 30, fontWeight: "bold" }}>
         Phone Number: {phoneNumber}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    gap: 10,
  },
  imageContainer: {
    backgroundColor: "black",
    borderRadius: 50,
    padding: 5,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  name: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 5,
    flex: 1,
  },
});

export default ProfileCard;
