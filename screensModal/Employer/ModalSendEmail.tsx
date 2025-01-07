import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import PercentileChart from "./PercentileChart";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetUserProfile } from "../../Services/UserProfileService/UserProfile";
import { CustomEmail } from "../../Services/CustomEmail/CustomEmail";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCompaniesById } from "../../Services/CompanyService/GetCompanyById";
import { RadioButton } from "react-native-paper";
import { queryClient } from "../../Services/mainService";
import { PostCVsAI } from "../../Services/CVService/PostCVAI";
import { AddUserJobPostActivity } from "../../Services/JobsPostActivity/AddUser";
import { GetJobPostById } from "../../Services/JobsPost/GetJobPostById";
import { GetSeekerJobPost } from "../../Services/JobsPost/GetSeekerJobPost";

interface EducationDetail {
  id: number;
  name: string;
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: number;
}
interface ExperienceDetail {
  id: number;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
  achievements: string;
}
interface SkillSet {
  id: number;
  name: string;
  shorthand: string;
  description: string; // HTML content as a string
  proficiencyLevel?: string;
}

interface CVs {
  id: number;
  url: string;
  name: string;
}
interface UserProfile {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  educationDetails: EducationDetail[];
  experienceDetails: ExperienceDetail[];
  cvs: CVs[];
  skillSets: SkillSet[];
}

interface Comment {
  id: number;
  commentText: string;
  commentDate: string;
  rating: number;
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
interface Props {
  onClose?: () => void;
  profileUser: UserProfile | null;
  id?: number | null;
  idJob?: number | null;
}

const ModalSendEmail = ({ onClose, profileUser, id, idJob }: Props) => {
  const [activeTab, setActiveTab] = useState<"details" | "sendEmail" | "CVs">(
    "details"
  );
  const [selectedCV, setSelectedCV] = useState<string | null>(null);
  const [selectedCVId, setSelectedCVId] = useState<number | null>(null);
  const [selectedCvUrl, setSelectedCvUrl] = useState<string | null>(null);
  const [emailContent, setEmailContent] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  useEffect(() => {
    // Fetch user ID and auth info from AsyncStorage
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      const auth = await AsyncStorage.getItem("Auth");
      const companyId = await AsyncStorage.getItem("CompanyId");
      // setAuth(auth);
      // setUserId(id);
      setCompanyId(companyId);
    };

    fetchUserId();
  }, []);

  const { data: jobData } = useQuery({
    queryKey: ["Job-details", id],
    queryFn: ({ signal }) => GetJobPostById({ id: Number(idJob), signal }),
    enabled: !!id,
  });
  const job = jobData?.JobPosts;

  const {
    data: SeekerApply,
    // isLoading: isSeekerLoading,
    // isError: isSeekerError,
  } = useQuery({
    queryKey: ["SeekerApply", idJob],
    queryFn: ({ signal }) => GetSeekerJobPost({ id: Number(idJob), signal }),
    enabled: !!idJob,
  });
  const dataSeekerApply = SeekerApply?.GetSeekers;

  const feedBackUserJob = dataSeekerApply?.find(
    (item) => item.id === Number(profileUser?.id)
  );

  const { data: CompanyData } = useQuery({
    queryKey: ["Company-details", companyId],
    queryFn: ({ signal }) =>
      fetchCompaniesById({ id: Number(companyId), signal }),
    enabled: !!companyId,
  });

  const companyDataa = CompanyData?.Companies;

  const { data: UserProfile } = useQuery({
    queryKey: ["UserProfile"],
    queryFn: ({ signal }) => GetUserProfile({ id: Number(id), signal: signal }),
    staleTime: 1000,
  });

  const profile = UserProfile?.UserProfiles;

  const { mutate, isPending } = useMutation({
    mutationFn: CustomEmail,
    onSuccess: () => {
      // queryClient.invalidateQueries({
      //   queryKey: ["JobPostActivity"],
      //   refetchType: "active", // Ensure an active refetch
      // });
      Alert.alert(`Send Email successfully!`);
      // navigate(`/thankyou/${job?.id}`);
    },
    onError: () => {
      Alert.alert("Failed to Send Email.");
    },
  });

  const handleSendEmail = () => {
    // e.preventDefault();

    if (!emailContent || emailContent.trim() === "") {
      console.error("Email content is required");
      return;
    }

    const formattedCompanyName = companyDataa?.companyName
      .replace(/\s{2,}/g, " ")
      .trim();

    mutate({
      data: {
        content: emailContent,
        // companyName: formattedCompanyName,
        companyName: "fpt",
        reciveUser: profileUser?.email,
      },
    });
  };

