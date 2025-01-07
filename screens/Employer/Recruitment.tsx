// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Modal,
//   StyleSheet,
//   Dimensions,
//   Alert, // To make the layout responsive
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { GetJobPost } from "../../Services/JobsPost/GetJobPosts";
// import { GetSeekerJobPost } from "../../Services/JobsPost/GetSeekerJobPost";
// import { PostJobLcation } from "../../Services/JobPostLocation/PostJobLcation";
// import { queryClient } from "../../Services/mainService";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Picker } from "@react-native-picker/picker"; // Importing Picker
interface JobType {
  id: number;
  name: string;
  description: string;
}

// interface JobLocation {
//   id: number;
//   district: string;
//   city: string;
//   postCode: string;
//   state: string;
//   country: string;
//   stressAddress: string;
// }

interface JobPost {
  id: number;
  jobTitle: string;
  jobDescription: string;
  salary: number;
  postingDate: string;
  expiryDate: string;
  experienceRequired: number;
  qualificationRequired: string;
  benefits: string;
  imageURL: string;
  isActive: boolean;
  companyId: number;
  companyName: string;
  websiteCompanyURL: string;
  jobType: JobType; // jobType là đối tượng JobType
  jobLocationCities: string[];
  jobLocationAddressDetail: string[];
  skillSets: string[]; // Array of skill sets, có thể là array rỗng
}

// const screenWidth = Dimensions.get("window").width;

// export default function Recruitment({ navigation }: any) {
//   const [searchTerm, setSearchTerm] = useState<string>("");

//   const [jobCVCounts, setJobCVCounts] = useState<Record<number, number>>({});
//   const [isFetchingCVs, setIsFetchingCVs] = useState<boolean>(false);
//   const [openModal, setOpenModal] = useState<boolean>(false);
//   const [selectJobId, setSelectJobId] = useState<number | undefined>();
//   const [stressAddressDetail, setStressAddressDetail] = useState<string>("");
//   const [selectedStatus, setSelectedStatus] = useState("1");
//   // const navigation = useNavigation();

//   const [UserId, setUserId] = useState<string | null>(null);
//   const [Auth, setAuth] = useState<string | null>(null);
//   const [companyId, setCompanyId] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchUserId = async () => {
//       const id = await AsyncStorage.getItem("userId");
//       const Auth = await AsyncStorage.getItem("Auth");
//       const CompanyId = await AsyncStorage.getItem("CompanyId");
//       setAuth(Auth);
//       setUserId(id);
//       setCompanyId(CompanyId);
//     };

//     fetchUserId();
//   }, []);

//   const { data: JobPosts, isLoading: isJobLoading } = useQuery({
//     queryKey: ["JobPosts"],
//     queryFn: GetJobPost,
//     staleTime: 5000,
//   });

//   const JobPostsdata = JobPosts?.JobPosts || [];
//   const JobinCompany = useMemo(() => {
//     return JobPostsdata.filter(
//       (item: JobPost) => item.companyId === Number(companyId)
//     );
//   }, [JobPostsdata, companyId]);

//   const filteredJobs = useMemo(() => {
//     if (!searchTerm) return JobinCompany;
//     return JobinCompany.filter((job) =>
//       job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [JobinCompany, searchTerm]);

//   const fetchCVsForJobs = useCallback(async () => {
//     if (JobinCompany) {
//       setIsFetchingCVs(true);
//       const cvCounts: Record<number, number> = {};
//       await Promise.all(
//         JobinCompany.map(async (job) => {
//           const seekerData = await GetSeekerJobPost({ id: job.id });
//           const data = seekerData?.GetSeekers?.length || 0;
//           cvCounts[job.id] = data;
//         })
//       );
//       setJobCVCounts(cvCounts);
//       setIsFetchingCVs(false);
//     }
//   }, [JobinCompany]);

//   const { mutate } = useMutation({
//     mutationFn: PostJobLcation,
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["JobPosts"],
//       });
//       Alert.alert("Success", "Job location has been successfully updated.", [
//         { text: "OK" },
//       ]);
//       setOpenModal(false);
//     },
//     onError: () => {
//       // Show error message
//       Alert.alert(
//         "Error",
//         "Failed to update the job location. Please try again.",
//         [{ text: "OK" }]
//       );
//     },
//   });

