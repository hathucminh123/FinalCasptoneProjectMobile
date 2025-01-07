import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Alert,
  Image, // Import Animated
} from "react-native";
import CardJobs from "../components/CardJobs";
import { jobData } from "../mock/JobData";
// import { companyData } from "../mock/CompanyData";
import CardCompany from "../components/CardCompany";
import LocationModal from "../components/LocationModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetJobPost } from "../Services/JobsPost/GetJobPosts";
import { fetchCompanies } from "../Services/CompanyService/GetCompanies";
import { GetJobSearch } from "../Services/JobSearchService/JobSearchService";
import { queryClient } from "../Services/mainService";
import { useAppContext } from "../components/Employer/Context";
// import SeacrHeaderr from "../components/common/SearchHeaderr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetJobActivity } from "../Services/UserJobPostActivity/GetUserJobPostActivity";
import { GetFavoriteJobs } from "../Services/FavoriteJobs/GetFavoriteJobs";
import Icon from "react-native-vector-icons/MaterialIcons";
import { DeleteFavoriteJobs } from "../Services/FavoriteJobs/DeleteFavoriteJobs";
import { PostFavoriteJobs } from "../Services/FavoriteJobs/PostFavoriteJobs";
import AuthModal from "../components/AuthModal";
import BenefitsList from "../components/Employer/BenefitList";

type RootStackParamList = {
  Home: undefined;
  SearchResults: { query: string; location?: string; jobSearch?: JobPost[] };
};
interface Benefits {
  id: number;
  name: string;
  // shorthand: string;
  // description: string;
}

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
  jobType: JobType;
  jobLocationCities: string[];
  jobLocationAddressDetail: string[];
  skillSets: string[];
  benefitObjects?: Benefits[];
}

interface JobType {
  id: number;
  name: string;
  description: string;
}

type SearchResultsRouteProp = RouteProp<RootStackParamList, "SearchResults">;

