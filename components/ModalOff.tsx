import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
// import { useAnimationState, AnimatePresence } from "moti";

interface Props {
  onClose?: () => void;
  onConfirm?: () => void;
  visible: boolean;
}

export default function ModalOff({ onClose, onConfirm, visible }: Props) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
       
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>
                Deactivate job invitations from employers?
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.description}>
              You will no longer get job invitations tailored to your skills.
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                <Text style={styles.confirmText}>Stop receiving</Text>
              </TouchableOpacity>
            </View>
          </View>
     
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  closeButton: {
    padding: 8,
  },
  description: {
    marginVertical: 15,
    fontSize: 16,
    lineHeight: 22,
    color: "#555",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    marginRight: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
  },
  cancelText: {
    fontSize: 16,
    color: "#000",
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#ff5555",
  },
  confirmText: {
    fontSize: 16,
    color: "#fff",
  },
});
