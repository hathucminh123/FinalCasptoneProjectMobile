import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PutUser } from "../../Services/UserJobPostActivity/PutUser";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetUserProfile } from "../../Services/UserProfileService/UserProfile";
import { queryClient } from "../../Services/mainService";

const Gender: string[] = ["Man", "Female"];

export default function PersonalInfo() {
  const [userId, setUserId] = useState<string | null>(null);
  const [auth, setAuth] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectGender, setSelectGender] = useState("");
  const [disabled, setDisabled] = useState<boolean>(true);
  const [email,setEmail]=useState<string|null>("")
  const [formData, setFormData] = useState({
    userName: "currentUserName",
    firstName: "",
    lastName: "",
    email: email,
    phoneNumber: "0123123",
  });

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      const auth = await AsyncStorage.getItem("Auth");
      const Email =await AsyncStorage.getItem("Email")
      setAuth(auth);
      setUserId(id);
      setEmail(Email)
    };

    fetchUserId();
  }, []);

  const { data: UserProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["UserProfile"],
    queryFn: ({ signal }) =>
      GetUserProfile({ id: Number(userId), signal: signal }),
    staleTime: 1000,
  });

  const UserProfileData = UserProfile?.UserProfiles;
  const handleFileChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedFile(result.assets[0].uri);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const { mutate: UpdateUser } = useMutation({
    mutationFn: PutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Profile"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["UserProfile"],
        refetchType: "active",
      });
      alert("Profile updated successfully!");
    },
    onError: () => {
      alert("Failed to update profile.");
    },
  });

  const handleSubmit = () => {
    UpdateUser({
      data: {
        // userName: formData.userName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || "",
        phoneNumber: formData.phoneNumber,
        // gender: selectGender,
      },
    });
  };

  if (isProfileLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size={100} color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        <Text style={styles.title}>Update Personal Information</Text>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Text style={styles.label}>Avatar</Text>
          {selectedFile ? (
            <Image source={{ uri: selectedFile }} style={styles.avatar} />
          ) : (
            <Image
              source={{
                uri: "https://tuyendung.topcv.vn/app/_nuxt/img/noavatar-2.18f0212.svg",
              }}
              style={styles.avatar}
            />
          )}
          <TouchableOpacity style={styles.button} onPress={handleFileChange}>
            <Text>Change Avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Email Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email: {UserProfileData?.email}</Text>
        </View>

        {/* First Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(text) => handleChange("firstName", text)}
          />
        </View>

        {/* Last Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(text) => handleChange("lastName", text)}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputContainer}>
          <View style={styles.phoneNumberHeader}>
            <Text style={styles.label}>Phone Number</Text>
            <TouchableOpacity onPress={() => setDisabled(!disabled)}>
              <Text style={styles.updatePhoneText}>Update Phone Number</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, disabled && styles.disabledInput]}
            placeholder="Phone Number"
            value={UserProfileData?.phoneNumber || ""} 
            // value={formData.phoneNumber}
            onChangeText={(text) => handleChange("phoneNumber", text)}
            editable={!disabled}
          />
        </View>

        {/* Submit Button */}
        {/* <Button  title="Save" onPress={handleSubmit} /> */}
        <TouchableOpacity
            onPress={handleSubmit}
            style={styles.btnUpdate}
          >
            <Text style={styles.btnTextUpdate}>Save</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
  },
  title: {
    fontWeight: "600",
    marginBottom: 20,
    fontSize: 18,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    color: "#5e6368",
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e8edf2",
    marginRight: 10,
  },
  button: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e8edf2",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  disabledInput: {
    backgroundColor: "#e8edf2",
    color: "#52759b",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#e8edf2",
    borderRadius: 5,
  },
  phoneNumberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  updatePhoneText: {
    color: "#007BFF",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnUpdate: {
    backgroundColor: "#ff6f61",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems:'center'
  },
  btnTextUpdate: {
    fontSize: 15,
    lineHeight:22.5,
    fontWeight:'bold',
    color: "#fff",
  },
});
