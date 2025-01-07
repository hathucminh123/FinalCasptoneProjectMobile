import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Alert, // Import Animated
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
import SeacrHeaderr from "../components/common/SearchHeaderr";

type RootStackParamList = {
  Home: undefined;
  SearchResults: { query: string; location?: string; jobSearch?: JobPost[] };
};

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
}

interface JobType {
  id: number;
  name: string;
  description: string;
}

type SearchResultsRouteProp = RouteProp<RootStackParamList, "SearchResults">;

export default function SearchResults({ navigation }: any) {
  const [selectedTab, setSelectedTab] = useState("All");

  const route = useRoute<SearchResultsRouteProp>();
  // const { query } = route.params;
  const { query, location, jobSearch } = route.params;
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
      keyword?:string;
    }

    const searchDataArray: SearchData[] = [
      // { companyName: query, pageSize: 1000 },
      // { skillSet: query, pageSize: 1000 },
      // { location: query, pageSize: 1000 },
      // { city: query, pageSize: 1000 },
      {keyword:query,pageSize:1000}
      // { experience: query, pageSize: 9 },
      // { jobType: query, pageSize: 1000 },
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

  const renderContent = () => {
    if (selectedTab === "All") {
      return (
        <View style={styles.container}>
          <Text style={{ fontSize: 15, lineHeight: 22.5, fontWeight: "bold" }}>
            Jobs
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 22.5 }}>
            Have {jobSearch1?.length} jobs
          </Text>
          <View style={styles.jobdisplay}>
            {jobSearch1?.map((job) => {
              const company = Companiesdata?.find(
                (item) => item.id === job.companyId
              );
              // const jobs = JobPostsdata?.find((item) => item.id === job.id);
              return (
                <CardJobs
                  key={job.id}
                  data={job}
                  // img={job.companyImage}
                  company={company}
                  navigation={navigation}
                />
              );
            })}
          </View>
          <Text style={{ fontSize: 15, lineHeight: 22.5, fontWeight: "bold" }}>
            Companies
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 22.5 }}>
            Have {companyhavJobs?.length} companies
          </Text>
          <View style={styles.companiesisplay}>
            {companyhavJobs?.map((company) => {
              // const companydata = Companiesdata?.find(
              //   (item) => item.id ===job.companyId
              // );
              const jobsInCompany = JobPostsdata?.filter(
                (item) => item.companyId === company.id
              );

              return (
                <CardCompany
                  jobs={jobsInCompany}
                  key={company.id}
                  data={company}
                  navigation={navigation}
                />
              );
            })}
          </View>
        </View>
      );
    } else if (selectedTab === "Jobs") {
      return (
        <View style={styles.container}>
          <Text style={{ fontSize: 15, lineHeight: 22.5, fontWeight: "bold" }}>
            Jobs
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 22.5 }}>
            Have {jobSearch1?.length} jobs
          </Text>
          <View style={styles.jobdisplay}>
            {jobSearch1?.map((job) => {
              const company = Companiesdata?.find(
                (item) => item.id === job.companyId
              );
              return (
                <CardJobs
                  key={job.id}
                  data={job}
                  // img={job.companyImage}
                  company={company}
                  navigation={navigation}
                />
              );
            })}
          </View>
        </View>
      );
    } else if (selectedTab === "Companies") {
      return (
        <View style={styles.container}>
          <Text style={{ fontSize: 15, lineHeight: 22.5, fontWeight: "bold" }}>
            Companies
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 22.5 }}>
            Have {companyhavJobs?.length} companies
          </Text>
          <View style={styles.companiesisplay}>
            {companyhavJobs?.map((company) => {
              const jobsInCompany = JobPostsdata?.filter(
                (item) => item.companyId === company.id
              );

              return (
                <CardCompany
                  jobs={jobsInCompany}
                  key={company.id}
                  data={company}
                  navigation={navigation}
                />
              );
            })}
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.main1}>
      <SeacrHeaderr
        navigation={navigation}
        jobSearch={JobPostsdata}
        setJobSearch={setJobSearch}
      />
      <View style={styles.main}>
        <TouchableOpacity
          style={[styles.all, selectedTab === "All" && styles.activeTab]}
          onPress={() => handleTabChange("All")}
        >
          <Text
            style={{
              fontSize: 15,
              lineHeight: 22.5,
              color: selectedTab === "All" ? "#FF4500" : "#000",
            }}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.all, selectedTab === "Jobs" && styles.activeTab]}
          onPress={() => handleTabChange("Jobs")}
        >
          <Text
            style={{
              fontSize: 15,
              lineHeight: 22.5,
              color: selectedTab === "Jobs" ? "#FF4500" : "#000",
            }}
          >
            Jobs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.all, selectedTab === "Companies" && styles.activeTab]}
          onPress={() => handleTabChange("Companies")}
        >
          <Text
            style={{
              fontSize: 15,
              lineHeight: 22.5,
              color: selectedTab === "Companies" ? "#FF4500" : "#000",
            }}
          >
            Companies
          </Text>
        </TouchableOpacity>
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
    position:'relative'
  },
  scrollContainer: {
    paddingBottom: 120,
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
  companiesisplay: {
    flexDirection: "column",
    marginBottom: 5, // Updated margin spacing
    alignItems: "center",
  },
});
