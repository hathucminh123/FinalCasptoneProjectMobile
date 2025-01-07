// import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { jobData } from "../mock/JobData";
import { Image } from "react-native";

// import { companyData } from "../mock/CompanyData";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthModal from "../components/AuthModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetJobPostById } from "../Services/JobsPost/GetJobPostById";
import { fetchCompanies } from "../Services/CompanyService/GetCompanies";
import { GetJobPost } from "../Services/JobsPost/GetJobPosts";
import { GetJobActivity } from "../Services/UserJobPostActivity/GetUserJobPostActivity";
import RenderHTML from "react-native-render-html";
import { GetBusinessStream } from "../Services/BusinessStreamService/GetBusinessStream";
import { useFocusEffect } from "@react-navigation/native";
import { PostFollowCompany } from "../Services/FollowCompany/PostFollowCompany";
import { queryClient } from "../Services/mainService";
import { DeleteFollowCompany } from "../Services/FollowCompany/DeleteFollowCompany";
import { GetFollowCompany } from "../Services/FollowCompany/GetFollowCompany";
import { PostFavoriteJobs } from "../Services/FavoriteJobs/PostFavoriteJobs";
import { DeleteFavoriteJobs } from "../Services/FavoriteJobs/DeleteFavoriteJobs";
import { GetFavoriteJobs } from "../Services/FavoriteJobs/GetFavoriteJobs";
import { GetSeekerJobPost } from "../Services/JobsPost/GetSeekerJobPost";
import PercentileChart from "./Employer/PercentileChart";
import { GetUserProfile } from "../Services/UserProfileService/UserProfile";
// import { Item } from "react-native-paper/lib/typescript/components/Drawer/Drawer";
// import { Link } from "expo-router";
type InfoLineProps = {
  icon: string;
  text: string | undefined;
};

