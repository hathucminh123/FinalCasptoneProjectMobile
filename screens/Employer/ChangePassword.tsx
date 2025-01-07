import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { ChangePasswordUser } from "../../Services/AuthService/ChangePassword";

export default function ChangePassword({ navigation }:any) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const { mutate: ChangePassword } = useMutation({
    mutationFn: ChangePasswordUser,
    onSuccess: () => {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      Alert.alert("Success", "Password updated successfully!");
    },
    onError: () => {
      Alert.alert("Error", "Failed to update password.");
    },
  });

  const handleUpdate = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Error", "New password and confirm password do not match.");
      return;
    }

    ChangePassword({
      user: {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formWrapper}>
        <Text style={styles.formTitle}>Change Password</Text>

        {/* Current Password */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Current Password</Text>
          <TextInput
            secureTextEntry={true}
            placeholder="Input Your Current Password"
            value={formData.currentPassword}
            onChangeText={(text) => handleChange("currentPassword", text)}
            style={styles.inputElement}
         
          />
        </View>

        {/* New Password */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>New Password</Text>
          <TextInput
            secureTextEntry={true}
            placeholder="Input Your New Password"
            value={formData.newPassword}
            onChangeText={(text) => handleChange("newPassword", text)}
            style={styles.inputElement}
      
          />
        </View>

        {/* Confirm New Password */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Confirm New Password</Text>
          <TextInput
            secureTextEntry={true}
            placeholder="Confirm Your New Password"
            value={formData.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
            style={styles.inputElement}
      
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonAction}>
          <TouchableOpacity
            onPress={() => navigation.goBack()} // Navigate back on cancel
            style={styles.btnCancel}
          >
            <Text style={styles.btnTextCancel}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleUpdate}
            style={styles.btnUpdate}
          >
            <Text style={styles.btnTextUpdate}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  formWrapper: {
    width: "100%",
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    color: "#5e6368",
    marginBottom: 5,
  },
  inputElement: {
    height: 40,
    borderColor: "#e8edf2",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  buttonAction: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btnCancel: {
    backgroundColor: "#f5f8fa",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderColor: "#e8edf2",
    borderWidth: 1,
  },
  btnTextCancel: {
    fontSize: 14,
    color: "#303235",
  },
  btnUpdate: {
    backgroundColor: "#ff6f61",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  btnTextUpdate: {
    fontSize: 14,
    color: "#fff",
  },
});
