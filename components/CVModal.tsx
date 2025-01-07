import React from "react";
import { View, Modal, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the icon library

const CVModal = ({
  modalVisible,
  setModalVisible,
  navigation,
}: {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  navigation: any;
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={() => setModalVisible(false)}
          >
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>CV / Cover Letter</Text>
          <Text style={styles.modalDescription}>
            Would you like to have a job that suits you? Create a CV on our
            platform, we will suggest you the most suitable jobs.
          </Text>

          <TouchableOpacity
            style={styles.createCVButton}
            onPress={() => navigation.navigate("Information")}
          >
            <Text style={styles.buttonText}>CREATE NEW CV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadCVButton}
            onPress={() => navigation.navigate("UploadCV")}
          >
            <Text style={styles.uploadButtonText}>UPLOAD YOUR CV</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    position: "relative", // Ensure the close icon can be positioned relative to the modal
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
  },
  createCVButton: {
    backgroundColor: "#FF4500",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  uploadCVButton: {
    backgroundColor: "#FFF",
    borderColor: "#FF4500",
    borderWidth: 1,
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#FF4500",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CVModal;
