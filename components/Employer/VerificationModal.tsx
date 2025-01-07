// VerificationModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: () => void;
  userName?: string;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  visible,
  onClose,
  onNavigate,
  userName = "User",
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <Text style={styles.instructionText}>
            Please verify your company information to start searching for CVs
            or posting job listings and receiving applications for your job
            postings.
          </Text>
          <TouchableOpacity
            style={[
              styles.updateInfoButton,
              hovered && styles.updateInfoButtonHovered,
            ]}
            onPress={onNavigate}
            onPressIn={() => setHovered(true)}
            onPressOut={() => setHovered(false)}
          >
            <Text style={styles.buttonText}>Update Company Information</Text>
            <Icon name="arrow-forward" size={24} color={hovered ? "#fff" : "#FF6F61"} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default VerificationModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  welcomeContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF6F61",
    marginLeft: 5,
  },
  instructionText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginVertical: 16,
  },
  updateInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f5f8fa",
  },
  updateInfoButtonHovered: {
    backgroundColor: "#FF6F61",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6F61",
    marginRight: 8,
  },
});