  const handleSelectCV = (id: number, name: string, url: string) => {
    setSelectedCV(name);
    setSelectedCVId(id);
    setSelectedCvUrl(url);
  };
  const { mutate: PostCVAi } = useMutation({
    mutationFn: PostCVsAI,
    onSuccess: (data) => {
      // console.log("ok chua ta ", data);
      // queryClient.invalidateQueries({
      //   queryKey: ["JobPostActivity"],
      //   refetchType: "active", // Ensure an active refetch
      // });
      // message.success(`CV Apply to ${job?.jobTitle} successfully!`);
      // navigate(`/thankyou/${job?.id}`);
    },
    onError: () => {
      Alert.alert("Failed to Apply CV .");
    },
  });

  const { mutate: Add, isPending: Adding } = useMutation({
    mutationFn: AddUserJobPostActivity,
    onSuccess: async () => {
      try {
        await PostCVAi({
          data: {
            jobPostId: Number(idJob),
            url: selectedCvUrl ?? "",
            cvId: selectedCVId,
            userId: profileUser?.id,
          },
        });

        Alert.alert(`Add user to InterView at ${job?.jobTitle} successfully!`);
        queryClient.invalidateQueries({
          queryKey: ["JobPostActivity"],
          refetchType: "active",
        });
      } catch {
        Alert.alert("Failed to apply CV after adding user to interview.");
      }
    },
    // onSuccess: () => {

    //   PostCVAi({
    //     data: {
    //       jobPostId: job?.id,
    //       url: selectedCvUrl,
    //     },
    //   });

    //   message.success(
    //     `Add user to InterView at  ${job?.jobTitle} successfully!`
    //   );
    // },

    onError: () => {
      Alert.alert("Failed to Add User InterView.");
    },
  });

  const handleAddUser = async () => {
    // Ensure selectedCVId and selectedCvUrl are present before proceeding
    if (selectedCVId && selectedCvUrl) {
      try {
        // Call the Add function with necessary data
        await Add({
          data: {
            jobPostId: job?.id, // Use optional chaining to avoid errors
            cvId: selectedCVId, // Use selectedCVId directly (since you checked it exists)
            userId: profile?.id, // Use optional chaining for profile
          },
        });
        console.log("User added successfully!");
      } catch (error) {
        // Catch and handle any errors from the Add function
        console.error("Error adding user:", error);
      }
    } else {
      // Handle case where required data is missing
      console.warn("selectedCVId or selectedCvUrl is missing.");
    }
  };

  const expiryDate = job?.expiryDate ? new Date(job?.expiryDate) : null;
  const today = new Date();

