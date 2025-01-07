import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { GetSeekerJobPost } from "../../Services/JobsPost/GetSeekerJobPost";
import StepModal from "../../components/Employer/StepModal";
import { PostJobActivityComment } from "../../Services/JobActivityComment/PostJobActivityComment";
import { queryClient } from "../../Services/mainService";
import GradientCircularProgress from "../../components/GradientCircularProgress";
import ModalScore from "./ScoreModal";

const CvAppliedScreen = ({ route, navigation }: any) => {
  const [activeTab, setActiveTab] = useState("Pending");
  const { jobId } = route.params;

  const { data: SeekerApply } = useQuery({
    queryKey: ["SeekerApply", jobId],
    queryFn: ({ signal }) => GetSeekerJobPost({ id: Number(jobId), signal }),
    enabled: !!jobId,
  });

  const dataSeekerApplied = SeekerApply?.GetSeekers;
  const PendingDataSeekerApply = useMemo(() => {
    return (
      SeekerApply?.GetSeekers?.filter((item) => item.status === "Pending") || []
    );
  }, [SeekerApply]);
  const CVDataSeekerApply = useMemo(() => {
    return (
      SeekerApply?.GetSeekers?.filter(
        (item) => item.status === "CVScreeningPassed"
      ) || []
    );
  }, [SeekerApply]);

  const InterViewDataSeekerApply = useMemo(() => {
    return (
      SeekerApply?.GetSeekers?.filter(
        (item) => item.status === "InterviewStage"
      ) || []
    );
  }, [SeekerApply]);

  const PassedDataSeekerApply = useMemo(() => {
    return (
      SeekerApply?.GetSeekers?.filter((item) => item.status === "Passed") || []
    );
  }, [SeekerApply]);

  const RejectedDataSeekerApply = useMemo(() => {
    return (
      SeekerApply?.GetSeekers?.filter((item) => item.status === "Rejected") ||
      []
    );
  }, [SeekerApply]);

  const renderContent = () => {
    switch (activeTab) {
      case "Pending":
        return (
          <CvAppliedContent
            data={PendingDataSeekerApply}
            navigation={navigation}
          />
        );
      case "CVScreening":
        return (
          <CvRecommendContent
            data={CVDataSeekerApply}
            navigation={navigation}
          />
        );
      case "InterView":
        return (
          <CvFindContent
            data={InterViewDataSeekerApply}
            navigation={navigation}
          />
        );
      case "InterviewPassed":
        return (
          <InterviewPassedContent
            data={PassedDataSeekerApply}
            navigation={navigation}
          />
        );
      case "Rejected":
        return (
          <Rejected data={RejectedDataSeekerApply} navigation={navigation} />
        );
      default:
        return null;
    }
  };

  // const InterviewPassedContent = () => (
  //   <View style={styles.contentContainer}>
  //     <Text style={styles.contentTitle}>Interview Passed Content</Text>
  //     {/* Add your specific content or component for "Interview Passed" here */}
  //   </View>
  // );

  const Rejected = ({ data, navigation }: CvAppliedContentProps) => {
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [currentJobPostId, setCurrentJobPostId] = useState<number | null>(
      null
    );
    const [openModalScore, setOpenModalScore] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [profileScore, setProfileScore] = useState<SeekersByJobPost | null>(
      null
    );
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
      setCurrentJobPostId(id);
    };
    const handleViewComments = (id: number) => {
      navigation.navigate("CommentScreen", { commentId: id });
    };

    const handleNavigateProfile = (id: number, data: SeekersByJobPost) => {
      setOpenModalScore(true);
      setSelectedId(id);
      setProfileScore(data);
    };

    const handleCloseModal = () => {
      setOpenModalScore(false);
    };

    return (
      <>
        {openModalScore && (
          <ModalScore
            onClose={handleCloseModal}
            id={selectedId}
            profileUser={profileScore}
          />
        )}

        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
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
              {/* <View style={styles.cardRow1}>
                <Text style={styles.label}>OverallMatch:</Text>

                <View>
                  <GradientCircularProgress
                    percentage={
                      item.analyzedResult.matchDetails.scores.overallMatch
                    }
                  />
                </View>
              </View> */}
               {item.analyzedResult.matchDetails && (
              <View style={styles.cardRow1}>
                <Text style={styles.label}>OverallMatch:</Text>

                <View>
                  <GradientCircularProgress
                    percentage={
                      item.analyzedResult.matchDetails.scores.overallMatch
                    }
                  />
                </View>
              </View>
            )}

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
        />
        <StepModal
          id={currentJobPostId}
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onFinish={handleModalFinish}
        />
      </>
    );
  };

  const InterviewPassedContent = ({
    data,
    navigation,
  }: CvAppliedContentProps) => {
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [currentJobPostId, setCurrentJobPostId] = useState<number | null>(
      null
    );
    const [openModalScore, setOpenModalScore] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [profileScore, setProfileScore] = useState<SeekersByJobPost | null>(
      null
    );
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
      setCurrentJobPostId(id);
    };
    const handleViewComments = (id: number) => {
      navigation.navigate("CommentScreen", { commentId: id });
    };

    const handleNavigateProfile = (id: number, data: SeekersByJobPost) => {
      setOpenModalScore(true);
      setSelectedId(id);
      setProfileScore(data);
    };

    const handleCloseModal = () => {
      setOpenModalScore(false);
    };

    return (
      <>
        {openModalScore && (
          <ModalScore
            onClose={handleCloseModal}
            id={selectedId}
            profileUser={profileScore}
          />
        )}

        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
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
              {/* <View style={styles.cardRow1}>
                <Text style={styles.label}>OverallMatch:</Text>

                <View>
                  <GradientCircularProgress
                    percentage={
                      item.analyzedResult.matchDetails.scores.overallMatch
                    }
                  />
                </View>
              </View> */}
               {item.analyzedResult.matchDetails && (
              <View style={styles.cardRow1}>
                <Text style={styles.label}>OverallMatch:</Text>

                <View>
                  <GradientCircularProgress
                    percentage={
                      item.analyzedResult.matchDetails.scores.overallMatch
                    }
                  />
                </View>
              </View>
            )}

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
        />
        <StepModal
          id={currentJobPostId}
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onFinish={handleModalFinish}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      {/* <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab("CvApplied")}>
          <Text
            style={[styles.tab, activeTab === "CvApplied" && styles.activeTab]}
          >
            Cv Applied
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("CvRecommend")}>
          <Text
            style={[
              styles.tab,
              activeTab === "CvRecommend" && styles.activeTab,
            ]}
          >
            Cv Recommend
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("CvFind")}>
          <Text
            style={[styles.tab, activeTab === "CvFind" && styles.activeTab]}
          >
            Cv Find
          </Text>
        </TouchableOpacity>
      </View> */}
      <View style={{ height: 50 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        >
          <TouchableOpacity onPress={() => setActiveTab("Pending")}>
            <Text
              style={[styles.tab, activeTab === "Pending" && styles.activeTab]}
            >
              Pending {PendingDataSeekerApply.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("CVScreening")}>
            <Text
              style={[
                styles.tab,
                activeTab === "CVScreening" && styles.activeTab,
              ]}
            >
              CV Screening {CVDataSeekerApply.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("InterView")}>
            <Text
              style={[
                styles.tab,
                activeTab === "InterView" && styles.activeTab,
              ]}
            >
              InterView {InterViewDataSeekerApply.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("InterviewPassed")}>
            <Text
              style={[
                styles.tab,
                activeTab === "InterviewPassed" && styles.activeTab,
              ]}
            >
              Interview Passed {PassedDataSeekerApply.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("Rejected")}>
            <Text
              style={[styles.tab, activeTab === "Rejected" && styles.activeTab]}
            >
              Rejected {RejectedDataSeekerApply.length}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Find" />
        <TouchableOpacity style={styles.dropdown}>
          <Text>Show All CVs</Text>
        </TouchableOpacity>
      </View>

      {/* Render content based on active tab */}
      {renderContent()}
    </View>
  );
};
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

interface CvAppliedContentProps {
  data: SeekersByJobPost[] | undefined;
  navigation: any;
}

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

const CvAppliedContent = ({ data, navigation }: CvAppliedContentProps) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentJobPostId, setCurrentJobPostId] = useState<number | null>(null);
  const [openModalScore, setOpenModalScore] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [profileScore, setProfileScore] = useState<SeekersByJobPost | null>(
    null
  );
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
    setCurrentJobPostId(id);
  };
  const handleViewComments = (id: number) => {
    navigation.navigate("CommentScreen", { commentId: id });
  };

  const handleNavigateProfile = (id: number, data: SeekersByJobPost) => {
    setOpenModalScore(true);
    setSelectedId(id);
    setProfileScore(data);
  };

  const handleCloseModal = () => {
    setOpenModalScore(false);
  };

  return (
    <>
      {openModalScore && (
        <ModalScore
          onClose={handleCloseModal}
          id={selectedId}
          profileUser={profileScore}
        />
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
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
                <Text style={[styles.value, styles.linkText]}>Download CV</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{item.status}</Text>
            </View>
            {item.analyzedResult.matchDetails && (
              <View style={styles.cardRow1}>
                <Text style={styles.label}>OverallMatch:</Text>

                <View>
                  <GradientCircularProgress
                    percentage={
                      item.analyzedResult.matchDetails.scores.overallMatch
                    }
                  />
                </View>
              </View>
            )}

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
        ListEmptyComponent={<Text style={styles.emptyText}>No CVs found</Text>}
      />
      <StepModal
        id={currentJobPostId}
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onFinish={handleModalFinish}
      />
    </>
  );
};

const CvRecommendContent = ({ data, navigation }: CvAppliedContentProps) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentJobPostId, setCurrentJobPostId] = useState<number | null>(null);
  const [openModalScore, setOpenModalScore] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [profileScore, setProfileScore] = useState<SeekersByJobPost | null>(
    null
  );
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
    setCurrentJobPostId(id);
  };
  const handleViewComments = (id: number) => {
    navigation.navigate("CommentScreen", { commentId: id });
  };

  const handleNavigateProfile = (id: number, data: SeekersByJobPost) => {
    setOpenModalScore(true);
    setSelectedId(id);
    setProfileScore(data);
  };

  const handleCloseModal = () => {
    setOpenModalScore(false);
  };

  return (
    <>
      {openModalScore && (
        <ModalScore
          onClose={handleCloseModal}
          id={selectedId}
          profileUser={profileScore}
        />
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
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
                <Text style={[styles.value, styles.linkText]}>Download CV</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{item.status}</Text>
            </View>
            {/* <View style={styles.cardRow1}>
              <Text style={styles.label}>OverallMatch:</Text>

              <View>
                <GradientCircularProgress
                  percentage={
                    item.analyzedResult.matchDetails.scores.overallMatch
                  }
                />
              </View>
            </View> */}
             {item.analyzedResult.matchDetails && (
              <View style={styles.cardRow1}>
                <Text style={styles.label}>OverallMatch:</Text>

                <View>
                  <GradientCircularProgress
                    percentage={
                      item.analyzedResult.matchDetails.scores.overallMatch
                    }
                  />
                </View>
              </View>
            )}

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
        ListEmptyComponent={<Text style={styles.emptyText}>No CVs found</Text>}
      />
      <StepModal
        id={currentJobPostId}
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onFinish={handleModalFinish}
      />
    </>
  );
};

const CvFindContent = ({ data, navigation }: CvAppliedContentProps) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentJobPostId, setCurrentJobPostId] = useState<number | null>(null);
  const [openModalScore, setOpenModalScore] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [profileScore, setProfileScore] = useState<SeekersByJobPost | null>(
    null
  );
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
    setCurrentJobPostId(id);
  };
  const handleViewComments = (id: number) => {
    navigation.navigate("CommentScreen", { commentId: id });
  };

  const handleNavigateProfile = (id: number, data: SeekersByJobPost) => {
    setOpenModalScore(true);
    setSelectedId(id);
    setProfileScore(data);
  };

  const handleCloseModal = () => {
    setOpenModalScore(false);
  };

  return (
    <>
      {openModalScore && (
        <ModalScore
          onClose={handleCloseModal}
          id={selectedId}
          profileUser={profileScore}
        />
      )}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
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
                <Text style={[styles.value, styles.linkText]}>Download CV</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{item.status}</Text>
            </View>
            {/* <View style={styles.cardRow1}>
              <Text style={styles.label}>OverallMatch:</Text>

              <View>
                <GradientCircularProgress
                  percentage={
                    item.analyzedResult.matchDetails.scores.overallMatch
                  }
                />
              </View>
            </View> */}
             {item.analyzedResult.matchDetails && (
              <View style={styles.cardRow1}>
                <Text style={styles.label}>OverallMatch:</Text>

                <View>
                  <GradientCircularProgress
                    percentage={
                      item.analyzedResult.matchDetails.scores.overallMatch
                    }
                  />
                </View>
              </View>
            )}

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
        ListEmptyComponent={<Text style={styles.emptyText}>No CVs found</Text>}
      />
      <StepModal
        id={currentJobPostId}
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onFinish={handleModalFinish}
      />
    </>
  );
};
// const CvFindContent = () => (
//   <View style={styles.contentContainer}>
//     {/* <Text style={styles.contentTitle}>Cv Find Content</Text> */}
//   </View>
// );

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10, // Reduced padding
    paddingVertical: 5, // Reduced padding
    backgroundColor: "#f5f7fa",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 8, // Adjust spacing between tabs and content
  },
  tab: {
    fontSize: 16,
    color: "#888",
    paddingVertical: 6, // Reduced padding
    paddingHorizontal: 10, // Reduced padding
  },
  activeTab: {
    color: "#000",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderColor: "#000",
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8, // Adjust spacing
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 6, // Reduced padding inside input
    marginRight: 6, // Reduced spacing between input and button
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10, // Reduced padding inside dropdown
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10, // Reduced padding inside cards
    marginBottom: 8, // Reduced spacing between cards
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4, // Reduced spacing between rows in the card
  },
  cardRow1: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
  value: {
    color: "#333",
    flexShrink: 1,
  },
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
    marginTop: 10, // Reduced top margin
  },
  linkText: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
});

export default CvAppliedScreen;
