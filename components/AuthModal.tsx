import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  DevSettings,
} from "react-native";
import { login } from "../Services/AuthService/Login";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { register } from "../Services/AuthService/Register";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VerificationModal from "./VerificationModal";
import { queryClient } from "../Services/mainService";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation, useNavigationState } from "@react-navigation/native";

interface CustomJwtPayload {
  Role: string;
  UserId: string;
  name: string;
  Email:string
}

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

interface FormData {
  // userName: string;
  password: string;
  confirmPassword?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: number;
  userEmail?: string;
}

const initialFormData: FormData = {
  // userName: "",
  password: "",
  confirmPassword: "",
  email: "",
  firstName: "",
  lastName: "",
  userEmail: "",
  role: 0,
};
type RootStackParamList = {
  Home: undefined;
  MyScreen: undefined;
  Account: undefined;
};
type NavigationProps = StackNavigationProp<RootStackParamList, "Account">;
const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  onClose,
  navigation,
}) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [modalVisibleAuth, setModalVisibleAuth] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const currentRoute = useNavigationState((state) => state.routes[state.index]);
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
      setFormData(initialFormData);
      await AsyncStorage.setItem("userIdRegister", data.result.toString());
      onClose();
      setModalVisibleAuth(true);
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
        // const CompanyId = userInfo.CompanyId;
        const Email = userInfo.Email;
        const token = data.result;
        const previousScreen = await AsyncStorage.getItem("redirectPath");
        const redirectStateString = await AsyncStorage.getItem("redirectState");
        const redirectState = redirectStateString
          ? JSON.parse(redirectStateString)
          : {};
        const redirectStateString1 = await AsyncStorage.getItem(
          "redirectStateJob"
        );
        const redirectState1 = redirectStateString1
          ? JSON.parse(redirectStateString1)
          : {};
        const combinedState = { ...redirectState, ...redirectState1 };

        const storageItems: [string, string][] = [
          ["Auth", "true"],
          ["role", userRole],
          ["token", token],
          ["userId", userId],
        ];

        if (userName) storageItems.push(["name", userName]);
        // if (CompanyId) storageItems.push(["CompanyId", CompanyId]);
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



       
        navigation.navigate(currentRoute.name, {
          combinedState,
          id: redirectState?.id,
          jobId: redirectState1.id,
        });

        setTimeout(() => {
          setLoading(false);

          navigation.replace(currentRoute.name, {
            combinedState,
            id: redirectState?.id,
            jobId: redirectState1.id,
          });
        }, 2000);
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

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value.trim(),
    }));
  };

  const handleLogin = async () => {
    const { userEmail, password } = formData;
    if (!userEmail || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
  await  mutateLogin({ user: { userEmail, password } });
  };

  const handleRegister = async () => {
    const {  password, confirmPassword, email, firstName, lastName } =
      formData;
    if (
  
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
          role: 0,
        },
      });
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <>
      <VerificationModal
        visible={modalVisibleAuth}
        onClose={() => setModalVisibleAuth(false)}
        navigation={navigation}
      />
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.container}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size={100} color="#ff5733" />
              <Text style={styles.loadingText}>Reloading...</Text>
            </View>
          ) : (
            <View style={styles.modal}>
              <Text style={styles.title}>{isLogin ? "Login" : "Register"}</Text>
              {isLogin ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="UserEmail"
                    value={formData.userEmail}
                    onChangeText={(text) =>
                      handleInputChange("userEmail", text)
                    }
                    editable={!PendingLogin}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(text) => handleInputChange("password", text)}
                    editable={!PendingLogin}
                  />
                </>
              ) : (
                <>
                  {/* <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={formData.userName}
                    onChangeText={(text) => handleInputChange("userName", text)}
                    editable={!RegisterPending}
                  /> */}
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(text) => handleInputChange("password", text)}
                    editable={!RegisterPending}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(text) =>
                      handleInputChange("confirmPassword", text)
                    }
                    editable={!RegisterPending}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange("email", text)}
                    editable={!RegisterPending}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={formData.firstName}
                    onChangeText={(text) =>
                      handleInputChange("firstName", text)
                    }
                    editable={!RegisterPending}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChangeText={(text) => handleInputChange("lastName", text)}
                    editable={!RegisterPending}
                  />
                </>
              )}
              <TouchableOpacity
                style={styles.button}
                onPress={isLogin ? handleLogin : handleRegister}
                disabled={PendingLogin || RegisterPending}
              >
                <Text style={styles.buttonText}>
                  {isLogin
                    ? PendingLogin
                      ? "Please wait..."
                      : "Login"
                    : RegisterPending
                    ? "Please wait..."
                    : "Register"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.switchText}>
                 
                   "Don't have an account? Register"
              
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#ff5733",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  switchText: {
    color: "#ff5733",
    textAlign: "center",
    marginBottom: 10,
  },
  closeText: {
    textAlign: "center",
    color: "grey",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#ff5733",
  },
});

export default AuthModal;