export default function MyJobs({ navigation }: any) {
  const [selectedTab, setSelectedTab] = useState("Pending");
  const [Auth, setAuth] = useState<string | null>("");
  const [UserId, setUserId] = useState<string | null>("");
  const [token, setToken] = useState<string | null>("");
  const [email, setEmail] = useState<string | null>("");
  const [modalVisibleLogin, setModalVisibleLogin] = useState<boolean>(false);
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
      fetchUserData();
    }, [])
  );
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

    return "Invalid date";
  };
  const route = useRoute<SearchResultsRouteProp>();
  // const { query } = route.params;
  const { query, location, jobSearch } = route.params || {
    query: "",
    location: "",
    jobSearch: [],
  };
  const { jobSearch: jobContext } = useAppContext();
  console.log("metnhane", jobSearch);
  const [jobSearch1, setJobSearch] = useState<JobPost[]>(jobSearch || []);
  console.log("thiet khong", jobSearch);
  const { mutateAsync } = useMutation({
    mutationFn: GetJobSearch,
    onSuccess: (data) => {
      console.log("Search result:", data);
      const jobSearchResults = data.result.items;
      if (data && data.result && data.result.items.length > 0) {
        setJobSearch(data.result.items);

        navigation.navigate("SearchResults", {
          // query: searchQuery,
          location: location,
          jobSearch: jobSearchResults,
        });
      } else {
        navigation.navigate("SearchResults", {
          // query: searchQuery,
          location: location,
          jobSearch: jobSearchResults,
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["JobSearch"],
        refetchType: "active",
      });

      // navigate("/it-jobs");
    },
    onError: () => {
      Alert.alert("Failed to Search");
    },
  });
  const handleNavigate = async () => {
    // Define the shape of job data returned by the mutation
    interface JobSearchResponse {
      result: {
        items: JobPost[];
      };
    }
    interface SearchData {
      companyName?: string;
      skillSet?: string;
      city?: string;
      location?: string;
      // experience?: number;
      jobType?: string;
      pageSize: number;
      keyword?: string;
    }

    const searchDataArray: SearchData[] = [
      // { companyName: query, pageSize: 1000  },
      // { skillSet: query, pageSize:  1000  },
      // { location: query, pageSize:  1000  },
      // { city: query, pageSize:  1000  },
      { keyword: location, pageSize: 1000 },
      // { experience: query, pageSize: 9 },
      // { jobType: query, pageSize:  1000  },
    ];

    for (let i = 0; i < searchDataArray.length; i++) {
      try {
        console.log("Searching with:", searchDataArray[i]);

        const result: JobSearchResponse = await mutateAsync({
          data: searchDataArray[i],
        });
        console.log("chan", result.result.items);

        if (result && result.result && result.result.items.length > 0) {
          setJobSearch(result.result.items);
          break;
        }
      } catch (error) {
        console.error("Error during job search:", error);
      }
    }
  };

  const [fadeAnim] = useState(new Animated.Value(1)); // Tạo giá trị animated cho opacity
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

  const JobPostsdata = JobPosts?.JobPosts;
  const Companiesdata = Company?.Companies;
  const jobSlice = JobPostsdata?.slice(0, 5);

  const { data: JobPostActivity } = useQuery({
    queryKey: ["JobPostActivity"],
    queryFn: ({ signal }) => GetJobActivity({ signal }),
    staleTime: 5000,
    enabled: !!UserId,
  });

  const JobPostActivitydata = JobPostActivity?.UserJobActivitys;
  const JobPending = JobPostActivitydata?.filter(
    (item) => item.status === "Pending"
  );
  const JobCVScreening = JobPostActivitydata?.filter(
    (item) => item.status === "CVScreeningPassed"
  );
  const JobInterview = JobPostActivitydata?.filter(
    (item) => item.status === "InterviewStage"
  );
  const JobPassed = JobPostActivitydata?.filter(
    (item) => item.status === "Passed"
  );
  const JobRejected = JobPostActivitydata?.filter(
    (item) => item.status === "Rejected"
  );
  const companyhavJobs =
    Array.isArray(Companiesdata) && Array.isArray(jobSearch1)
      ? Companiesdata.filter((company) =>
          jobSearch1.some((job) => company.id === job.companyId)
        )
      : [];
  const handleTabChange = (tab: any) => {
    // Animation fade out trước khi thay đổi tab
    Animated.timing(fadeAnim, {
      toValue: 0, // Làm mờ nội dung hiện tại
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Thay đổi tab sau khi hoàn thành fade out
      setSelectedTab(tab);

      // Animation fade in sau khi đổi tab
      Animated.timing(fadeAnim, {
        toValue: 1, // Hiển thị lại nội dung
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };
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

  const renderContent = () => {
    if (selectedTab === "Pending") {
      return (
        <>
          {token && (
            <View style={styles.jobdisplay}>
              {JobPending?.map((activity) => {
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
                      <View style={{ paddingLeft: 20, marginLeft: "auto" }}>
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
                        {
                          cityColumn.length && cityColumn.length > 0
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
                              ))
                          // <Text style={styles.jobDetails}>
                          //   {company?.address} {" in "} {company?.city}
                          // </Text>
                        }
                      </View>
                    </View>

                    <View style={styles.iconRow}>
                      <Icon name="attach-money" size={20} color="#777" />
                      <Text style={styles.jobDetails}>
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
                        {/* {PendingJobApplied?.salary} */}
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
    } else if (selectedTab === "CVScreeningPassed") {
      return (
        <>
          {token && (
            <View style={styles.jobdisplay}>
              {JobCVScreening?.map((activity) => {
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
                      <View style={{ paddingLeft: 20, marginLeft: "auto" }}>
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
                          : // <Text style={styles.jobDetails}>
                            //   {company?.address} {" in "} {company?.city}
                            // </Text>
                            cityColumn.map((location, index) => (
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
    } else if (selectedTab === "InterView") {
      return (
        <>
          {token && (
            <View style={styles.jobdisplay}>
              {JobInterview?.map((activity) => {
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
                      <View style={{ paddingLeft: 20, marginLeft: "auto" }}>
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
                          : // <Text style={styles.jobDetails}>
                            //   {company?.address} {" in "} {company?.city}
                            // </Text>
                            cityColumn.map((location, index) => (
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
    } else if (selectedTab === "Passed") {
      return (
        <>
          {token && (
            <View style={styles.jobdisplay}>
              {JobPassed?.map((activity) => {
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
                      <View style={{ paddingLeft: 20, marginLeft: "auto" }}>
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
                          : // <Text style={styles.jobDetails}>
                            //   {company?.address} {" in "} {company?.city}
                            // </Text>
                            cityColumn.map((location, index) => (
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
    } else if (selectedTab === "Rejected") {
      return (
        <>
          {token && (
            <View style={styles.jobdisplay}>
              {JobRejected?.map((activity) => {
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
                      <View style={{ paddingLeft: 20, marginLeft: "auto" }}>
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
                          : // <Text style={styles.jobDetails}>
                            //   {company?.address} {" in "} {company?.city}
                            // </Text>
                            cityColumn.map((location, index) => (
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
                        {/* {PendingJobApplied?.salary} */}
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
    }
  };

  return (
    <View style={styles.main1}>
      {/* <AuthModal
        navigation={navigation}
        visible={modalVisibleLogin}
        onClose={() => setModalVisibleLogin(false)}
      /> */}
      {/* <SeacrHeaderr
        navigation={navigation}
        jobSearch={jobSearch1}
        setJobSearch={setJobSearch}
      /> */}
      <View style={styles.main}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        >
          <TouchableOpacity
            style={[styles.all, selectedTab === "Pending" && styles.activeTab]}
            onPress={() => handleTabChange("Pending")}
          >
            <Text
              style={{
                fontSize: 15,
                lineHeight: 22.5,
                color: selectedTab === "Pending" ? "#FF4500" : "#000",
              }}
            >
              Pending {JobPending?.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.all,
              selectedTab === "CVScreeningPassed" && styles.activeTab,
            ]}
            onPress={() => handleTabChange("CVScreeningPassed")}
          >
            <Text
              style={{
                fontSize: 15,
                lineHeight: 22.5,
                color: selectedTab === "CVScreeningPassed" ? "#FF4500" : "#000",
              }}
            >
              CVScreeningPassed {JobCVScreening?.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.all,
              selectedTab === "InterView" && styles.activeTab,
            ]}
            onPress={() => handleTabChange("InterView")}
          >
            <Text
              style={{
                fontSize: 15,
                lineHeight: 22.5,
                color: selectedTab === "InterView" ? "#FF4500" : "#000",
              }}
            >
              InterView {JobInterview?.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.all, selectedTab === "Passed" && styles.activeTab]}
            onPress={() => handleTabChange("Passed")}
          >
            <Text
              style={{
                fontSize: 15,
                lineHeight: 22.5,
                color: selectedTab === "Passed" ? "#FF4500" : "#000",
              }}
            >
              Passed {JobPassed?.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.all, selectedTab === "Rejected" && styles.activeTab]}
            onPress={() => handleTabChange("Rejected")}
          >
            <Text
              style={{
                fontSize: 15,
                lineHeight: 22.5,
                color: selectedTab === "Rejected" ? "#FF4500" : "#000",
              }}
            >
              Rejected {JobRejected?.length}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {renderContent()}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main1: {
    flexDirection: "column",
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 8, // Adjust spacing between tabs and content
  },
  main: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomColor: "#dedede",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    height: 50,
  },
  all: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  activeTab: {
    borderColor: "#FF4500",
  },
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 20,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  jobdisplay: {
    flexDirection: "column",
    marginBottom: 5, // Updated margin spacing
    alignItems: "center",
  },
  // jobdisplay: {
  //   flexDirection: "column",
  //   gap: 5,
  //   alignItems: "center",
  // },
  jobCard: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    width: 370,
  },
  companiesisplay: {
    flexDirection: "column",
    marginBottom: 5, // Updated margin spacing
    alignItems: "center",
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
  tagContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 5,
    flexShrink: 1,
  },
  skillContainer: {
    flexDirection: "row",
    marginTop: 10,
    gap: 5,
    flexWrap: "wrap",
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
