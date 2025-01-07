import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { register } from "../../Services/AuthService/Register";

const RegisterEmployer = ({ navigation }: any) => {
  // const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const {
    mutate: mutateRegister,
    error: registerError,
    isError: isRegisterError,
    isPending: RegisterPending,
    isSuccess: isRegisterSuccess,
    reset,
  } = useMutation({
    mutationFn: register,
    onSuccess: async (data) => {
      await AsyncStorage.setItem("userIdRegister", data.result.toString());
      navigation.navigate("VerificationEmployer");

      setTimeout(() => {
        reset();
      }, 3000);
    },
    onError: () => {
      Alert.alert("Error", "Registration failed. Please try again.");
      setTimeout(() => {
        reset();
      }, 5000);
    },
  });
  const handleRegister = async () => {
    if (
      // !userName ||
      !password ||
      !confirmPassword ||
      !email ||
      !firstName ||
      !lastName
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    try {
      mutateRegister({
        user: {
          // userName: userName,
          email: email,
          fistName: firstName,
          lastName: lastName,
          password: password,
          confirmPassword: confirmPassword,
          role: 1,
        },
      });
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>Register for Employer</Text>

      {/* <TextInput
        placeholder="Username"
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
        placeholderTextColor="#fff"
      /> */}
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#fff"
      />
      <TextInput
        placeholder="First Name"
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholderTextColor="#fff"
      />
      <TextInput
        placeholder="Last Name"
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholderTextColor="#fff"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        placeholderTextColor="#fff"
      />
      <TextInput
        placeholder="Confirm Password"
        style={styles.input}
        value={confirmPassword}
        secureTextEntry
        onChangeText={setConfirmPassword}
        placeholderTextColor="#fff"
      />

      {RegisterPending ? (
        <TouchableOpacity style={styles.button} >
          <Text style={styles.buttonText}>Wait a seconds</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>REGISTER</Text>
        </TouchableOpacity>
      )}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity>
          <Text style={styles.skipText}>Already Have An Account?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("LoginEmployer")}>
          <Text style={styles.skipText}>Login Now</Text>
        </TouchableOpacity>
      </View>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6700",
    padding: 20,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 50,
  },
  input: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
    width: "90%",
    padding: 15,
    marginBottom: 15,
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    borderRadius: 5,
    width: "90%",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default RegisterEmployer;
