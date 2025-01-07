import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Linking,
  Switch,
} from "react-native";
import ProfileCard from "../components/ProfileCard"; // Import the ProfileCard component
import FullNameModal from "../components/FullNameModal"; // Import the FullNameModal component
import CVModal from "../components/CVModal";
import CardJobs from "../components/CardJobs";
import Icon from "react-native-vector-icons/MaterialIcons";
import { jobData } from "../mock/JobData";
import AuthModal from "../components/AuthModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetJobActivity } from "../Services/UserJobPostActivity/GetUserJobPostActivity";
import { fetchCompanies } from "../Services/CompanyService/GetCompanies";
import { GetJobPost } from "../Services/JobsPost/GetJobPosts";
import { GetUserProfile } from "../Services/UserProfileService/UserProfile";
import { MaterialIcons } from "@expo/vector-icons";
import { fetchCVs } from "../Services/CVService/GetCV";
import { DeleteCV } from "../Services/CVService/DeleteCV";
import { queryClient } from "../Services/mainService";
import { useFocusEffect } from "@react-navigation/native";
import { GetFavoriteJobs } from "../Services/FavoriteJobs/GetFavoriteJobs";
import { PostFavoriteJobs } from "../Services/FavoriteJobs/PostFavoriteJobs";
import { DeleteFavoriteJobs } from "../Services/FavoriteJobs/DeleteFavoriteJobs";
import GradientCircularProgress from "../components/GradientCircularProgress";
import { PutUser } from "../Services/UserJobPostActivity/PutUser";
import ModalOff from "../components/ModalOff";
import BenefitsList from "../components/Employer/BenefitList";
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
  isHot?: boolean;
  minsalary?: number;
  skillSets: string[]; // Array of skill sets, có thể là array rỗng
}

