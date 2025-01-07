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
import { login } from "../Services/AuthService/Login";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { queryClient } from "../Services/mainService";
import { jwtDecode } from "jwt-decode";
import { RouteProp, useRoute } from "@react-navigation/native";

interface CustomJwtPayload {
  Role: string;
  UserId: string;
  name: string;
  CompanyId: string;
  Email: string;
}
type LoginScreenRouteProp = RouteProp<
  { params: { previousScreen: string } },
  "params"
>;
const LoginScreen = ({ navigation, route }: any) => {
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  //   const route =useRoute<LoginScreenRouteProp>();
  //   const previousScreen = route.params?.previousScreen
  console.log("co ko1", userEmail);
  console.log("co ko2", password);
  const {
    mutate: mutateLogin,
    error: loginError,
    isError: isLoginError,
    isPending: PendingLogin,
  } = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      try {
        const userInfo = jwtDecode<CustomJwtPayload>(data.result);
        console.log("Decoded user info:", userInfo);

        const userRole = userInfo.Role?.toLowerCase() || "";
        const userId = userInfo.UserId?.toLowerCase() || "";
        const userName = userInfo.name;
        const CompanyId = userInfo.CompanyId;
        const Email = userInfo.Email;
        const token = data.result;
        const previousScreen = await AsyncStorage.getItem("redirectPath");

        const storageItems: [string, string][] = [
          ["Auth", "true"],
          ["role", userRole],
          ["token", token],
          ["userId", userId],
        ];

        if (userName) storageItems.push(["name", userName]);
        if (CompanyId) storageItems.push(["CompanyId", CompanyId]);
        if (Email) storageItems.push(["Email", Email]);

        await AsyncStorage.multiSet(storageItems);

        // Invalidate queries after login
        queryClient.invalidateQueries({
          queryKey: ["UserProfile"],
          refetchType: "active",
        });
        queryClient.invalidateQueries({
          queryKey: ["JobPosts"],
          refetchType: "active",
        });
        queryClient.invalidateQueries({
          queryKey: ["CVs"],
          refetchType: "active",
        });
        queryClient.invalidateQueries({
          queryKey: ["JobPostActivity"],
          refetchType: "active",
        });
        console.log("tesc", userRole);
        if (userRole === "jobseeker") {
          // navigation.navigate("Employer");
          // navigation.navigate(previousScreen || "Home");
          navigation.navigate("Home");
        }
      } catch (e) {
        Alert.alert("Error", "Failed to save user data.");
        console.error("Failed to save user data:", e);
      }
    },

    onError: () => {
      Alert.alert(
        "Error",
        "Login failed. Please check your credentials and try again."
      );
    },
  });

  const handleLogin = async () => {
    if (!userEmail || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    await mutateLogin({ user: { userEmail, password } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>Amazing Job</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={userEmail}
        onChangeText={setUserEmail}
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
      {PendingLogin ? (
        <TouchableOpacity style={styles.button} >
          <Text style={styles.buttonText}>Wait a seconds</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>CONTINUE WITH EMAIL</Text>
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
          <Text style={styles.skipText}>Do not Have Account?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.skipText}>Register Now</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

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
  skipText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});

export default LoginScreen;
