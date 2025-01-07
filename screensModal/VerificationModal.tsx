import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Text, TextInput, Button, View, StyleSheet, Alert } from "react-native";
import { PutEmail } from "../Services/AuthService/PutEmail";
import { AuthService } from "../Services/AuthService/AuthService";

export default function VerificationModal({ navigation }: any) {
  const [verificationCode, setVerificationCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [userRegisterId, setUserRegisterId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const Registerid = await AsyncStorage.getItem("userIdRegister");
      if (Registerid) {
        setUserRegisterId(Registerid);
      } else {
        Alert.alert("Error", "User ID not found.");
      }
    };

    fetchUserId();
  }, []);

  const {
    mutate: mutatePutEmail,
    isPending: RegisterPending,
    reset,
  } = useMutation({
    mutationFn: PutEmail,
    onSuccess: () => {
      Alert.alert("Success", "Email update successful!");
      setNewEmail(""); // Reset newEmail input
      setTimeout(() => {
        reset();
      }, 3000);
    },
    onError: () => {
      Alert.alert("Error", "Email update failed. Please try again.");
      setTimeout(() => {
        reset();
      }, 5000);
    },
  });

  const { mutate: mutateAuth, isPending: PendingLogin } = useMutation({
    mutationFn: AuthService,
    onSuccess: () => {
      Alert.alert("Success", "Account Verification Complete!");
      setVerificationCode(""); // Reset verification code input
      navigation.navigate("Account");
    },
    onError: () => {
      Alert.alert("Error", "Verification failed. Please check your code.");
    },
  });

  const handleVerificationSubmit = () => {
    if (!userRegisterId) {
      Alert.alert("Error", "User ID not found.");
      return;
    }
    if (!verificationCode) {
      Alert.alert("Error", "Please enter the verification code.");
      return;
    }
    mutateAuth({
      user: {
        userId: Number(userRegisterId),
        verificationCode: verificationCode,
      },
    });
  };

  const handleEmailSubmit = () => {
    if (!userRegisterId) {
      Alert.alert("Error", "User ID not found.");
      return;
    }
    if (!newEmail) {
      Alert.alert("Error", "Please enter a new email.");
      return;
    }
    mutatePutEmail({
      data: {
        newEmail: newEmail,
        userId: Number(userRegisterId),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text>Enter Verification Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Verification Code"
        value={verificationCode}
        onChangeText={setVerificationCode}
        editable={!PendingLogin} // Disable input while submitting
      />
      <Button
        title={PendingLogin ? "Submitting..." : "Submit Verification Code"}
        onPress={handleVerificationSubmit}
        disabled={PendingLogin} // Disable button while request is pending
      />

      <Text style={styles.sectionMargin}>Enter New Email</Text>
      <TextInput
        style={styles.input}
        placeholder="New Email"
        value={newEmail}
        onChangeText={setNewEmail}
        editable={!RegisterPending} // Disable input while submitting
      />
      <Button
        title={RegisterPending ? "Submitting..." : "Submit New Email"}
        onPress={handleEmailSubmit}
        disabled={RegisterPending} // Disable button while request is pending
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: "80%",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sectionMargin: {
    marginTop: 40,
  },
});