const InfoLine = ({ icon, text }: InfoLineProps) => (
  <View style={styles.line}>
    <Icon name={icon} size={30} color="#808080" />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

export default function JobDetail({ route, navigation }: any) {
  const { jobId } = route.params;
  const [follow, setFollow] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState("Job Details");
  const [modalVisibleLogin, setModalVisibleLogin] = useState<boolean>(false);
  const { width } = Dimensions.get("window");

  const [token, setToken] = useState<string | null>("");
  const [userId, setUserId] = useState<string | null>("");

  const fetchUserData = async () => {
    const id = await AsyncStorage.getItem("userId");
    const auth = await AsyncStorage.getItem("Auth");
    const token = await AsyncStorage.getItem("token");
    setToken(token);
    setUserId(id);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData(); // Fetch Auth and UserId on focus
    }, [token])
  );

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toISOString().split("T")[0]; // Chỉ lấy phần ngày (YYYY-MM-DD)
  };
  // Parse the id as a number for comparison with numeric job ids
  const { data: jobData } = useQuery({
    queryKey: ["Job-details", jobId],
    queryFn: ({ signal }) => GetJobPostById({ id: Number(jobId), signal }), // Convert JobId to number
    enabled: !!jobId, // Chỉ chạy query khi JobId có giá trị
  });

  const {
    data: Company,
    // isLoading: isCompanyLoading,
    // isError: isCompanyError,
  } = useQuery({
    queryKey: ["Company"],
    queryFn: ({ signal }) => fetchCompanies({ signal: signal }),
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
  const {
    data: JobPostActivity,
    // isLoading: isJobLoading,
    // isError: isJobError,
  } = useQuery({
    queryKey: ["JobPostActivity"],
    queryFn: ({ signal }) => GetJobActivity({ signal: signal }),
    staleTime: 5000,
  });

  const { data: BusinessStream } = useQuery({
    queryKey: ["BusinessStream"],
    queryFn: ({ signal }) => GetBusinessStream({ signal }),
    staleTime: 5000,
  });
  const BusinessStreamData = BusinessStream?.BusinessStreams;

  const JobPostActivitydata = JobPostActivity?.UserJobActivitys;
  const Companiesdata = Company?.Companies;

  const job = jobData?.JobPosts;

  const { mutate: SaveJobs } = useMutation({
    mutationFn: PostFavoriteJobs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["FavoriteJob"],
        refetchType: "active",
      });
      // setFavorite(true)

      Alert.alert(`Save ${job?.jobTitle} Successfully`);
    },
    onError: () => {
      Alert.alert(`Failed to Follow ${job?.jobTitle} `);
    },
  });
  const { mutate: UnfollowJobs } = useMutation({
    mutationFn: DeleteFavoriteJobs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["FavoriteJob"],
        refetchType: "active",
      });
      // setFavorite(false)
      Alert.alert(`Unfollow ${job?.jobTitle} Successfully`);
    },
    onError: () => {
      Alert.alert(`Failed to UnFollow ${job?.jobTitle} `);
    },
  });

  const { data: FavoriteJob } = useQuery({
    queryKey: ["FavoriteJob"],
    queryFn: ({ signal }) => GetFavoriteJobs({ signal }),
    staleTime: 5000,
  });
  const FavoriteJobs = FavoriteJob?.JobPost;
  const haveFavorite = FavoriteJobs?.find(
    (item) => item.id === Number(job?.id)
  );

  const { data: SeekerApply } = useQuery({
    queryKey: ["SeekerApply", job?.id],
    queryFn: ({ signal }) => GetSeekerJobPost({ id: Number(job?.id), signal }),
    enabled: !!job?.id,
  });

  const dataSeeker = SeekerApply?.GetSeekers;

  const feedBackUserJob = dataSeeker?.find(
    (item) => item.id === Number(userId)
  );

  console.log("quao", haveFavorite);
  useEffect(() => {
    const storeJob = async () => {
      if (job) {
        try {
          await AsyncStorage.setItem("redirectStateJob", JSON.stringify(job));
          console.log("Job saved successfully.");
        } catch (e) {
          console.error("Failed to save job to AsyncStorage:", e);
        }
      }
    };

    storeJob();
  }, [job]);
  const JobPostsdata = JobPosts?.JobPosts;
  const detailsCompany = Companiesdata?.find(
    (item) => item.id === job?.companyId
  );
  const hasAppliedJobActivity = JobPostActivitydata?.find(
    (activity) => activity.jobPostId === job?.id
  );

  const BusinessStreamDatainCompany = BusinessStreamData?.find(
    (item) => detailsCompany?.businessStream?.id === item.id
  );
  const { data: FollowCompany } = useQuery({
    queryKey: ["FollowCompany"],
    queryFn: ({ signal }) => GetFollowCompany({ signal }),
    staleTime: 5000,
  });
  const FollowCompanydata = FollowCompany?.Companies;
  const { mutate } = useMutation({
    mutationFn: PostFollowCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["FollowCompany"],
        refetchType: "active",
      });
      Alert.alert(`Follow ${detailsCompany?.companyName} Successfully`);
    },
    onError: () => {
      Alert.alert(`Failed to Follow ${detailsCompany?.companyName} `);
    },
  });
  const { mutate: Unfollow } = useMutation({
    mutationFn: DeleteFollowCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["FollowCompany"],
        refetchType: "active",
      });
      Alert.alert(`Unfollow ${detailsCompany?.companyName} Successfully`);
    },
    // onError: () => {
    //   Alert.alert(`Failed to UnFollow ${companyDataa?.companyName} `);
    // },
  });
  const handleFollow = async () => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
      return;
    }
    mutate({
      data: {
        companyId: Number(detailsCompany?.id),
      },
    });
  };

  const handleSaveJob = async () => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
      return;
    }
    SaveJobs({
      data: {
        jobPostId: Number(job?.id),
      },
    });
  };
  const haveFollow = FollowCompanydata?.find(
    (item) => item.id === Number(detailsCompany?.id)
  );
  const handleUnFollowJobs = async () => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
    }
    UnfollowJobs({ id: Number(haveFavorite?.id) });
  };

  const handleUnFollow = async () => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
    }
    Unfollow({ id: Number(haveFollow?.id) });
  };
  const expiryDate = job?.expiryDate ? new Date(job?.expiryDate) : null;
  const today = new Date();

  const isExpired = expiryDate ? expiryDate < today : undefined;

  const { data: UserProfile } = useQuery({
    queryKey: ["UserProfile"],
    queryFn: ({ signal }) =>
      GetUserProfile({ id: Number(userId), signal: signal }),
    enabled: !!userId,
  });

  const profile = UserProfile?.UserProfiles;
  const renderContent = () => {
    if (selectedTab === "Job Details") {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Infomation</Text>
          <View style={{ marginBottom: 10 }}>
            {job?.jobLocationAddressDetail &&
            job.jobLocationAddressDetail?.length > 0 ? (
              job.jobLocationAddressDetail.map((item, index) => (
                <View style={styles.location} key={index}>
                  <Icon name="location-on" size={20} color="#808080" />
                  <Text style={styles.locationtext}>{item}</Text>
                </View>
              ))
            ) : (
              <View style={styles.location}>
                <Icon name="location-on" size={20} color="#808080" />
                <Text style={styles.locationtext}>
                  {detailsCompany?.address} {" in "} {detailsCompany?.city}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.tax}>
            <Icon name="work" size={15} color="#808080" />

            <Text style={styles.locationtext}>{job?.jobType.name}</Text>
          </View>
          <View style={styles.tax}>
            <Icon name="attach-money" size={15} color="#808080" />
            <Text style={styles.taxtext}>
              {" "}
              {/* {`${job?.minsalary} - ${job?.salary} USD`} */}
              {job?.minsalary && job?.salary
                ? `${
                    job.minsalary >= 1000000
                      ? job.minsalary / 1000000
                      : job.minsalary
                  } ${job.minsalary >= 1000000 ? "triệu" : "VNĐ"} - ${
                    job.salary >= 1000000 ? job.salary / 1000000 : job.salary
                  } ${job.salary >= 1000000 ? "triệu" : "VNĐ"}`
                : "Salary not specified"}
            </Text>
          </View>
          <View style={styles.tax}>
            <Icon name="work" size={15} color="#808080" />
            <Text style={styles.locationtext}>
              {job?.experienceRequired} Years
            </Text>
          </View>

          <Text style={styles.cardTitle}>Job Description</Text>
          <View>
            {job?.jobDescription ? (
              <RenderHTML
                contentWidth={width}
                source={{ html: job.jobDescription }}
              />
            ) : (
              <Text> "Description not available" </Text>
            )}
          </View>
          <Text style={styles.cardTitle}>Job Benefit</Text>
          <View>
            {job?.benefits ? (
              <RenderHTML
                contentWidth={width}
                source={{ html: job.benefits }}
              />
            ) : (
              <Text> "Description not available" </Text>
            )}
          </View>
          <Text style={styles.cardTitle}>Job Required</Text>
          <View>
            {job?.qualificationRequired ? (
              <RenderHTML
                contentWidth={width}
                source={{ html: job.qualificationRequired }}
              />
            ) : (
              <Text> "Description not available" </Text>
            )}
          </View>
        </View>
      );
      // } else if (selectedTab === "news") {
      //   return (
      //     <View style={styles.card}>
      //       <Text style={styles.cardTitle}>News</Text>
      //       <Text style={styles.paragraph}>
      //         Latest news and updates related to the company will appear here.
      //       </Text>
      //     </View>
      //   );
    } else if (selectedTab === "Company") {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Infomation</Text>
          <View style={styles.company}>
            <Image
              source={{ uri: detailsCompany?.imageUrl }}
              style={{ width: 40, height: 40 }}
              resizeMode="cover"
            />
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Text style={styles.companyTitle}>
                {detailsCompany?.companyName}
              </Text>
              <Text style={styles.locationtext}>
                {detailsCompany?.establishedYear}
              </Text>
            </View>
          </View>
          <View style={styles.location}>
            <Icon name="location-on" size={20} color="#808080" />
            <Text style={styles.locationtext}>
              {detailsCompany?.address} {detailsCompany?.city}
            </Text>
          </View>
          <View style={styles.line2}>
            <InfoLine
              icon="group"
              text={
                detailsCompany && detailsCompany?.numberOfEmployees?.toString()
              }
            />
            <InfoLine
              icon="work"
              text={`${detailsCompany?.jobPosts?.length} jobs`}
            />
          </View>

          <View style={styles.location}>
            <Icon name="insert-drive-file" size={20} color="#808080" />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 5,
              }}
            >
              {job?.skillSets.map((item) => (
                <Text> {item}</Text>
              ))}
            </View>
          </View>
          <View style={styles.location}>
            <Icon name="folder" size={20} color="#808080" />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: 5,
              }}
            >
              <Text> {BusinessStreamDatainCompany?.businessStreamName}</Text>
            </View>
          </View>
          {haveFollow && token ? (
            <TouchableOpacity
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderColor: "#FF4500",
                borderWidth: 1,
                backgroundColor: "white",
                paddingVertical: 10,
                width: "100%",
                borderRadius: 10,
              }}
              onPress={handleUnFollow}
            >
              <Text style={{ fontSize: 20, lineHeight: 30, color: "#FF4500" }}>
                UnFollow
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderColor: "#FF4500",
                borderWidth: 1,
                backgroundColor: "white",
                paddingVertical: 10,
                width: "100%",
                borderRadius: 10,
              }}
              onPress={handleFollow}
            >
              <Text style={{ fontSize: 20, lineHeight: 30, color: "#FF4500" }}>
                Follow
              </Text>
            </TouchableOpacity>
          )}
          {/* <TouchableOpacity
            style={{
              alignItems: "center",
              justifyContent: "center",
              borderColor: "#FF4500",
              borderWidth: 1,
              backgroundColor: "white",
              paddingVertical: 10,
              width: "100%",
              borderRadius: 10,
            }}
            onPress={handleUnFollow}
          >
            <Text style={{ fontSize: 20, lineHeight: 30, color: "#FF4500" }}>
              Follow
            </Text>
          </TouchableOpacity> */}
          <View
            style={{
              alignItems: "center",
              borderColor: "#808080",
              justifyContent: "center",
              borderWidth: 1,
              backgroundColor: "white",
              paddingVertical: 10,
              width: "100%",
              borderRadius: 10,
            }}
          >
            {/* <Link
              href={{
                pathname: "/CompanyDetail",
                params: {
                  id: companyDetail?.id,
                  companyDetail: JSON.stringify(companyDetail),
                },
              }}
              asChild
            > */}
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CompanyDetail", {
                  id: detailsCompany?.id,
                  companyDetail: JSON.stringify(detailsCompany),
                })
              }
            >
              <Text style={{ fontSize: 20, lineHeight: 30, color: "#808080" }}>
                View Details
              </Text>
            </TouchableOpacity>
            {/* </Link> */}
          </View>
          <Text style={styles.cardTitle}>Introduce</Text>
          <View>
            {detailsCompany?.companyDescription ? (
              <RenderHTML
                contentWidth={width}
                source={{ html: detailsCompany.companyDescription }}
              />
            ) : (
              "Description not available"
            )}
          </View>
        </View>
      );
    } else if (selectedTab === "ModalScore") {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score</Text>

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
              {profile?.experienceDetails &&
              profile.experienceDetails.length > 0 ? (
                profile.experienceDetails.map((exp, index) => (
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
              {profile?.educationDetails &&
              profile.educationDetails.length > 0 ? (
                profile.educationDetails.map((edu, index) => (
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
                {profile?.skillSets && profile.skillSets.length > 0 ? (
                  profile.skillSets.map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.sectionTitle}>
                        {skill.proficiencyLevel}
                      </Text>
                      <Text>{skill.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text>No skills available</Text>
                )}
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benefits</Text>
              <View style={styles.skillsContainer}>
                {profile?.benefits && profile.benefits.length > 0 ? (
                  profile.benefits.map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text>{skill.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text>No benefits available</Text>
                )}
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Matching Details</Text>
              <PercentileChart
                profileResult={feedBackUserJob}
                overallMatch={
                  feedBackUserJob?.analyzedResult.matchDetails.scores
                    .overallMatch
                }
                skillMatch={
                  feedBackUserJob?.analyzedResult.matchDetails.scores.skillMatch
                }
                experienceMatch={
                  feedBackUserJob?.analyzedResult.matchDetails.scores
                    .experienceMatch
                }
                contentSimilarity={
                  feedBackUserJob?.analyzedResult.matchDetails.scores
                    .contentSimilarity
                }
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Matching Skills</Text>
              <View style={styles.skillsContainer}>
                {feedBackUserJob?.analyzedResult.matchDetails.skillAnalysis
                  .matchingSkills &&
                feedBackUserJob?.analyzedResult.matchDetails.skillAnalysis
                  .matchingSkills.length > 0 ? (
                  feedBackUserJob?.analyzedResult.matchDetails.skillAnalysis.matchingSkills.map(
                    (skill, index) => (
                      <View key={index} style={styles.matchingSkills}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    )
                  )
                ) : (
                  <Text>No skills Matching</Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Missing Skills</Text>
              <View style={styles.skillsContainer}>
                {feedBackUserJob?.analyzedResult.matchDetails.skillAnalysis
                  .missingSkills &&
                feedBackUserJob?.analyzedResult.matchDetails.skillAnalysis
                  .missingSkills.length > 0 ? (
                  feedBackUserJob?.analyzedResult.matchDetails.skillAnalysis.missingSkills.map(
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
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Skills</Text>
              <View style={styles.skillsContainer}>
                {feedBackUserJob?.analyzedResult.matchDetails.skillAnalysis
                  .additionalSkills &&
                feedBackUserJob?.analyzedResult.matchDetails.skillAnalysis
                  .additionalSkills.length > 0 ? (
                  feedBackUserJob?.analyzedResult.matchDetails.skillAnalysis.additionalSkills.map(
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
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Job Experience Required:{" "}
                {
                  feedBackUserJob?.analyzedResult.matchDetails
                    .experienceAnalysis.requiredYears
                }{" "}
                Years
              </Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Candidate Experience :{" "}
                {
                  feedBackUserJob?.analyzedResult.matchDetails
                    .experienceAnalysis.candidateYears
                }{" "}
                Years
              </Text>
            </View>

            {feedBackUserJob?.extractedCVInfo ? (
              <View style={styles.main27}>
                <View style={styles.main16}>
                  <Text style={styles.main28}>Exact CVS:</Text>
                  <Text style={styles.main28}>Personal Details:</Text>
                  {feedBackUserJob.extractedCVInfo.data &&
                  feedBackUserJob.extractedCVInfo.data.length > 0 ? (
                    feedBackUserJob.extractedCVInfo.data.map((item, index) => (
                      <View key={index}>
                        <View style={styles.main2222}>
                          <Text>Contact:</Text>
                          <Text style={styles.main29}>
                            {Array.isArray(item.personal.contact) &&
                            item.personal.contact.length > 0
                              ? item.personal.contact.join(", ")
                              : "No contacts available"}
                          </Text>
                        </View>
                        <View style={styles.main2222}>
                          <Text>Email:</Text>
                          <Text style={styles.main29}>
                            {Array.isArray(item.personal.email) &&
                            item.personal.email.length > 0
                              ? item.personal.email.join(", ")
                              : "No emails available"}
                          </Text>
                        </View>
                        <View style={styles.main2222}>
                          <Text>Github:</Text>
                          <Text style={styles.main29}>
                            {Array.isArray(item.personal.github) &&
                            item.personal.github.length > 0
                              ? item.personal.github.join(", ")
                              : "No GitHub available"}
                          </Text>
                        </View>
                        <View style={styles.main2222}>
                          <Text>Linkedin:</Text>
                          <Text style={styles.main29}>
                            {Array.isArray(item.personal.linkedin) &&
                            item.personal.linkedin.length > 0
                              ? item.personal.linkedin.join(", ")
                              : "No linkedin available"}
                          </Text>
                        </View>
                        <View style={styles.main2222}>
                          <Text>Location:</Text>
                          <Text style={styles.main29}>
                            {Array.isArray(item.personal.location) &&
                            item.personal.location.length > 0
                              ? item.personal.location.join(", ")
                              : "No location available"}
                          </Text>
                        </View>
                        <View style={styles.main2222}>
                          <Text>Name:</Text>
                          <Text style={styles.main29}>
                            {Array.isArray(item.personal.name) &&
                            item.personal.name.length > 0
                              ? item.personal.name.join(", ")
                              : "No name available"}
                          </Text>
                        </View>
                        <View style={styles.main2222}>
                          <Text>Education:</Text>
                          <Text style={styles.main29}>
                            {Array.isArray(item.professional.education) &&
                            item.professional.education.length > 0
                              ? item.professional.education
                                  .map((edu) => edu.university)
                                  .join(", ")
                              : "No education available"}
                          </Text>
                        </View>
                        <Text style={styles.main28}>Experience:</Text>
                        <View style={styles.main29}>
                          {Array.isArray(item.professional.experience) &&
                          item.professional.experience.length > 0 ? (
                            item.professional.experience.map(
                              (exp, expIndex) => (
                                <View key={expIndex} style={styles.main155}>
                                  <View style={styles.main166}>
                                    <View style={styles.main177}>
                                      <View style={styles.main188}>
                                        <Text>Company Name:</Text>
                                        <Text style={styles.main29}>
                                          {Array.isArray(exp.company) &&
                                          exp.company.length > 0
                                            ? exp.company.join(", ")
                                            : "No company available"}
                                        </Text>
                                      </View>
                                      <View style={styles.main2222}>
                                        <Text>Personal Project:</Text>
                                        <Text style={styles.main29}>
                                          {Array.isArray(
                                            exp.project_experience
                                          ) && exp.project_experience.length > 0
                                            ? exp.project_experience.join(", ")
                                            : "No project available"}
                                        </Text>
                                      </View>
                                      <View style={styles.main2222}>
                                        <Text>Role:</Text>
                                        <Text style={styles.main29}>
                                          {Array.isArray(exp.role) &&
                                          exp.role.length > 0
                                            ? exp.role.join(", ")
                                            : "No role available"}
                                        </Text>
                                      </View>
                                      <View style={styles.main2222}>
                                        <Text>Years:</Text>
                                        <Text style={styles.main29}>
                                          {Array.isArray(exp.years) &&
                                          exp.years.length > 0
                                            ? `${exp.years.join(", ")} years`
                                            : "No years available"}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                </View>
                              )
                            )
                          ) : (
                            <Text>No experience available</Text>
                          )}
                        </View>
                        <View style={styles.main2222}>
                          <Text>Non-Technical Skills:</Text>
                          <Text style={styles.main29}>
                            {Array.isArray(
                              item.professional.non_technical_skills
                            ) &&
                            item.professional.non_technical_skills.length > 0
                              ? item.professional.non_technical_skills.join(
                                  ", "
                                )
                              : "No non-technical skills available"}
                          </Text>
                        </View>
                        <View style={styles.main2222}>
                          <Text>Technical Skills:</Text>
                          <Text style={styles.main29}>
                            {Array.isArray(
                              item.professional.technical_skills
                            ) && item.professional.technical_skills.length > 0
                              ? item.professional.technical_skills.join(", ")
                              : "No technical skills available"}
                          </Text>
                        </View>
                        <View style={styles.main2222}>
                          <Text>Tools:</Text>
                          <Text style={styles.main29}>
                            {Array.isArray(item.professional.tools) &&
                            item.professional.tools.length > 0
                              ? item.professional.tools.join(", ")
                              : "No tools available"}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text>No data available</Text>
                  )}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      );
    }
  };
  // Handle the case where jobDetail is not found
  if (!job) {
    return (
      <View>
        <Text>Job not found</Text>
      </View>
    );
  }

  const handleApply = async () => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
      return;
    }
    navigation.navigate("Apply", { job: job, id: job.id });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollViewContainer}
      >
        <View style={styles.main}>
          <View style={styles.main1}>
            <Image
              source={{ uri: job?.imageURL }}
              resizeMode="cover"
              style={styles.main3}
            />
            <View style={styles.main4}>
              <Image
                source={{ uri: job?.imageURL }}
                resizeMode="cover"
                style={styles.img1}
              />
            </View>
          </View>
          <View style={styles.main5}>
            <View style={styles.main6}>
              <Text style={styles.title}>{job.jobTitle}</Text>
              <Text style={styles.text}>{detailsCompany?.companyName}</Text>
              <View style={styles.skillList}>
                {job?.skillSets?.map((job, jobIndex) => (
                  <TouchableOpacity key={`${jobIndex}`} style={styles.button}>
                    <Text style={styles.buttonText}>{job}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.text}>Benefits:</Text>
              <View style={styles.skillList}>
                {job?.benefitObjects && job?.benefitObjects.length > 0 ? (
                  job?.benefitObjects?.map((job, jobIndex) => (
                    <TouchableOpacity key={`${jobIndex}`} style={styles.button}>
                      <Text style={styles.buttonText}>{job.name}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.text}>No Benefits Yet:</Text>
                )}
              </View>
              <View style={styles.post}>
                <Icon name="access-time" size={15} color="#808080" />
                <Text style={styles.posttext}>
                  {"From "}
                  {job?.postingDate
                    ? formatDate(job.postingDate)
                    : "No Date Available"}
                  {" To "}
                  {job?.expiryDate
                    ? formatDate(job.expiryDate)
                    : "No Date Available"}
                </Text>
              </View>
            </View>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "Job Details" && styles.activeTab,
                ]}
                onPress={() => setSelectedTab("Job Details")}
              >
                <Text
                  style={
                    selectedTab === "Job Details"
                      ? styles.activeTabText
                      : styles.tabText
                  }
                >
                  Jobs Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "Company" && styles.activeTab,
                ]}
                onPress={() => setSelectedTab("Company")}
              >
                <Text
                  style={
                    selectedTab === "Company"
                      ? styles.activeTabText
                      : styles.tabText
                  }
                >
                  Company
                </Text>
              </TouchableOpacity>
              {hasAppliedJobActivity &&
              token &&
              feedBackUserJob?.analyzedResult.matchDetails ? (
                <TouchableOpacity
                  style={[
                    styles.tab,
                    selectedTab === "ModalScore" && styles.activeTab,
                  ]}
                  onPress={() => setSelectedTab("ModalScore")}
                >
                  <Text
                    style={
                      selectedTab === "ModalScore"
                        ? styles.activeTabText
                        : styles.tabText
                    }
                  >
                    Score Match
                  </Text>
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}></Text>
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          {renderContent()}
        </View>
      </ScrollView>
      <View style={styles.like}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {haveFavorite ? (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUnFollowJobs}
            >
              <Text style={styles.saveButtonText}>SAVED</Text>
              <View style={{ marginLeft: 10 }}>
                {/* Nút follow/unfollow */}
                <TouchableOpacity>
                  <Icon name={"bookmark"} size={30} color="#FF5A5F" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveJob}>
              <Text style={styles.saveButtonText}>SAVE</Text>
              <View style={{ marginLeft: 10 }}>
                {/* Nút follow/unfollow */}
                <TouchableOpacity>
                  <Icon name={"bookmark-border"} size={30} color="#FF5A5F" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}

          {hasAppliedJobActivity && token ? (
            <TouchableOpacity
              style={styles.applyButtonApplied}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>
                {hasAppliedJobActivity.status}
              </Text>
              {feedBackUserJob?.status === "Rejected" ||
                feedBackUserJob?.status === "Passed" ||
                feedBackUserJob?.status === "InterviewStage" ||
                (feedBackUserJob?.status === "CVScreeningPassed" && (
                  <View>
                    <TouchableOpacity>
                      <Icon name="comment" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                ))}
            </TouchableOpacity>
          ) : isExpired ? (
            <TouchableOpacity style={styles.applyButtonApplied}>
              <Text style={styles.applyButtonText}> application deadline</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>EASY APPLY</Text>
            </TouchableOpacity>
          )}
        </View>
        <AuthModal
          visible={modalVisibleLogin}
          onClose={() => setModalVisibleLogin(false)}
          navigation={navigation}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flexDirection: "column",
    width: "100%",
    position: "relative",
  },
  main1: {
    position: "relative",
    flexDirection: "column",
  },
  main2: {
    position: "absolute",
  },
  main3: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    height: 200,
  },
  main4: {
    position: "absolute",
    // top: -50,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#dedede",
    top: "25%",
    left: "38%",
  },
  img1: {
    height: 100,
    width: 100,
    opacity: 1,
  },

  main5: {
    flexDirection: "column",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
  },
  main6: {
    flexDirection: "column",
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: -30,
    backgroundColor: "white",
    elevation: 10,
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF4500",
    lineHeight: 30,
    // marginBottom: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: "500",

    lineHeight: 22.5,
    // marginBottom: 10,
  },
  skillList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#dedede",
    marginRight: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#6c6c6c",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  post: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  posttext: {
    // color: "#0AB305",
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    borderRadius: 8,
    backgroundColor: "white",
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    // marginBottom: 5,
    marginTop: 20,
    backgroundColor: "white",
    width: "100%",
  },
  tab: {
    padding: 10,
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  activeTab: {
    borderColor: "black",
  },
  tabText: {
    fontSize: 16,
    color: "gray",
  },
  activeTabText: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
  },
  notificationBadge: {
    backgroundColor: "red",
    borderRadius: 10,
    position: "absolute",
    right: -10,
    top: -5,
    paddingHorizontal: 6,
  },
  notificationText: {
    color: "white",
    fontSize: 12,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingVertical: 80,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9", // Đảm bảo màu nền nhất quán
  },
  location: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  locationtext: {
    fontSize: 15,
    lineHeight: 22.5,
  },
  tax: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  taxtext: {
    color: "#0AB305",
    fontSize: 15,
    lineHeight: 22.5,
  },
  company: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 20,
  },
  companyTitle: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 30,
  },
  line: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  line2: {
    flexDirection: "row",
    alignItems: "center",
    gap: 50,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 20,
  },
  like: {
    position: "absolute",

    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 30,
    backgroundColor: "white",
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderColor: "#FF5A5F",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  saveButtonText: {
    color: "#FF5A5F",
    fontWeight: "bold",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginLeft: 8,
  },
  applyButtonApplied: {
    flex: 1,
    backgroundColor: "#DEDEDE",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginLeft: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
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
  sendButton: {
    backgroundColor: "#3b82f6",
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
  main27: {
    flex: 1,
    backgroundColor: "#f9f9f9", // Nhẹ nhàng, nền sáng
    padding: 20,
  },
  main16: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Hiệu ứng nổi
  },
  main28: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  main2222: {
    marginVertical: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0", // Đường phân cách
  },
  main29: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  main155: {
    backgroundColor: "#f0f8ff", // Màu nền nhẹ cho kinh nghiệm
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  main166: {
    paddingVertical: 5,
  },
  main177: {
    marginBottom: 5,
  },
  main188: {
    marginBottom: 5,
  },
  textBold: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
});