//   useEffect(() => {
//     fetchCVsForJobs();
//   }, [fetchCVsForJobs]);

//   const handleEditClick = (id: number) => {
//     setSelectJobId(id);
//     setOpenModal(true);
//   };

//   const handleFindTalent=(id:number)=>{
//     navigation.navigate("Talents",{jobId:id})
//   }

//   const handleViewCV = (id: number) => {
//     navigation.navigate("AppliedCV", { jobId: id });
//   };


  

//   const handleSave = () => {
//     if (selectJobId) {
//       mutate({
//         data: {
//           locationId: Number(selectedStatus), // Assuming default location
//           jobPostId: selectJobId,
//           stressAddressDetail,
//         },
//       });
//     }
//   };

//   if (isJobLoading) {
//     return <ActivityIndicator size={100} color="#0000ff" />;
//   }

//   return (
//     <ScrollView style={styles.container}>
//       {/* Search Bar */}
//       <View style={styles.searchSection}>
//         <Icon name="search" size={20} color="#868d94" />
//         <TextInput
//           style={styles.input}
//           placeholder="Search for job postings"
//           value={searchTerm}
//           onChangeText={(text) => setSearchTerm(text)}
//         />
//       </View>

//       {/* Job Table Header */}
//       <View style={styles.tableHeader}>
//         <Text style={styles.tableHeaderText}>Jobs title</Text>
//         {/* <Text style={styles.tableHeaderText}>Status</Text> */}
//         <Text style={styles.tableHeaderText}>System-generated CVs</Text>
//         {/* <Text style={styles.tableHeaderText}>Filter CVs</Text> */}
//       </View>

//       {/* Job Table Content */}
//       {filteredJobs.map((job: JobPost, index) => (
//         <View
//           key={job.id}
//           style={[
//             styles.jobRow,
//             index % 2 === 0 ? styles.evenRow : styles.oddRow,
//           ]}
//         >
//           <View style={{ position: "absolute", right: 10, top: 5 }}>
//             <TouchableOpacity
//               style={styles.button}
//               onPress={() =>
//                 navigation.navigate("EditJobDetails", { jobId: job?.id })
//               }
//             >
//               <Icon name="edit" size={24} color="#000" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.jobColumn}>
//             <></>

//             {/* <Text style={styles.jobId}>{job.id}</Text> */}

//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Text style={styles.jobTitle}>{job.jobTitle}</Text>
//             </View>
//             <Text style={styles.cvInfo}>
//               {jobCVCounts[job.id]
//                 ? `Have ${jobCVCounts[job.id]} CV Applied`
//                 : "No CV yet"}
//             </Text>
//             <TouchableOpacity onPress={() => handleViewCV(job.id)}>
//               <Text style={styles.link}>View Candidate's CV</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => handleEditClick(job.id)}>
//               <Text style={styles.link}>Add JobLocation</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => handleFindTalent(job.id)}>
//               <Text style={styles.link}>Find Talents</Text>
//             </TouchableOpacity>
//           </View>

//           {/* <Text style={styles.jobStatus}>Approved</Text> */}

//           <TouchableOpacity style={styles.detailsButton}>
//             <Icon name="remove-red-eye" size={20} color="#a8afb6" />
//             <Text style={styles.detailsButtonText}>View Details</Text>
//           </TouchableOpacity>

//           {/* <TouchableOpacity style={styles.findCvButton}>
//             <Text style={styles.findCvButtonText}>Find CVs</Text>
//           </TouchableOpacity> */}
//         </View>
//       ))}

//       {/* Modal for editing job location */}
//       <Modal
//         visible={openModal}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setOpenModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Update Status</Text>