export default function PersonalScreen({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalVisibleCV, setModalVisibleCV] = useState<boolean>(false);
  const [modalVisibleLogin, setModalVisibleLogin] = useState<boolean>(false);

  const [address, setAddress] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [coverLetter, setCoverletter] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState("Applied");
  const [follow, setFollow] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [everyJob, setEveryJob] = useState<JobPost | undefined>();
  const [percent, setPercent] = useState<number>(0);
  const formatDateTime = (dateString: string | undefined) => {
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        // hour: "2-digit",
        // minute: "2-digit",
      });
    }

    // Return a fallback value if dateString is undefined
    return "Invalid date";
  };
  const [Auth, setAuth] = useState<string | null>("");
  const [UserId, setUserId] = useState<string | null>("");
  const [token, setToken] = useState<string | null>("");
  const [email, setEmail] = useState<string | null>("");
  console.log("tokenne", token);
  console.log();
  const fetchUserData = async () => {
    const id = await AsyncStorage.getItem("userId");
    const auth = await AsyncStorage.getItem("Auth");
    const token = await AsyncStorage.getItem("token");
    const Email = await AsyncStorage.getItem("Email");
    setToken(token);
    setAuth(auth);
    setUserId(id);
    setEmail(Email);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData(); // Fetch Auth and UserId on focus
    }, [])
  );

  const { data: UserProfile } = useQuery({
    queryKey: ["UserProfile"],
    queryFn: ({ signal }) =>
      GetUserProfile({ id: Number(UserId), signal: signal }),
    enabled: !!UserId,
  });
  const { data } = useQuery({
    queryKey: ["CVs"],
    queryFn: ({ signal }) => fetchCVs({ signal }),
    staleTime: 1000,
  });
  const handlePreview = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) => {
        Alert.alert("Error", "Failed to open the file.");
        console.error("Failed to open URL:", err);
      });
    } else {
      Alert.alert("No URL", "This file doesn't have a valid URL.");
    }
  };

  const dataCVS = data?.CVs || [];
  const UserProfileData = UserProfile?.UserProfiles;

  const [isEnabled, setIsEnabled] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [pendingUpdate, setPendingUpdate] = useState<boolean | null>(null);
  useEffect(() => {
    if (UserProfileData) {
      setIsEnabled(UserProfileData.isLookingForJob || false);
    }
  }, [UserProfileData]);

  const toggleSwitch = () => {
    const updatedValue = !isEnabled;
    if (!updatedValue) {
      setPendingUpdate(updatedValue);
      setOpenModal(true);
    } else {
      setIsEnabled(updatedValue);
      mutate({
        data: {
          firstName: UserProfileData?.firstName,
          lastName: UserProfileData?.lastName,
          email: UserProfileData?.email || "",
          phoneNumber: UserProfileData?.phoneNumber,
          isLookingForJob: updatedValue,
        },
      });
    }
  };

  const handleConfirmModal = () => {
    setIsEnabled(pendingUpdate as boolean);
    setOpenModal(false);

    mutate({
      data: {
        firstName: UserProfileData?.firstName,
        lastName: UserProfileData?.lastName,
        email: UserProfileData?.email || "",
        phoneNumber: UserProfileData?.phoneNumber || null,
        isLookingForJob: pendingUpdate,
      },
    });
    setPendingUpdate(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setPendingUpdate(null);
  };

  const [fullName, setFullName] = useState<string>(
    token ? `${UserProfileData?.firstName} ${UserProfileData?.lastName}` : ""
  );
  const handleAuth = async () => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
      // console.log("okwqeqwe");
    } else {
      setModalVisibleCV(true);
    }
    // setModalVisibleLogin(true);
  };
  const handleNavigateInfo = () => {
    navigation.navigate("Information");
  };

  const handleNavigateCVProfile = () => {
    // navigation.navigate("CVModal");
    navigation.navigate("CVTemplate");
  };
  const {
    data: JobPosts,
    isLoading: isJobLoading,
    isError: isJobError,
  } = useQuery({
    queryKey: ["JobPosts"],
    queryFn: ({ signal }) => GetJobPost({ signal: signal }),
    staleTime: 5000,
  });

  // Fetching Companies using React Query
  const {
    data: Company,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
  } = useQuery({
    queryKey: ["Company"],
    queryFn: ({ signal }) => fetchCompanies({ signal: signal }),
    staleTime: 5000,
  });

  const { data: JobPostActivity } = useQuery({
    queryKey: ["JobPostActivity"],
    queryFn: ({ signal }) => GetJobActivity({ signal }),
    staleTime: 5000,
    enabled: !!UserId,
  });
  const { mutate: SaveJobs } = useMutation({
    mutationFn: PostFavoriteJobs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["FavoriteJob"],
        refetchType: "active",
      });
      Alert.alert(`Saved job Successfully`);
    },
    onError: () => {
      Alert.alert(`Failed to Save job`);
    },
  });

  const { mutate: UnfollowJobs } = useMutation({
    mutationFn: DeleteFavoriteJobs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["FavoriteJob"],
        refetchType: "active",
      });
      Alert.alert(`Unfollowed job Successfully`);
    },
    onError: () => {
      Alert.alert(`Failed to Unfollow job`);
    },
  });

  const handleSaveJob = async (id: number | undefined) => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
      return;
    }

    SaveJobs({
      data: {
        jobPostId: Number(id),
      },
    });
  };

  const handleUnFollowJobs = async (id: number) => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
    }
    UnfollowJobs({ id: Number(id) });
  };

  const { data: FavoriteJob } = useQuery({
    queryKey: ["FavoriteJob"],
    queryFn: ({ signal }) => GetFavoriteJobs({ signal }),
    staleTime: 5000,
  });

  const FavoriteJobs = FavoriteJob?.JobPost;

  const JobPostsdata = JobPosts?.JobPosts;
  const Companiesdata = Company?.Companies;
  const JobPostActivitydata = JobPostActivity?.UserJobActivitys;
  const JobPending = JobPostActivitydata?.filter(
    (item) => item.status === "InterviewStage"
  );
  const { mutate: deleteCV } = useMutation({
    mutationFn: DeleteCV,
    onSuccess: () => {
      // Invalidate and refetch the cache to ensure the UI is updated immediately
      queryClient.invalidateQueries({
        queryKey: ["CVs"],
        refetchType: "active", // Ensure an active refetch
      });
      Alert.alert("CVs Details Deleted Successfully");
      setDeletingId(null);
    },
    onError: () => {
      Alert.alert("Failed to delete the CVs");
      setDeletingId(null);
    },
  });
  const handleDeleteCV = (id: number) => {
    setDeletingId(id);
    deleteCV({ id: id });
  };

  const handleNavigateFavoriteCompany = () => {
    navigation.navigate("FavoriteCompany");
  };
  const handleNavigateAlert = () => {
    navigation.navigate("JobsAlert");
  };

  useEffect(() => {
    let newPercent = 0;

    if (UserProfileData) {
      if (UserProfileData.educationDetails.length > 0) {
        newPercent += 33.3;
      }
      if (UserProfileData.experienceDetails.length > 0) {
        newPercent += 33.3;
      }
      if (UserProfileData.skillSets.length > 0) {
        newPercent += 33.3;
      }
      if (
        UserProfileData.educationDetails.length > 0 &&
        UserProfileData.experienceDetails.length > 0 &&
        UserProfileData.skillSets.length > 0
      ) {
        newPercent = 100;
      }
    }

    setPercent(newPercent);
  }, [UserProfileData]);

  const renderContent = () => {
    if (selectedTab === "Applied") {
      return (
        <>
          {token && (
            <View style={styles.jobdisplay}>
              {JobPostActivitydata?.map((activity) => {
                const PendingJobApplied = JobPostsdata?.find(
                  (job) => job.id === activity.jobPostId
                );
                const pendingJobsArray = [];
                pendingJobsArray.push(PendingJobApplied);

                // setEveryJob(PendingJobApplied)
                const company = Companiesdata?.find(
                  (item) => item.id === PendingJobApplied?.companyId
                );

                const city = pendingJobsArray?.map(
                  (city) => city?.jobLocationCities
                );
                const flattenedArrayCity = city?.flat();
                console.log("aduphong1", city);
                const uniqueArrayCity = [...new Set(flattenedArrayCity)];

                const cityColumn = uniqueArrayCity;

                const haveFavorite = FavoriteJobs?.find(
                  (item) => item.id === Number(PendingJobApplied?.id)
                );
                return (
                  <TouchableOpacity style={styles.jobCard} key={activity.id}>
                    <View style={styles.maincompany}>
                      {PendingJobApplied?.isHot && (
                        <View style={styles.hotBadge}>
                          <Text style={styles.hotText}>Hot</Text>
                        </View>
                      )}
                      <View style={styles.maincom1}>
                        <Image
                          source={{
                            uri: company?.imageUrl,
                          }}
                          style={styles.image}
                        />
                        <Text
                          style={styles.text}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {company?.companyName}
                        </Text>
                      </View>
                      <View
                        style={{
                          marginTop: 10,
                          paddingLeft: 20,
                          marginLeft: "auto",
                        }}
                      >
                        {haveFavorite ? (
                          <TouchableOpacity
                            onPress={() => handleUnFollowJobs(haveFavorite.id)}
                          >
                            <Icon name={"bookmark"} size={30} color="#808080" />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() => handleSaveJob(PendingJobApplied?.id)}
                          >
                            <Icon
                              name={"bookmark-border"}
                              size={30}
                              color="#808080"
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("JobDetail", {
                          jobId: activity?.jobPostId,
                        })
                      }
                    >
                      <Text style={styles.jobTitle}>{activity.jobTitle}</Text>
                    </TouchableOpacity>

                    <View style={styles.iconRow}>
                      <Icon name="place" size={20} color="#777" />
                      <View style={styles.tagContainer}>
                        {cityColumn.length && cityColumn.length > 0
                          ? cityColumn.map((location, index) => (
                              <Text style={styles.jobDetails} key={index}>
                                {location}
                                {index !== cityColumn.length - 1 ? "," : ""}
                              </Text>
                            ))
                          : cityColumn.map((location, index) => (
                              <Text style={styles.jobDetails} key={index}>
                                {location}
                                {index !== cityColumn.length - 1 ? "," : ""}
                              </Text>
                            ))}
                      </View>
                    </View>

                    <View style={styles.iconRow}>
                      <Icon name="attach-money" size={20} color="#777" />
                      <Text style={styles.jobDetails}>
                        {/* {PendingJobApplied?.salary} */}
                        {/* {`${PendingJobApplied?.minsalary} - ${PendingJobApplied?.salary} USD`} */}
                        {PendingJobApplied?.minsalary &&
                        PendingJobApplied?.salary
                          ? `${
                              PendingJobApplied.minsalary >= 1000000
                                ? PendingJobApplied.minsalary / 1000000
                                : PendingJobApplied.minsalary
                            } ${
                              PendingJobApplied.minsalary >= 1000000
                                ? "triệu"
                                : "VNĐ"
                            } - ${
                              PendingJobApplied.salary >= 1000000
                                ? PendingJobApplied.salary / 1000000
                                : PendingJobApplied.salary
                            } ${
                              PendingJobApplied.salary >= 1000000
                                ? "triệu"
                                : "VNĐ"
                            }`
                          : "Salary not specified"}
                      </Text>
                    </View>

                    <View style={styles.iconRow}>
                      <Icon name="access-time" size={20} color="#777" />
                      <Text style={styles.jobDetails}>
                        {formatDateTime(PendingJobApplied?.postingDate)}
                      </Text>
                    </View>

                    <View style={styles.skillContainer}>
                      {PendingJobApplied?.skillSets.map((skill, index) => (
                        <TouchableOpacity style={styles.skill} key={index}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View>
                      <BenefitsList data={PendingJobApplied?.benefitObjects} />
                    </View>
                    <View
                      style={{
                        marginTop: 10,
                        paddingLeft: 1,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{ color: "#777", fontSize: 12, lineHeight: 15 }}
                      >
                        Applied on: {formatDateTime(activity.applicationDate)}
                      </Text>

                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "bold",
                          marginHorizontal: 5,
                        }}
                      >
                        •
                      </Text>

                      <Text
                        style={{ color: "#777", fontSize: 12, lineHeight: 15 }}
                      >
                        Status: {activity.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      );
    } else if (selectedTab === "Saved") {
      return (
        <>
          {token && (
            <View style={styles.jobdisplay}>
              {FavoriteJobs?.map((job) => {
                const jobsfavorite = JobPostsdata?.find(
                  (item) => item.id === job.id
                );
                const company = Companiesdata?.find(
                  (item) => item.id === jobsfavorite?.companyId
                );
                return (
                  <CardJobs
                    key={job.id}
                    data={jobsfavorite}
                    company={company}
                    navigation={navigation}
                  />
                );
              })}
            </View>
          )}
        </>
      );
    }
    // else if (selectedTab === "Interview") {
    //   return (
    //     <>
    //       {token && (
    //         <View style={styles.jobdisplay}>
    //           {JobPending?.map((activity) => {
    //             const PendingJobApplied = JobPostsdata?.find(
    //               (job) => job.id === activity.jobPostId
    //             );
    //             const pendingJobsArray = [];
    //             pendingJobsArray.push(PendingJobApplied);

    //             // setEveryJob(PendingJobApplied)
    //             const company = Companiesdata?.find(
    //               (item) => item.id === PendingJobApplied?.companyId
    //             );

    //             const city = pendingJobsArray?.map(
    //               (city) => city?.jobLocationCities
    //             );
    //             const flattenedArrayCity = city?.flat();
    //             console.log("aduphong1", city);
    //             const uniqueArrayCity = [...new Set(flattenedArrayCity)];

    //             const cityColumn = uniqueArrayCity;

    //             const haveFavorite = FavoriteJobs?.find(
    //               (item) => item.id === Number(PendingJobApplied?.id)
    //             );
    //             return (
    //               <TouchableOpacity style={styles.jobCard} key={activity.id}>
    //                 <View style={styles.maincompany}>
    //                   <View style={styles.maincom1}>
    //                     <Image
    //                       source={{
    //                         uri: company?.imageUrl,
    //                       }}
    //                       style={styles.image}
    //                     />
    //                     <Text
    //                       style={styles.text}
    //                       numberOfLines={2}
    //                       ellipsizeMode="tail"
    //                     >
    //                       {company?.companyName}
    //                     </Text>
    //                   </View>
    //                   <View style={{ paddingLeft: 20, marginLeft: "auto" }}>
    //                     {haveFavorite ? (
    //                       <TouchableOpacity
    //                         onPress={() => handleUnFollowJobs(haveFavorite.id)}
    //                       >
    //                         <Icon name={"bookmark"} size={30} color="#808080" />
    //                       </TouchableOpacity>
    //                     ) : (
    //                       <TouchableOpacity
    //                         onPress={() => handleSaveJob(PendingJobApplied?.id)}
    //                       >
    //                         <Icon
    //                           name={"bookmark-border"}
    //                           size={30}
    //                           color="#808080"
    //                         />
    //                       </TouchableOpacity>
    //                     )}
    //                   </View>
    //                 </View>

    //                 <TouchableOpacity
    //                   onPress={() =>
    //                     navigation.navigate("JobDetail", {
    //                       jobId: activity?.jobPostId,
    //                     })
    //                   }
    //                 >
    //                   <Text style={styles.jobTitle}>{activity.jobTitle}</Text>
    //                 </TouchableOpacity>

    //                 <View style={styles.iconRow}>
    //                   <Icon name="place" size={20} color="#777" />
    //                   <View style={styles.tagContainer}>
    //                     {cityColumn.length && cityColumn.length > 0 ? (
    //                       cityColumn.map((location, index) => (
    //                         <Text style={styles.jobDetails} key={index}>
    //                           {location}
    //                           {index !== cityColumn.length - 1 ? "," : ""}
    //                         </Text>
    //                       ))
    //                     ) : (
    //                       <Text style={styles.jobDetails}>
    //                         {company?.address} {" in "} {company?.city}
    //                       </Text>
    //                     )}
    //                   </View>
    //                 </View>

    //                 <View style={styles.iconRow}>
    //                   <Icon name="attach-money" size={20} color="#777" />
    //                   <Text style={styles.jobDetails}>
    //                     {PendingJobApplied?.salary}
    //                   </Text>
    //                 </View>

    //                 <View style={styles.iconRow}>
    //                   <Icon name="access-time" size={20} color="#777" />
    //                   <Text style={styles.jobDetails}>
    //                     {formatDateTime(PendingJobApplied?.postingDate)}
    //                   </Text>
    //                 </View>

    //                 <View style={styles.skillContainer}>
    //                   {PendingJobApplied?.skillSets.map((skill, index) => (
    //                     <TouchableOpacity style={styles.skill} key={index}>
    //                       <Text style={styles.skillText}>{skill}</Text>
    //                     </TouchableOpacity>
    //                   ))}
    //                 </View>

    //                 <View
    //                   style={{
    //                     marginTop: 10,
    //                     paddingLeft: 1,
    //                     flexDirection: "row",
    //                     alignItems: "center",
    //                   }}
    //                 >
    //                   <Text
    //                     style={{ color: "#777", fontSize: 12, lineHeight: 15 }}
    //                   >
    //                     Applied on: {formatDateTime(activity.applicationDate)}
    //                   </Text>

    //                   <Text
    //                     style={{
    //                       fontSize: 14,
    //                       fontWeight: "bold",
    //                       marginHorizontal: 5,
    //                     }}
    //                   >
    //                     •
    //                   </Text>

    //                   <Text
    //                     style={{ color: "#777", fontSize: 12, lineHeight: 15 }}
    //                   >
    //                     Status: {activity.status}
    //                   </Text>
    //                 </View>
    //               </TouchableOpacity>
    //             );
    //           })}
    //         </View>
    //       )}
    //     </>
    //   );
    // }
  };
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const { mutate, isPending } = useMutation({
    mutationFn: PutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Profile"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["JobSeekerRole"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["UserProfile"],
        refetchType: "active",
      });
      Alert.alert("User details updated successfully");
    },
    onError: () => {
      Alert.alert("Failed to update user details");
    },
  });

  const handleSubmit = () => {
    mutate({
      data: {
        // id: Number(formData.id),
        // userName: formData.userName,
        firstName: firstName,
        lastName: lastName,
        email: email || "",
        phoneNumber: phoneNumber,
        isLookingForJob: UserProfileData?.isLookingForJob,
        coverLetter: coverLetter,
      },
    });
  };

  return (
    <ScrollView>
      <View style={styles.main}>
        <View style={styles.main1}>
          <Text style={styles.title}>About me </Text>
          <Text> My personal details</Text>

          {/* Profile Card */}
          <ProfileCard
            phoneNumber={token ? UserProfileData?.phoneNumber : null}
            fullName={token ? UserProfileData?.email : null}
            setModalVisible={setModalVisible}
          />

          {/* Full Name Modal */}
          {token && (
            <FullNameModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              setCoverletter={setCoverletter}
              coverLetter={coverLetter}
              // fullName={fullName}
              address={email}
              setAddress={setAddress}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              // setFullName={setFullName}
              setFirstName={setFirstName}
              firstName={firstName}
              lastName={lastName}
              setLastName={setLastName}
              Onclick={handleSubmit}
            />
          )}
          {token && (
            <>
              <ModalOff
                visible={openModal}
                onClose={handleCloseModal}
                onConfirm={handleConfirmModal}
              />

              <View style={styles.containerne}>
                <Switch
                  trackColor={{ false: "#d3d3d3", true: "#81b0ff" }}
                  thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
                {isEnabled ? (
                  <Text style={styles.label}>Yes </Text>
                ) : (
                  <Text style={styles.label}>No </Text>
                )}
              </View>

              <Text>
                {" "}
                Allow to receive job invitations from employers By Text Email
              </Text>
            </>
          )}
        </View>

        <View style={styles.main2}>
          <Text style={styles.title}>CV/Cover Letter </Text>

          <Text>Would you like you to have a job that suits you</Text>
          {token && (
            <View style={styles.cardProfile}>
              <Text style={styles.titleProfile}>
                {UserProfileData?.firstName} {UserProfileData?.lastName} CV
                Profile
              </Text>
              {/* <Text style={styles.date}>13/10/2024 22:24</Text> */}
              <Text style={styles.subtitle}>Created on our System</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.buttonProfile}
                  onPress={handleNavigateCVProfile}
                >
                  <Text style={styles.buttonTextProfile}>PREVIEW</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonProfile}
                  onPress={handleNavigateInfo}
                >
                  <Text style={styles.buttonTextProfile}>EDIT</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.percent}>
                <GradientCircularProgress percentage={percent} />
              </View>
            </View>
          )}
          {token &&
            dataCVS.map((file) => (
              <View style={styles.fileItemContainer} key={file.id}>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{file.name}</Text>
                  {deletingId === file.id ? (
                    <Text>Please wait a second...</Text>
                  ) : (
                    <TouchableOpacity onPress={() => handleDeleteCV(file.id)}>
                      <MaterialIcons name="delete" size={24} color="red" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => handlePreview(file.url)}
                >
                  <Text style={styles.previewButtonText}>PREVIEW</Text>
                </TouchableOpacity>
              </View>
            ))}

          <TouchableOpacity style={styles.update} onPress={handleAuth}>
            <Text style={{ fontSize: 20, lineHeight: 30, color: "white" }}>
              UPLOAD/CREATE NEW CV{" "}
            </Text>
          </TouchableOpacity>
          {/* MOdal cv */}
          <CVModal
            modalVisible={modalVisibleCV}
            setModalVisible={setModalVisibleCV}
            navigation={navigation}
          />
          <AuthModal
            navigation={navigation}
            visible={modalVisibleLogin}
            onClose={() => setModalVisibleLogin(false)}
          />
        </View>

        <View style={styles.main3}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === "Applied" && styles.activeTab,
              ]}
              onPress={() => setSelectedTab("Applied")}
            >
              <Text
                style={
                  selectedTab === "Applied"
                    ? styles.activeTabText
                    : styles.tabText
                }
              >
                Applied
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === "Saved" && styles.activeTab]}
              onPress={() => setSelectedTab("Saved")}
            >
              <Text
                style={
                  selectedTab === "Saved"
                    ? styles.activeTabText
                    : styles.tabText
                }
              >
                Saved
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === "Interview" && styles.activeTab,
              ]}
              onPress={() => setSelectedTab("Interview")}
            >
              <Text
                style={
                  selectedTab === "Interview"
                    ? styles.activeTabText
                    : styles.tabText
                }
              >
                Interview
              </Text>
            </TouchableOpacity> */}
            {/* <TouchableOpacity
                style={[
                  styles.tab,
                  selectedTab === "opening" && styles.activeTab,
                ]}
                onPress={() => setSelectedTab("opening")}
              >
                <Text
                  style={
                    selectedTab === "opening"
                      ? styles.activeTabText
                      : styles.tabText
                  }
                >
                  Opening
                </Text>
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {?.jobs?.length || 0}
                  </Text>
                </View>
              </TouchableOpacity> */}
          </View>
          {renderContent()}
        </View>
        {token && (
          <View style={styles.main3}>
            <Text style={styles.title}>I'm open for offers</Text>

            <Text>
              By subscribing, Amazing Job will suggest in-demand new jobs that
              match your skill via email
            </Text>
            <TouchableOpacity
              style={styles.cardne}
              onPress={handleNavigateFavoriteCompany}
            >
              <View style={styles.iconContainer}>
                <Icon name="tune" size={24} color="#7c7c7c" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.subtitlene}>From companies Follow</Text>
                <TouchableOpacity>
                  <Text style={styles.viewListText}>View List</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardne}
              onPress={handleNavigateAlert}
            >
              <View style={styles.iconContainer}>
                <Icon name="work" size={24} color="#7c7c7c" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.subtitlene}>Add Tag alert like</Text>
                <TouchableOpacity>
                  <Text style={styles.viewListText}>Subscribe</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 10,
    gap: 20,
  },
  main1: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    elevation: 5,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: "white",
    width: "100%",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 30,
  },

  main2: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    elevation: 5,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: "white",
    width: "100%",
    gap: 10,
  },

  update: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: "#FF4500",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: 10,
    color: "white",
  },
  main3: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    elevation: 5,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: "white",
    width: "100%",
    gap: 10,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    // marginBottom: 5,
    // marginTop: 20,
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
  card: {
    borderRadius: 8,
    backgroundColor: "white",
    padding: 16,
    paddingHorizontal: 20,
    marginVertical: 8,
    elevation: 2,
    flexDirection: "column",
    gap: 10,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  jobdisplay: {
    flexDirection: "column",
    gap: 5,
    alignItems: "center",
  },
  jobCard: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    width: 370,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FF4500",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  jobDetails: {
    fontSize: 14,
    color: "#777",
    marginLeft: 5,
  },
  skillContainer: {
    flexDirection: "row",
    marginTop: 10,
    gap: 5,
  },
  skill: {
    backgroundColor: "#EFEFEF",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  skillText: {
    fontSize: 12,
    color: "#333",
  },
  back: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    // alignItems: "center",
  },
  button: {
    borderColor: "#ddd",
    borderWidth: 1,
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignItems: "center",
    textAlign: "center",
  },
  buttonText: {
    fontSize: 15,
    lineHeight: 22.5,
    color: "#333",
    fontWeight: "bold",
  },
  maincompany: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  maincom1: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 10,
  },
  image: {
    height: 48,
    width: 48,
    backgroundColor: "white",
  },
  text: {
    fontSize: 16,
    lineHeight: 25,
    marginTop: 5,
    marginBottom: 5,
  },
  cardProfile: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    elevation: 3, // For shadow on Android
    shadowColor: "#000", // For shadow on iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 5,
    marginVertical: 10,
    width: "100%",
    alignSelf: "center",
    position: "relative",
  },
  percent: {
    position: "absolute",
    top: 0,
    left: 270,
  },

  titleProfile: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonProfile: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonTextProfile: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  fileItemContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    elevation: 3, // Shadow on Android
    shadowColor: "#000", // Shadow on iOS
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    width: "100%",
  },
  fileInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  tagContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 5,
    flexShrink: 1,
  },
  fileDetails: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  previewButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  previewButtonText: {
    fontSize: 16,
    color: "#555",
  },
  cardne: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  subtitlene: {
    color: "#7c7c7c",
    fontSize: 14,
  },
  viewListText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  containerne: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },
  hotBadge: {
    position: "absolute",
    top: 0,
    right: 10,
    backgroundColor: "#FF4500",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    zIndex: 1,
  },
  hotText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
