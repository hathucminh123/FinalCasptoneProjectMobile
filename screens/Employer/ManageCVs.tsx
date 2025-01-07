import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Button,
  StyleSheet,
  ScrollView,
  Linking,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import StepModal from "../../components/Employer/StepModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetJobPost } from "../../Services/JobsPost/GetJobPosts";
import { GetSeekerJobPost } from "../../Services/JobsPost/GetSeekerJobPost";
import { PostJobActivityComment } from "../../Services/JobActivityComment/PostJobActivityComment";
import { queryClient } from "../../Services/mainService";
import { Alert } from "react-native";
import _ from "lodash";
import ModalScore from "../../screensModal/Employer/ScoreModal";
import GradientCircularProgress from "../../components/GradientCircularProgress";
interface SeekersByJobPost {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string; // Số điện thoại lưu dưới dạng chuỗi
  cvId: number;
  cvPath: string;
  jobPostActivityId: number;
  status: string;
  jobPostActivityComments: Comment[];
  extractedCVInfo: ExtractedCVInfo; // Thêm extractedCVInfo
  analyzedResult: AnalyzedResult;
}

interface Comment {
  id: number;
  commentText: string;
  commentDate: string;
  rating: number;
}

interface ExtractedCVInfo {
  success: boolean;
  data: ExtractedData[];
}

interface ExtractedData {
  personal: PersonalInfo;
  professional: ProfessionalInfo;
}

interface PersonalInfo {
  contact: string[];
  email: string[];
  github: string[];
  linkedin: string[];
  location: string[];
  name: string[];
}

interface ProfessionalInfo {
  education: Education[];
  experience: Experience[];
  technical_skills: string[];
  non_technical_skills: string[];
  tools: string[];
}

interface Education {
  qualification: string | null;
  university: string[];
}

interface Experience {
  company: string[];
  role: string[];
  years: string[];
  project_experience: string[];
}

interface AnalyzedResult {
  success: boolean;
  processingTime: number;
  deviceUsed: string;
  matchDetails: MatchDetails;
}

interface MatchDetails {
  jobId: number;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  scores: Scores;
  skillAnalysis: SkillAnalysis;
  experienceAnalysis: ExperienceAnalysis;
  recommendation: Recommendation;
}

interface Scores {
  overallMatch: number;
  skillMatch: number;
  experienceMatch: number;
  contentSimilarity: number;
}

interface SkillAnalysis {
  matchingSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
}

interface ExperienceAnalysis {
  requiredYears: number;
  candidateYears: number;
  meetsRequirement: boolean;
}