//             {/* Picker for selecting location */}
//             <View style={styles.pickerContainer}>
//               <Picker
//                 selectedValue={selectedStatus}
//                 onValueChange={(itemValue) => setSelectedStatus(itemValue)}
//                 style={styles.picker}
//               >
//                 <Picker.Item label="Hồ Chí Minh" value="1" />
//                 <Picker.Item label="Hà Nội" value="2" />
//                 <Picker.Item label="Đà Nẵng" value="3" />
//                 <Picker.Item label="Hải Phòng" value="4" />
//                 <Picker.Item label="Cần Thơ" value="5" />
//                 <Picker.Item label="Nha Trang" value="6" />
//               </Picker>
//             </View>

//             {/* Text input for stressAddressDetail */}
//             <TextInput
//               style={styles.inputmodal}
//               placeholder="Input your address"
//               value={stressAddressDetail}
//               onChangeText={setStressAddressDetail}
//             />

//             <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
//               <Text style={styles.saveButtonText}>Save</Text>
//             </TouchableOpacity>

//             {/* Cancel Button */}
//             <TouchableOpacity
//               onPress={() => setOpenModal(false)}
//               style={styles.cancelButton}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// }
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GetJobPost } from "../../Services/JobsPost/GetJobPosts";
import { GetSeekerJobPost } from "../../Services/JobsPost/GetSeekerJobPost";
import { PostJobLcation } from "../../Services/JobPostLocation/PostJobLcation";
import { queryClient } from "../../Services/mainService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";

const screenWidth = Dimensions.get("window").width;

