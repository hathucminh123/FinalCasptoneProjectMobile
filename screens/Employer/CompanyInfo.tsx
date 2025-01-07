import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Button,
  Image,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { fetchCompanies } from "../../Services/CompanyService/GetCompanies";
import { useMutation, useQuery } from "@tanstack/react-query";
import RenderHTML from "react-native-render-html";
import CompanyCard from "../../components/Employer/CompanyCard";
import { SelectCompany } from "../../Services/AuthService/SelectCompanyService";
import { Alert } from "react-native";
import { queryClient } from "../../Services/mainService";
import { GetJobPost } from "../../Services/JobsPost/GetJobPosts";
import CreateCompanyEmployer from "../../components/Employer/CreateCompanyEmployer";

const CompanyInfo = ({ navigation }: any) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [auth, setAuth] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"find" | "create">("find");
  const [verificationCode, setVerificationCode] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const [companies, setCompanies] = useState([]);

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

  const { data: Company } = useQuery({
    queryKey: ["Company"],
    queryFn: ({ signal }) => fetchCompanies({ signal }),
    staleTime: 5000,
  });
  const Companiesdata = Company?.Companies;
  const { mutate } = useMutation({
    mutationFn: SelectCompany,
    onSuccess: async () => {
      // Added async here
      try {
        await AsyncStorage.setItem(
          "CompanyId",
          selectedCompanyId?.toString() || ""
        );
        Alert.alert("Choose Company Successfully");
        navigation.replace("Employer");

        window.location.reload();

        queryClient.invalidateQueries({
          queryKey: ["Company"],
          refetchType: "active",
        });
      } catch (error) {
        console.error("Failed to store company ID:", error);
      }
    },
    onError: () => {
      Alert.alert("Failed to Choose the Company");
    },
  });

  // Handle choosing a company and open the verification modal
  const handleOnChooseCompanyUser = (id: number) => {
    setSelectedCompanyId(id);

    setOpen(true);
  };

  // Handle submitting the verification code
  const handleSubmitVerification = async () => {
    if (selectedCompanyId) {
      mutate({
        data: {
          companyId: selectedCompanyId,
          employeeId: Number(userId),
          verificationCode: verificationCode,
        },
      });
      // await AsyncStorage.setItem("CompanyId", selectedCompanyId.toString());
      setOpen(false);
    }
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {/* <TouchableOpacity
          style={[styles.tab, activeTab === "find" && styles.activeTab]}
          onPress={() => setActiveTab("find")}
        >
          <FontAwesome
            name="search"
            size={20}
            color={activeTab === "find" ? "#FF7F7F" : "#888"}
          />
          <Text
            style={activeTab === "find" ? styles.activeTabText : styles.tabText}
          >
            Find Company
          </Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[styles.tab, activeTab === "create" && styles.activeTab]}
          onPress={() => setActiveTab("create")}
        >
          <FontAwesome
            name="plus"
            size={20}
            color={activeTab === "create" ? "#FF7F7F" : "#888"}
          />
          <Text
            style={
              activeTab === "create" ? styles.activeTabText : styles.tabText
            }
          >
            Create New
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {/* {activeTab === "find" ? (
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <FontAwesome name="search" size={20} color="#888" />
            <TextInput placeholder="Company Name" style={styles.input} />
          </View>
       
          <FlatList
            data={Companiesdata}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const jobsInCompany = JobPostsdata?.filter(
                (job) => job.companyId === item.id
              );
              return (
                <CompanyCard
                  company={item}
                  onChoose={() => handleOnChooseCompanyUser(item.id)}
                  jobs={jobsInCompany}
                />
              );
            }}
          />
        </View>
      ) : (
        <CreateCompanyEmployer navigation={navigation} />
      )} */}
      <CreateCompanyEmployer navigation={navigation} />
      {/* Modal for Verification Code Entry */}
      <Modal visible={open} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Verification Code</Text>
            <TextInput
              placeholder="Verification Code"
              style={styles.modalInput}
              value={verificationCode}
              onChangeText={(text) => setVerificationCode(text)}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setOpen(false)} />
              <Button
                title="Confirm"
                onPress={handleSubmitVerification}
                color="#FF6F61"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#FF7F7F",
  },
  tabText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF7F7F",
    textAlign: "center",
  },
  searchContainer: {
    flex: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e8edf2",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  createContainer: {
    // flex: 1,
    // padding: 20,
    // backgroundColor: "#f5f8fa",
    // justifyContent: "center",
    // alignItems: "center",
  },
  createText: {
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e8edf2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#FFE6E6",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  companyName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  description: {
    color: "#666",
    fontSize: 14,
    marginTop: 5,
  },
  employees: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
  },
  chooseButton: {
    alignSelf: "center",
    backgroundColor: "#FFD4C3",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  buttonText: {
    color: "#FF6F61",
    fontWeight: "bold",
  },
});

export default CompanyInfo;