interface Recommendation {
  category: string;
  action: string;
}
const ManageCVs = ({ navigation }: any) => {
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCV, setSelectedCV] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");
  const [commentText, setCommentText] = useState("");
  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [auth, setAuth] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const { width } = Dimensions.get("window");
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  console.log("kaka", selectedJob);
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

  const [openModalScore, setOpenModalScore] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [profileScore, setProfileScore] = useState<SeekersByJobPost | null>(
    null
  );

  const {
    data: JobPosts,
    isLoading: isJobLoading,
    isError: isJobError,
  } = useQuery({
    queryKey: ["JobPosts"],
    queryFn: ({ signal }) => GetJobPost({ signal }),
    staleTime: 5000,
  });

  const JobPostsdata = JobPosts?.JobPosts;
  //   const CompanyId = localStorage.getItem("CompanyId");
  const JobinCompany = useMemo(
    () =>
      JobPosts?.JobPosts?.filter(
        (item) => item.companyId === Number(companyId)
      ),
    [JobPosts, companyId]
  );

  const { data: SeekerApply, isLoading: isSeekerLoading } = useQuery({
    queryKey: ["SeekerApply", selectedJob],
    queryFn: () => GetSeekerJobPost({ id: Number(selectedJob) }),
    enabled: !!selectedJob,
  });

  const dataSeekerApply = SeekerApply?.GetSeekers;
  //   const dataSeekerApply = [
  //     { id: 1, fullName: "John Doe", Email: "john@example.com", phoneNumber: "123456789", cvFile: "CV link", status: "Pending" },
  //     { id: 2, fullName: "Jane Doe", Email: "jane@example.com", phoneNumber: "987654321", cvFile: "CV link", status: "Accepted" },
  //   ];

  const filteredCandidates = useMemo(() => {
    if (!SeekerApply?.GetSeekers) return [];
    return _.filter(SeekerApply.GetSeekers, (item) => {
      const term = searchTerm.toLowerCase();
      const fullName =
        `${item.firstName} ${item.lastName}`.trim() || item.userName;
      const isNameOrContactMatch =
        _.includes(fullName.toLowerCase(), term) ||
        _.includes(item.email?.toLowerCase(), term) ||
        _.includes(item.phoneNumber?.toString(), term);

      const isStateMatch =
        selectedState === "All" ? true : item.status === selectedState;
      return isNameOrContactMatch && isStateMatch;
    });
  }, [SeekerApply, searchTerm, selectedState]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentJobPostId, setCurrentJobPostId] = useState<number | null>(null);
  const { mutate: PostComment } = useMutation({
    mutationFn: PostJobActivityComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["SeekerApply"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["Comment"],
        refetchType: "active",
      });
      Alert.alert("Comment and rating added successfully!");
    },
    onError: () => {
      Alert.alert("Failed to Update the status set");
    },
  });
  const handleModalFinish = (
    status: string,
    comment: string,
    rating: number,
    id: number | null
  ) => {
    PostComment({
      data: {
        commentText: comment,
        commentDate: new Date().toISOString(),
        rating: status,
        jobPostActivityId: id,
      },
    });
    setIsModalVisible(false);
  };

  const handleEditClick = (id: number) => {
    setIsModalVisible(true);
    console.log("hellofdsfds");
    setCurrentJobPostId(id);
  };
  const handleViewComments = (id: number) => {
    navigation.navigate("CommentScreen", { commentId: id });
  };

  const handleSearch = (text: any) => {
    setSearchTerm(text);
  };

  const handleOpenModal = (status: any) => {
    setSelectedStatus(status);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setStep(0);
    setCommentText("");
  };

  const handleStepChange = (nextStep: any) => {
    setStep(nextStep);
  };
  const debouncedHandleSearch = useCallback(
    _.debounce((text) => {
      setSearchTerm(text);
    }, 300),
    []
  );

  // const paginatedCandidates = useMemo(() => {
  //   const start = (page - 1) * itemsPerPage;
  //   const end = start + itemsPerPage;
  //   return filteredCandidates.slice(start, end);
  // }, [filteredCandidates, page]);

  // const handleLoadMore = () => {
  //   if (paginatedCandidates.length < filteredCandidates.length) {
  //     setPage((prevPage) => prevPage + 1);
  //   }
  // };
  const chunkedCandidates = useMemo(() => {
    return _.chunk(filteredCandidates, itemsPerPage);
  }, [filteredCandidates, itemsPerPage]);

  const handleNavigateProfile = (id: number, data: SeekersByJobPost) => {
    setOpenModalScore(true);
    setSelectedId(id);
    setProfileScore(data);
  };

  const handleCloseModal = () => {
    setOpenModalScore(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Candidate CV Management </Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Input name, email, phone number"
          value={searchTerm}
          onChangeText={debouncedHandleSearch}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={20} color="#FF6F61" />
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedJob}
          onValueChange={(itemValue) => setSelectedJob(itemValue)}
          style={styles.picker}
        >
          {JobinCompany?.map((job) => (
            <Picker.Item label={job.jobTitle} value={job.id} />
          ))}
          {/* <Picker.Item label="Select JobPost Stream" value="" /> */}
          {/* <Picker.Item label="Job 1" value="job1" />
          <Picker.Item label="Job 2" value="job2" /> */}
        </Picker>
        <Picker
          selectedValue={selectedState}
          onValueChange={(itemValue) => setSelectedState(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select State Candidate CV" value="All" />
          <Picker.Item label="Passed" value="Passed" />
          <Picker.Item label="Rejected" value="Rejected" />
          <Picker.Item label="CVScreeningPassed" value="CVScreeningPassed" />
          <Picker.Item label="InterviewStage" value="InterviewStage" />
          {/* <Picker.Item label="Rejected" value="Rejected" /> */}
        </Picker>
      </View>
      {openModalScore && (
        <ModalScore
          onClose={handleCloseModal}
          id={selectedId}
          profileUser={profileScore}
        />
      )}
      {isSeekerLoading ? (
        <ActivityIndicator size={100} color="#FF6F61" />
      ) : (
        <FlatList
          data={filteredCandidates}
          keyExtractor={(item) => item.id.toString()}
          // onEndReached={handleLoadMore}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.label}>Full Name:</Text>
                <Text style={styles.value}>
                  {`${item.firstName} ${item.lastName}`.trim() || item.userName}
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{item.email}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.label}>Phone Number:</Text>
                <Text style={styles.value}>
                  {item.phoneNumber || "Not provided"}
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.label}>CV File:</Text>
                <TouchableOpacity onPress={() => Linking.openURL(item.cvPath)}>
                  <Text style={[styles.value, styles.linkText]}>
                    Download CV
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.label}>Status:</Text>
                <Text style={styles.value}>{item.status}</Text>
              </View>
              <View style={styles.cardRow1}>
                <Text style={styles.label}>OverallMatch:</Text>

                <View>
                  {item.analyzedResult.matchDetails && (
                    <GradientCircularProgress
                      percentage={
                        item.analyzedResult.matchDetails.scores.overallMatch
                      }
                    />
                  )}
                </View>
              </View>
              <View>
                {/* <TouchableOpacity
                style={styles.iconButton}
                onPress={() => handleEditClick(item.jobPostActivityId)}
              >
                <Icon name="edit" size={20} color="#555" />
              </TouchableOpacity> */}
                <View style={styles.actionsContainer}>
               
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleEditClick(item.jobPostActivityId)}
                  >
                    <Icon name="edit" size={20} color="#555" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleNavigateProfile(item.id, item)}
                  >
                    <Icon name="visibility" size={20} color="#555" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleViewComments(item.jobPostActivityId)}
                  >
                    <Icon name="comment" size={20} color="#555" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No CVs found</Text>
          }

          // ListFooterComponent={<ActivityIndicator />}
          // ListFooterComponent={
          //   paginatedCandidates.length < filteredCandidates.length ? (
          //     <ActivityIndicator />
          //   ) : null
          // }
        />
      )}

      <StepModal
        id={currentJobPostId}
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onFinish={handleModalFinish}
      />

      <Modal
        visible={openModal}
        animationType="slide"
        onRequestClose={handleModalClose}
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {step === 0 ? (
              <View>
                <Text style={styles.modalTitle}>Update Status</Text>
                <Picker
                  selectedValue={selectedStatus}
                  onValueChange={(itemValue) => setSelectedStatus(itemValue)}
                >
                  <Picker.Item label="Pending" value="1" />
                  <Picker.Item label="Rejected" value="2" />
                  <Picker.Item label="Passed" value="3" />
                </Picker>
                <Button title="Next" onPress={() => handleStepChange(1)} />
              </View>
            ) : (
              <View>
                <Text style={styles.modalTitle}>Input Comment</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Input your comment"
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <Button title="Submit" onPress={handleModalClose} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 16,
  },
  header: {
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#f9f9fb",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  searchButton: {
    marginLeft: 10,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    backgroundColor: "#f9f9fb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  picker: {
    flex: 1,
    height: 50,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10,
  },
  link: {
    paddingVertical: 5,
  },
  linkText: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  commentInput: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2, // Adds shadow on Android
    shadowColor: "#000", // Adds shadow on iOS
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    color: "#333",
    flexShrink: 1,
  },
  //   linkText: {
  //     color: "#007bff",
  //     textDecorationLine: "underline",
  //   },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  iconButton: {
    marginHorizontal: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
  //   pickerContainer: {
  //     borderWidth: 1,
  //     borderColor: "#ddd",
  //     borderRadius: 8,
  //     marginBottom: 20,
  //     backgroundColor: "#f9f9fb",
  //   },
  //   picker: {
  //     height: 50,
  //     width: "100%",
  //   },
  cardRow1: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default ManageCVs;