export default function Recruitment({ navigation }: any) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [jobCVCounts, setJobCVCounts] = useState<Record<number, number>>({});
  const [isFetchingCVs, setIsFetchingCVs] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectJobId, setSelectJobId] = useState<number | undefined>();
  const [stressAddressDetail, setStressAddressDetail] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false); // For DropDownPicker
  const [UserId, setUserId] = useState<string | null>(null);
  const [Auth, setAuth] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const dropdownOptions = [
    { label: "Hồ Chí Minh", value: "1" },
    { label: "Hà Nội", value: "2" },
    { label: "Đà Nẵng", value: "3" },
    { label: "Hải Phòng", value: "4" },
    { label: "Cần Thơ", value: "5" },
    { label: "Nha Trang", value: "6" },
  ];

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      const Auth = await AsyncStorage.getItem("Auth");
      const CompanyId = await AsyncStorage.getItem("CompanyId");
      setAuth(Auth);
      setUserId(id);
      setCompanyId(CompanyId);
    };

    fetchUserId();
  }, []);

  const { data: JobPosts, isLoading: isJobLoading } = useQuery({
    queryKey: ["JobPosts"],
    queryFn: GetJobPost,
    staleTime: 5000,
  });

  const JobPostsdata = JobPosts?.JobPosts || [];
  const JobinCompany = useMemo(() => {
    return JobPostsdata.filter(
      (item: JobPost) => item.companyId === Number(companyId)
    );
  }, [JobPostsdata, companyId]);

  const filteredJobs = useMemo(() => {
    if (!searchTerm) return JobinCompany;
    return JobinCompany.filter((job) =>
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [JobinCompany, searchTerm]);

  const fetchCVsForJobs = useCallback(async () => {
    if (JobinCompany) {
      setIsFetchingCVs(true);
      const cvCounts: Record<number, number> = {};
      await Promise.all(
        JobinCompany.map(async (job) => {
          const seekerData = await GetSeekerJobPost({ id: job.id });
          const data = seekerData?.GetSeekers?.length || 0;
          cvCounts[job.id] = data;
        })
      );
      setJobCVCounts(cvCounts);
      setIsFetchingCVs(false);
    }
  }, [JobinCompany]);

  const { mutate } = useMutation({
    mutationFn: PostJobLcation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["JobPosts"],
      });
      Alert.alert("Success", "Job location has been successfully updated.", [
        { text: "OK" },
      ]);
      setOpenModal(false);
    },
    onError: () => {
      Alert.alert(
        "Error",
        "Failed to update the job location. Please try again.",
        [{ text: "OK" }]
      );
    },
  });

  useEffect(() => {
    fetchCVsForJobs();
  }, [fetchCVsForJobs]);

  const handleEditClick = (id: number) => {
    setSelectJobId(id);
    setOpenModal(true);
  };

  const handleFindTalent = (id: number) => {
    navigation.navigate("Talents", { jobId: id });
  };

  const handleViewCV = (id: number) => {
    navigation.navigate("AppliedCV", { jobId: id });
  };

  const handleSave = () => {
    if (selectJobId && selectedStatus) {
      mutate({
        data: {
          locationId: Number(selectedStatus),
          jobPostId: selectJobId,
          stressAddressDetail,
        },
      });
    }
  };

  if (isJobLoading) {
    return <ActivityIndicator size={100} color="#0000ff" />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchSection}>
        <Icon name="search" size={20} color="#868d94" />
        <TextInput
          style={styles.input}
          placeholder="Search for job postings"
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
        />
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Jobs title</Text>
        <Text style={styles.tableHeaderText}>System-generated CVs</Text>
      </View>

      {filteredJobs.map((job: any, index) => (
        <View
          key={job.id}
          style={[
            styles.jobRow,
            index % 2 === 0 ? styles.evenRow : styles.oddRow,
          ]}
        >
          <TouchableOpacity style={{ position: "absolute", right: 20, top: 5 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate("EditJobDetails", { jobId: job?.id })
              }
            >
              <Icon name="edit" size={24} color="#000" />
            </TouchableOpacity>
          </TouchableOpacity>
          <View style={styles.jobColumn}>
            <Text style={styles.jobTitle}>{job.jobTitle}</Text>
            <Text style={styles.cvInfo}>
              {jobCVCounts[job.id]
                ? `Have ${jobCVCounts[job.id]} CV Applied`
                : "No CV yet"}
            </Text>
            <TouchableOpacity onPress={() => handleViewCV(job.id)}>
              <Text style={styles.link}>View Candidate's CV</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEditClick(job.id)}>
              <Text style={styles.link}>Add JobLocation</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleFindTalent(job.id)}>
              <Text style={styles.link}>Find Talents</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

<Modal
  visible={openModal}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setOpenModal(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Update Status</Text>
      <DropDownPicker
        open={dropdownOpen}
        value={selectedStatus}
        items={dropdownOptions}
        setOpen={setDropdownOpen}
        setValue={setSelectedStatus}
        placeholder="Select a location"
        style={styles.dropdown} // Style for the dropdown button
        dropDownContainerStyle={styles.dropdownContainer} // Style for the dropdown list
      />
      <TextInput
        style={styles.inputmodal}
        placeholder="Input your address"
        value={stressAddressDetail}
        onChangeText={setStressAddressDetail}
      />
      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setOpenModal(false)}
        style={styles.cancelButton}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5", // Light neutral background for an inviting look
    padding: 15, // Increased padding for better spacing
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6, // Enhanced shadow for a floating effect
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
    fontWeight: "500", // Slightly bolder for readability
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "#f9fafc",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 15,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
    // textAlign: "center",
  },
  jobRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  evenRow: {
    backgroundColor: "#fefefe",
  },
  oddRow: {
    backgroundColor: "#f7f9fc", // Lightened row color for alternation
  },
  jobColumn: {
    flex: 1.5,
    justifyContent: "flex-start",
  },
  jobId: {
    fontSize: 14,
    color: "#666",
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222", // Dark color for emphasis
    marginBottom: 8,
  },
  cvInfo: {
    fontSize: 14,
    color: "#888", // Muted but readable color
    marginBottom: 6,
  },
  link: {
    color: "#FF6F61",
    fontSize: 15,
    fontWeight: "500",
    textDecorationLine: "underline",
    marginBottom: 8,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f0f4f8", // Soft color to complement other styles
    marginLeft: 12,
  },
  detailsButtonText: {
    color: "#333",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Darker overlay for better modal focus
  },
  modalContainer: {
    width: screenWidth * 0.85,
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#444",
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
  inputmodal: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },
  saveButton: {
    backgroundColor: "#FF6F61",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#FF6F61",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FF6F61",
    fontWeight: "bold",
    fontSize: 16,
  },
  button: {
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: "#E9EEF4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
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
