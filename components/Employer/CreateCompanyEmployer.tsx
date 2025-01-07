import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { v4 as uuidv4 } from "uuid";
import { storage } from "../../firebase/config";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PostBusinessStream } from "../../Services/BusinessStreamService/PostBusinessStream";
import { queryClient } from "../../Services/mainService";
import { GetBusinessStream } from "../../Services/BusinessStreamService/GetBusinessStream";
import { PostCompanies } from "../../Services/CompanyService/PostCompanies";
import { PostUserCompanyService } from "../../Services/UserCompanyService/UserCompanyService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";
interface BusinessStreamprops {
  id: number;
  businessStreamName: string;
  description: string;
}

const CreateCompanyEmployer = ({ navigation }: any) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [establishedYear, setEstablishedYear] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [businessStreamName, setBusinessStreamName] = useState("");
  const [description, setDescription] = useState<string>("");
  const [selectbusinessStream, setSelectBusinessStream] = useState<
    number | null
  >(null);
  const [descriptionBusiness, setDescriptionBusiness] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const [open, setOpen] = useState(false);
  const [selectSize, setSelectSize] = useState(null);
  const [items, setItems] = useState([
    { label: "100", value: 100 },
    { label: "500", value: 500 },
    { label: "1000", value: 1000 },
    { label: "2000", value: 2000 },
    { label: "3000", value: 3000 },
  ]);

  const [openBu, setOpenBu] = useState(false);
  // const [selectBusinessStream, setSelectBusinessStream] = useState(null);
  const [itemsBu, setItemsBu] = useState<{ label: string; value: number }[]>(
    []
  );

  const handleUploadClick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFileUrl(result.assets[0].uri);

      try {
        const fileName = `${uuidv4()}.jpg`;
        const fileRef = ref(storage, fileName);
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        await uploadBytes(fileRef, blob);
        const firebaseFileUrl = await getDownloadURL(fileRef);
        setFileUrl(firebaseFileUrl);
      } catch (error) {
        console.error("Error uploading file:", error);
        Alert.alert(
          "Upload Failed",
          "There was an error uploading the file. Please try again."
        );
      }
    }
  };

  const { mutate: MutateBusinessStream, isPending: Pedingbusiness } =
    useMutation({
      mutationFn: PostBusinessStream,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["BusinessStream"] });
        Alert.alert("Post BusinessStream successfully.");
        setBusinessStreamName("");
        setDescriptionBusiness("");
      },
      onError: () => {
        Alert.alert("Failed to Post BusinessStream details.");
      },
    });
  const handleSubmitBusinessStream = () => {
    MutateBusinessStream({
      data: {
        businessStreamName,
        description: descriptionBusiness,
      },
    });
  };

  const { data: BusinessStream } = useQuery({
    queryKey: ["BusinessStream"],
    queryFn: ({ signal }) => GetBusinessStream({ signal }),
    staleTime: 5000,
  });

  const { mutate: PutIdCompany } = useMutation({
    mutationFn: PostUserCompanyService,
    onSuccess: () => {
      Alert.alert("Update Company Successfully");
      //   const redirectPath = "/employer-verify/jobs/account/company";

      queryClient.invalidateQueries({
        queryKey: ["Company"],
        refetchType: "active",
      });

      //   navigate(redirectPath);
    },
    onError: () => {
      Alert.alert("Failed to Update the Company");
    },
  });
  const { mutate, isPending } = useMutation({
    mutationFn: PostCompanies,
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["Company"] });
      await AsyncStorage.setItem("CompanyId", data.result.toString());

      const storedCompanyId = await AsyncStorage.getItem("CompanyId");
      console.log("Stored CompanyId:", storedCompanyId);

      PutIdCompany({
        data: {
          companyId: Number(data.result),
        },
      });
      navigation.navigate("Employer");
    },

    onError: () => {
      Alert.alert("Failed to update company details.");
    },
  });
  const BusinessStreamData = BusinessStream?.BusinessStreams;

  useEffect(() => {
    if (BusinessStreamData) {
      const formattedItems = BusinessStreamData.map((item) => ({
        label: item.businessStreamName,
        value: item.id,
      }));
      setItemsBu(formattedItems);
    }
  }, [BusinessStreamData]);
  const handleSave = () => {
    // Validate required fields
    if (
      !companyName ||
      !address ||
      !establishedYear ||
      !country ||
      !city ||
      // !businessStreamName ||
      // !descriptionBusiness ||
      !description
    ) {
      Alert.alert("Please fill in all required fields.");
      return;
    }

    const formData = {
      companyName,
      companyDescription: description,
      websiteURL: website,
      establishedYear: parseInt(establishedYear),
      country,
      city,
      address,
      numberOfEmployees: Number(selectSize) || 0,
      businessStreamId: selectbusinessStream || undefined,
      imageUrl: fileUrl,
    };

    // Call the mutation
    mutate({ data: formData });
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setCompanyName("");
    setWebsite("");
    setAddress("");
    setEstablishedYear("");
    setCountry("");
    setCity("");
    setBusinessStreamName("");
    setDescriptionBusiness("");
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.logoContainer}>
        {fileUrl ? (
          <Image source={{ uri: fileUrl }} style={styles.logoImage} />
        ) : (
          <FontAwesome name="image" size={72} color="#e8edf2" />
        )}
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleUploadClick}
        >
          <FontAwesome name="camera" size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.logoText}>Logo Company</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Website Company</Text>
        <TextInput
          style={styles.input}
          placeholder="https://"
          value={website}
          onChangeText={(text) => setWebsite(text)}
        />

        <Text style={styles.label}>Company Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Input Company name"
          value={companyName}
          onChangeText={(text) => setCompanyName(text)}
        />

        <Text style={styles.label}>Company Size *</Text>
        {/* <View style={styles.pickerContainer}> */}
          {/* <Picker
            selectedValue={selectSize}
            onValueChange={(itemValue) => setSelectSize(itemValue)}
            style={styles.picker}
          >
            {BusinessStreamData?.map((item) => (
              <Picker.Item label={item.businessStreamName} value={item.id} />
            ))}

            <Picker.Item label="100" value="100" />
            <Picker.Item label="500" value="500" />
            <Picker.Item label="1000" value="1000" />
            <Picker.Item label="2000" value="2000" />
            <Picker.Item label="3000" value="3000" />
          </Picker> */}
          <DropDownPicker
            open={open}
            value={selectSize}
            items={items}
            setOpen={setOpen}
            setValue={setSelectSize}
            setItems={setItems}
            placeholder="Select a company size"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        {/* </View> */}

        <Text style={styles.label}>Company Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Input Company Address"
          value={address}
          onChangeText={(text) => setAddress(text)}
        />

        <Text style={styles.label}>Established Year *</Text>
        <TextInput
          style={styles.input}
          placeholder="Input Established Year"
          keyboardType="numeric"
          value={establishedYear}
          onChangeText={(text) => setEstablishedYear(text)}
        />

        <Text style={styles.label}>Country *</Text>
        <TextInput
          style={styles.input}
          placeholder="Input Country"
          value={country}
          onChangeText={(text) => setCountry(text)}
        />

        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          placeholder="Input City"
          value={city}
          onChangeText={(text) => setCity(text)}
        />

        <Text style={styles.label}> Create Business Stream *</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TextInput
            style={styles.inputbu}
            placeholder="Input Business "
            value={businessStreamName}
            onChangeText={(text) => setBusinessStreamName(text)}
          />
          <TextInput
            style={[styles.inputbu]}
            placeholder="Input Description"
            //   multiline
            //   numberOfLines={4}
            value={descriptionBusiness}
            onChangeText={(text) => setDescriptionBusiness(text)}
          />
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <TouchableOpacity
            style={styles.saveButtonBu}
            onPress={handleSubmitBusinessStream}
          >
            <Text style={styles.buttonText}>Create Business Stream</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.label}> Select Business Stream *</Text>
        {/* <View style={styles.pickerContainer}> */}
          {/* <Picker
            selectedValue={selectbusinessStream}
            onValueChange={(itemValue) => setSelectBusinessStream(itemValue)}
            style={styles.picker}
          >
            {BusinessStreamData?.map((item) => (
              <Picker.Item label={item.businessStreamName} value={item.id} />
            ))}

            <Picker.Item label="Hà Nội" value="2" />
            <Picker.Item label="Đà Nẵng" value="3" />
            <Picker.Item label="Hải Phòng" value="4" />
            <Picker.Item label="Cần Thơ" value="5" />
            <Picker.Item label="Nha Trang" value="6" />
          </Picker> */}
          <DropDownPicker
            open={openBu}
            value={selectbusinessStream}
            items={itemsBu}
            setOpen={setOpenBu}
            setValue={setSelectBusinessStream}
            setItems={setItemsBu}
            placeholder="Select a business stream"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        {/* </View> */}

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Input Description"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={(text) => setDescription(text)}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        {isPending ? (
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.buttonText}>Wait a seconds</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1, // Ensures the ScrollView expands based on content height
    padding: 20,
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 10,
    backgroundColor: "#868d94",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    marginTop: 5,
    fontSize: 14,
    color: "#5e6368",
  },
  formContainer: {
    borderWidth: 1,
    borderColor: "#e8edf2",
    borderRadius: 8,
    padding: 15,
  },
  label: {
    fontSize: 14,
    color: "#5e6368",
    marginBottom: 5,
  },
  input: {
    // width:"50%",
    borderWidth: 1,
    borderColor: "#e8edf2",
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    color: "#333",
    marginBottom: 15,
  },
  inputbu: {
    width: "50%",
    borderWidth: 1,
    borderColor: "#e8edf2",
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    color: "#333",
    marginBottom: 15,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#f5f8fa",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#FF6F61",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveButtonBu: {
    width: "70%",

    backgroundColor: "#FF6F61",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#f9f9fb",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    height: 50,
    marginBottom: 10, // Spacing below the dropdown
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    elevation: 5, // Adds shadow on Android
    shadowColor: "#000", // Adds shadow on iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default CreateCompanyEmployer;
