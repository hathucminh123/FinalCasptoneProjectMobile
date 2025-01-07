import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  DevSettings,
  ActivityIndicator, // Import ActivityIndicator for loading spinner
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome"; // Import FontAwesome icons
import { useFocusEffect } from "@react-navigation/native";
import { queryClient } from "../../Services/mainService";

export default function AccountHeader({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading spinner
  const [auth, setAuth] = useState<string | null>(null);
  const [UserId, setUserId] = useState<string | null>(null);

  const fetchUserData = async () => {
    const id = await AsyncStorage.getItem("userId");
    const Auth = await AsyncStorage.getItem("Auth");
    setAuth(Auth);
    setUserId(id);
    navigation.navigate("Account");
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.clear();
      queryClient.invalidateQueries({ queryKey: ["UserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["JobPosts"] });
      queryClient.invalidateQueries({ queryKey: ["CVs"] });

      console.log("Logged out and cleared storage.");

      setAuth(null);
      setUserId(null);
      toggleModal();

      setTimeout(() => {
        // DevSettings.reload();
      }, 1500);
    } catch (error) {
      console.error("Error during logout:", error);
      setLoading(false);
    }
  };

  return (
    <View>
      <View style={styles.container}>
        {/* Top bar with menu and exit icons */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Icon name="bars" size={24} color="#fff" />
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={() => navigation.navigate("LoginEmployer")}>
            <Text style={styles.text}>For Employer</Text>
          </TouchableOpacity> */}
          {/* {(auth || UserId) && (
            <TouchableOpacity onPress={toggleModal}>
              <Icon name="sign-out" size={24} color="#fff" />
            </TouchableOpacity>
          )} */}
        </View>

        {/* Modal for logout confirmation */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={toggleModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Are you sure you want to logout?
              </Text>
              <Button color={"#FF4500"} title="Logout" onPress={handleLogout} />
              <Button title="Cancel" onPress={toggleModal} color="red" />
            </View>
          </View>
        </Modal>

        {/* Show loading spinner when logging out */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF4500" />
            <Text style={styles.loadingText}>Logging out...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FF4500",
    paddingVertical: 30,
    paddingHorizontal: 10,
    elevation: 4,
    height: 90,
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
  },
  modalView: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    gap: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject, // Take up the entire screen
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    zIndex: 1000, // Ensure it appears above other elements
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#FF4500",
  },
});
