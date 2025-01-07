import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "../../Services/CompanyService/GetCompanies";
import { EmailEmployees } from "../../Services/AuthService/EmailEmployeesService";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RenderHTML from "react-native-render-html";
import { LinearGradient } from "expo-linear-gradient";
import { GetJobPost } from "../../Services/JobsPost/GetJobPosts";
import { GetUserProfile } from "../../Services/UserProfileService/UserProfile";
import DropDownPicker from "react-native-dropdown-picker";
import { FontAwesome } from "@expo/vector-icons";
import { fetchCompaniesById } from "../../Services/CompanyService/GetCompanyById";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { storage } from "../../firebase/config";
import { PutCompanies } from "../../Services/CompanyService/PutCompany";
import { queryClient } from "../../Services/mainService";
export default function InfoCompany() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [update, setUpdate] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [auth, setAuth] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const { width } = Dimensions.get("window");
  const [fileUrl, setFileUrl] = useState("");
  const [establishedYear, setEstablishedYear] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const [open, setOpen] = useState(false);
  const [selectSize, setSelectSize] = useState<number | null>(null);
  const [items, setItems] = useState([
    { label: "100", value: 100 },
    { label: "500", value: 500 },
    { label: "1000", value: 1000 },
    { label: "2000", value: 2000 },
    { label: "3000", value: 3000 },
  ]);
  useEffect(() => {
    // Fetch user ID and auth info from AsyncStorage
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      const auth = await AsyncStorage.getItem("Auth");
      const companyId = await AsyncStorage.getItem("CompanyId");
      setAuth(auth);
      setUserId(id);
      setCompanyId(companyId);
    };

    fetchUserId();
  }, []);

  const { data: CompanyData } = useQuery({
    queryKey: ["Company-details", companyId],
    queryFn: ({ signal }) =>
      fetchCompaniesById({ id: Number(companyId), signal }),
    enabled: !!companyId,
  });

  const companyDataa = CompanyData?.Companies;

  // const stripHtmlTags = (html: string) => {
  //   const parser = new DOMParser();
  //   const parsedHtml = parser.parseFromString(html, "text/html");
  //   return parsedHtml.body.innerText || ""; // Extract plain text
  // };

  useEffect(() => {
    if (companyDataa) {
      setCompanyName(companyDataa.companyName || "");
      setDescription(companyDataa.companyDescription || "");
      setSelectSize(companyDataa.numberOfEmployees || null);
      setWebsite(companyDataa.websiteURL || "");
      setFileUrl(companyDataa.imageUrl || "");
      setAddress(companyDataa.address || "");
      setCity(companyDataa.city || "");
      setCountry(companyDataa.country || "");
      setEstablishedYear(companyDataa.establishedYear.toString());
    }
  }, [companyDataa]);

  const { data: UserProfile } = useQuery({
    queryKey: ["UserProfile"],
    queryFn: ({ signal }) =>
      GetUserProfile({ id: Number(userId), signal: signal }),
    enabled: !!userId,
  });

  const UserProfileData = UserProfile?.UserProfiles;

  const { data: Company, refetch: refetchCompanies } = useQuery({
    queryKey: ["Company"],
    queryFn: fetchCompanies,
    staleTime: 5000,
  });
  const {
    data: JobPosts,
    // isLoading: isJobLoading,
    // isError: isJobError,
  } = useQuery({
    queryKey: ["JobPosts"],
    queryFn: ({ signal }) => GetJobPost({ signal: signal }),
    staleTime: 5000,
  });

  const JobPostsdata = JobPosts?.JobPosts;
  const CompaniesData = Company?.Companies;
  const CompanyEmployer = CompaniesData?.find(
    (company) => company.id === Number(companyId)
  );
  const jobsInCompany = JobPostsdata?.filter(
    (item) => item.companyId === CompanyEmployer?.id
  );

  const skillss = jobsInCompany?.map((skill) => skill.skillSets);
  const flattenedArray = skillss?.flat();
  const uniqueArray = [...new Set(flattenedArray)];

  const { mutate, isPending: isPending } = useMutation({
    mutationFn: EmailEmployees,
    onSuccess: () => Alert.alert("Success", "Mail sent successfully"),
    onError: () => Alert.alert("Error", "Failed to update company details."),
  });

  useEffect(() => {
    refetchCompanies();
  }, [refetchCompanies]);

  const { mutate: UpdateCompany } = useMutation({
    mutationFn: PutCompanies,
    onSuccess: () => {
      // console.log("ok chua ta ", data);
      queryClient.invalidateQueries({
        queryKey: ["Company-details"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["Company"],
        refetchType: "active",
      });
      Alert.alert(`update Company details successfully!`);
      // navigate(`/thankyou/${job?.id}`);
    },

    onError: () => {
      Alert.alert("Failed to Update CompanyDetails.");
    },
  });
  const handleSubmit = async () => {
    // mutate({ email: { email: companyName } });
    const updatedCompanyData = {
      id: Number(companyId),
      companyName,
      companyDescription: description,
      numberOfEmployees: selectSize,
      websiteURL: website,
      imageUrl: fileUrl ? fileUrl : companyDataa?.imageUrl,
      address,
      city,
      country: country,
      establishedYear,
    };

    console.log("Updated Company Data:", updatedCompanyData);

    await UpdateCompany({ data: updatedCompanyData });
  };
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

  const handleCancel = () => {
    setCompanyName("");
    setEmail("");
    setWebsite("");
    setPhoneNumber("");
    setAddress("");
    setDescription("");
    setSelectedFile(null);
    setUpdate(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {update ? (
        <View style={styles.addEmployeeContainer}>
          <Text style={styles.addEmployeeTitle}>Add employees</Text>
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
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={handleSubmit}>
              <Text style={styles.sendButtonText}>
                {isPending ? "Wait a second" : "Update"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* <View style={styles.addEmployeeForm}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Input email"
              value={companyName}
              onChangeText={setCompanyName}
            />
          
          </View> */}
        </View>
      ) : (
        <View style={styles.companyInfoContainer}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Update company Information</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setUpdate(true)}
            >
              <Text style={styles.addButtonText}>Edit company</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.companyHeader}>
              <Image
                source={
                  CompanyEmployer
                    ? { uri: CompanyEmployer.imageUrl }
                    : {
                        uri: "https://tuyendung.topcv.vn/images/letter-avatar/CT.png",
                      }
                }
                style={styles.avatar}
              />
              <View style={{ flex: 1, flexWrap: "wrap" }}>
                <Text
                  style={[
                    styles.companyName,
                    { flexShrink: 1, maxWidth: "100%" },
                  ]}
                >
                  {CompanyEmployer?.companyName}
                </Text>
                <Text
                  style={[
                    styles.companyDetails,
                    { flexShrink: 1, maxWidth: "100%" },
                  ]}
                >
                  {CompanyEmployer?.address}, {CompanyEmployer?.city} |{" "}
                  {CompanyEmployer?.numberOfEmployees} employees
                </Text>
              </View>
            </View>
            <View style={styles.companyDetailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Field of operation:</Text>
                <Text style={styles.detailText}>
                  {uniqueArray.map((item, index) => (
                    <React.Fragment key={index}>
                      {item}
                      {index < uniqueArray.length - 1 && " / "}
                    </React.Fragment>
                  ))}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Website Company:</Text>
                <Text style={styles.detailText}>
                  {CompanyEmployer?.websiteURL}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Company Type:</Text>
                {CompanyEmployer?.businessStream.businessStreamName && (
                  <Text style={styles.detailText}>
                    {CompanyEmployer?.businessStream.businessStreamName}
                  </Text>
                )}
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Company Size:</Text>
                <Text style={styles.detailText}>
                  {CompanyEmployer?.numberOfEmployees} employees
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Phone Number:</Text>
                <Text style={styles.detailText}>
                  {UserProfileData?.phoneNumber}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Company Address:</Text>
                <Text style={styles.detailText}>
                  {CompanyEmployer?.address}, {CompanyEmployer?.city}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Company Description:</Text>
                {/* <Text style={styles.detailText}>{CompanyEmployer?.companyDescription}</Text> */}
                {CompanyEmployer?.companyDescription ? (
                  <>
                    <RenderHTML
                      // contentWidth={width - 100}
                      source={{ html: CompanyEmployer.companyDescription }}
                      baseStyle={styles.detailText}
                    />
                    <LinearGradient
                      colors={["transparent", "white"]}
                      style={styles.gradientOverlay}
                    />
                  </>
                ) : (
                  <Text
                    style={styles.detailText}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    Description not available
                  </Text>
                )}
                <View></View>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    padding: 16,
  },
  companyInfoContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#FF6F61",
    padding: 8,
    borderRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  infoContainer: {
    marginTop: 16,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
  },
  companyDetails: {
    color: "#6c757d",
  },
  companyDetailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 20, // Height of the gradient overlay
  },
  label: {
    width: "40%",
    fontWeight: "500",
    color: "#6c757d",
  },
  detailText: {
    width: "60%",
    color: "#343a40",
  },
  addEmployeeContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  addEmployeeTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  addEmployeeForm: {
    marginTop: 8,
  },
  input: {
    height: 40,
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f1f3f5",
    borderRadius: 4,
    marginRight: 8,
  },
  sendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FF6F61",
    borderRadius: 4,
  },
  cancelButtonText: {
    color: "#6c757d",
  },
  sendButtonText: {
    color: "#fff",
  },
  required: {
    color: "#FF6F61",
  },
  htmlDescription: {
    color: "#666",
    fontSize: 14,
    lineHeight: 18, // Adjust line height for better text fit
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
  // label: {
  //   fontSize: 14,
  //   color: "#5e6368",
  //   marginBottom: 5,
  // },
  // input: {
  //   // width:"50%",
  //   borderWidth: 1,
  //   borderColor: "#e8edf2",
  //   borderRadius: 5,
  //   padding: 10,
  //   fontSize: 14,
  //   color: "#333",
  //   marginBottom: 15,
  // },
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
  // cancelButton: {
  //   backgroundColor: "#f5f8fa",
  //   borderRadius: 5,
  //   paddingVertical: 10,
  //   paddingHorizontal: 20,
  //   marginRight: 10,
  // },
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