  const isExpired = expiryDate ? expiryDate < today : undefined;
  return (
    <Modal
      transparent
      //   visible={!!id}
      onRequestClose={onClose}
      animationType="slide"
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "details" && styles.activeTab]}
              onPress={() => setActiveTab("details")}
            >
              <Text style={styles.tabText}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "sendEmail" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("sendEmail")}
            >
              <Text style={styles.tabText}>Send Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "CVs" && styles.activeTab]}
              onPress={() => setActiveTab("CVs")}
            >
              <Text style={styles.tabText}>View CVs</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "details" ? (
            <ScrollView style={{ height: 500 }}>
              {/* Profile Details Code */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  {profile?.firstName} {profile?.lastName}
                </Text>
                <Text style={styles.subHeader}>
                  Email: {profile?.email} • Phone: {profile?.phoneNumber}
                </Text>
              </View>
              <View style={styles.section1}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Experience</Text>
                  {profileUser?.experienceDetails &&
                  profileUser.experienceDetails.length > 0 ? (
                    profileUser.experienceDetails.map((exp, index) => (
                      <View key={index} style={styles.experienceItem}>
                        <Text style={styles.expCompany}>
                          Company Name: {exp.companyName}
                        </Text>
                        <Text style={styles.expPosition}>
                          Position: {exp.position}
                        </Text>
                        <Text style={styles.expDate}>
                          {new Date(exp.startDate).toLocaleString("en", {
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          -{" "}
                          {exp.endDate
                            ? new Date(exp.endDate).toLocaleString("en", {
                                month: "short",
                                year: "numeric",
                              })
                            : "Present"}{" "}
                        </Text>
                        <Text style={styles.expResponsibilities}>
                          {/* Achievements: {exp.achievements} */}
                          Responsibilities:{" "}
                          {exp.responsibilities &&
                            exp.responsibilities.replace(/<\/?[^>]+(>|$)/g, "")}
                        </Text>
                        <Text style={styles.expResponsibilities}>
                          {/* Achievements: {exp.achievements} */}
                          Achievements:{" "}
                          {exp.achievements &&
                            exp.achievements.replace(/<\/?[^>]+(>|$)/g, "")}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text>No experience details available</Text>
                  )}
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Education</Text>
                  {profileUser?.educationDetails &&
                  profileUser.educationDetails.length > 0 ? (
                    profileUser.educationDetails.map((edu, index) => (
                      <View key={index} style={styles.educationItem}>
                        <Text style={styles.eduInstitution}>
                          {edu.institutionName}
                        </Text>
                        <Text style={styles.eduField}>
                          Field of Study: {edu.fieldOfStudy} • GPA: {edu.gpa}
                        </Text>
                        <Text style={styles.eduDate}>
                          {new Date(edu.startDate).toLocaleString("en", {
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          -{" "}
                          {edu.endDate
                            ? new Date(edu.endDate).toLocaleString("en", {
                                month: "short",
                                year: "numeric",
                              })
                            : "Present"}{" "}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text>No education details available</Text>
                  )}
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Skills</Text>
                  <View style={styles.skillsContainer}>
                    {profileUser?.skillSets &&
                    profileUser.skillSets.length > 0 ? (
                      profileUser.skillSets.map((skill, index) => (
                        <View key={index} style={styles.skillBadge}>
                           <Text style={styles.sectionTitle}>{skill.proficiencyLevel}</Text>
                          <Text>{skill.name}</Text>
                        </View>
                      ))
                    ) : (
                      <Text>No skills available</Text>
                    )}
                  </View>
                </View>
                {/* <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Matching Details</Text>
                  <PercentileChart
                    profileResult={profileUser}
                    overallMatch={
                      profileUser?.analyzedResult.matchDetails.scores
                        .overallMatch
                    }
                    skillMatch={
                      profileUser?.analyzedResult.matchDetails.scores.skillMatch
                    }
                    experienceMatch={
                      profileUser?.analyzedResult.matchDetails.scores
                        .experienceMatch
                    }
                    contentSimilarity={
                      profileUser?.analyzedResult.matchDetails.scores
                        .contentSimilarity
                    }
                  />
                </View> */}

                {/* <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Matching Skills</Text>
                  <View style={styles.skillsContainer}>
                    {profileUser?.analyzedResult.matchDetails.skillAnalysis
                      .matchingSkills &&
                    profileUser?.analyzedResult.matchDetails.skillAnalysis
                      .matchingSkills.length > 0 ? (
                      profileUser?.analyzedResult.matchDetails.skillAnalysis.matchingSkills.map(
                        (skill, index) => (
                          <View key={index} style={styles.matchingSkills}>
                            <Text style={styles.skillText}>{skill}</Text>
                          </View>
                        )
                      )
                    ) : (
                      <Text>No skills available</Text>
                    )}
                  </View>
                </View> */}

                {/* <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Missing Skills</Text>
                  <View style={styles.skillsContainer}>
                    {profileUser?.analyzedResult.matchDetails.skillAnalysis
                      .missingSkills &&
                    profileUser?.analyzedResult.matchDetails.skillAnalysis
                      .missingSkills.length > 0 ? (
                      profileUser?.analyzedResult.matchDetails.skillAnalysis.missingSkills.map(
                        (skill, index) => (
                          <View key={index} style={styles.missingSkills}>
                            <Text style={styles.skillTextMis}>{skill}</Text>
                          </View>
                        )
                      )
                    ) : (
                      <Text>No skills Missing</Text>
                    )}
                  </View>
                </View> */}

                {/* <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Additional Skills</Text>
                  <View style={styles.skillsContainer}>
                    {profileUser?.analyzedResult.matchDetails.skillAnalysis
                      .additionalSkills &&
                    profileUser?.analyzedResult.matchDetails.skillAnalysis
                      .additionalSkills.length > 0 ? (
                      profileUser?.analyzedResult.matchDetails.skillAnalysis.additionalSkills.map(
                        (skill, index) => (
                          <View key={index} style={styles.additionalSkills}>
                            <Text style={styles.skillTextAdd}>{skill}</Text>
                          </View>
                        )
                      )
                    ) : (
                      <Text>No Additional skills </Text>
                    )}
                  </View>
                </View> */}
              </View>
            </ScrollView>
          ) : activeTab === "sendEmail" ? (
            <View style={styles.emailContainer}>
              <Text style={styles.sectionTitle}>Compose Email</Text>
              <TextInput
                style={styles.emailInput}
                placeholder="Start writing your email..."
                multiline
                value={emailContent}
                onChangeText={setEmailContent}
              />

              {isPending ? (
                <TouchableOpacity
                  style={styles.sendButton}
                  // onPress={handleSendEmail}
                >
                  <Text style={styles.sendButtonText}>Wait a seconds</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendEmail}
                >
                  <Text style={styles.sendButtonText}>Send Email</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emailContainer}>
              {profile?.cvs.map((cv) => (
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => handleSelectCV(cv.id, cv.name, cv.url)}
                  key={cv.id}
                >
                  <View
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Text style={styles.cvText} numberOfLines={1}>
                      {cv.name}
                    </Text>
                  </View>
                  <RadioButton
                    value={cv.name ?? ""}
                    status={selectedCVId === cv.id ? "checked" : "unchecked"}
                    onPress={() => handleSelectCV(cv.id, cv.name, cv.url)}
                  />
                </TouchableOpacity>
              ))}

              {Adding ? (
                <TouchableOpacity
                  style={styles.sendButton}
                  // onPress={handleAddUser}
                >
                  <Text style={styles.sendButtonText}>wait a seconds </Text>
                </TouchableOpacity>
              ) : feedBackUserJob ? (
                <TouchableOpacity
                  style={styles.sendButtonAdded}
                  // onPress={handleAddUser}
                >
                  <Text style={styles.sendButtonTextAdded}>Added User </Text>
                </TouchableOpacity>
              ) : isExpired ? (
                <TouchableOpacity
                  style={styles.sendButtonn}
                 
                >
                  <Text style={styles.sendButtonText}>Application deadline </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleAddUser}
                >
                  <Text style={styles.sendButtonText}>Add User </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(14, 17, 17, 0.57)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#9194a0",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  activeTab: {
    backgroundColor: "#e0e0e0",
    borderBottomWidth: 3,
    borderBottomColor: "#3b82f6",
  },
  tabText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  emailContainer: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  emailInput: {
    height: 150,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  sendButtonAdded: {
    backgroundColor: "#6b7280", // Màu xám (bạn có thể thay đổi mã màu theo ý muốn)
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
  },
  sendButtonTextAdded: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
  },
  sendButtonn: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  subHeader: {
    fontSize: 14,
    color: "#525769",
  },
  //   header: {
  //     marginBottom: 16,
  //   },
  //   headerTitle: {
  //     fontSize: 20,
  //     fontWeight: "600",
  //   },
  //   subHeader: {
  //     fontSize: 14,
  //     color: "#525769",
  //   },
  section: {
    marginBottom: 16,
  },
  section1: {
    paddingBottom: 50,
  },
  //   sectionTitle: {
  //     fontSize: 16,
  //     fontWeight: "600",
  //     marginBottom: 8,
  //   },
  experienceItem: {
    marginBottom: 12,
  },
  expCompany: {
    fontSize: 14,
    fontWeight: "600",
  },
  expPosition: {
    fontSize: 14,
    color: "#717584",
  },
  expDate: {
    fontSize: 12,
    color: "#9194a0",
  },
  expResponsibilities: {
    fontSize: 12,
    color: "#525769",
  },
  educationItem: {
    marginBottom: 12,
  },
  eduInstitution: {
    fontSize: 14,
    fontWeight: "600",
  },
  eduField: {
    fontSize: 14,
    color: "#717584",
  },
  eduDate: {
    fontSize: 12,
    color: "#9194a0",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillBadge: {
    backgroundColor: "#f5f5f5",
    padding: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  matchingSkills: {
    backgroundColor: "#e0f9ea",
    color: "hsl(144, 63%, 36%)",
    padding: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  skillText: {
    color: "hsl(144, 63%, 36%)",
  },
  missingSkills: {
    backgroundColor: "#fdecea",
    color: "hsl(144, 63%, 36%)",
    padding: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  skillTextMis: {
    color: "#d32f2f",
  },

  additionalSkills: {
    backgroundColor: "#e3f2fd",
    color: "hsl(144, 63%, 36%)",
    padding: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  skillTextAdd: {
    color: "#1e88e5",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
    width: "100%",
  },
  cvText: {
    fontSize: 16,
    flexShrink: 1,
  },
});

export default ModalSendEmail;
