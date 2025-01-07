import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CardJobs from "../components/CardJobs";
import { jobData } from "../mock/JobData";
// import { companyData } from "../mock/CompanyData";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "../Services/CompanyService/GetCompanies";
import { GetJobPost } from "../Services/JobsPost/GetJobPosts";
import { GetJobSearch } from "../Services/JobSearchService/JobSearchService";
import { queryClient } from "../Services/mainService";
import SearchHeader from "../components/common/SeacrHeader";
const SkillSet = ["PHP", "Front End", "Java", "End", "Javascript"];

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

export default function FormSearch({ navigation }: any) {
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

  const skills = JobPostsdata?.map((skill) => skill.skillSets);
  const flattenedArray = skills?.flat();
  const uniqueArray = [...new Set(flattenedArray)];
  const Companiesdata = Company?.Companies;
  const jobSlice = JobPostsdata?.slice(0, 5);

  const [text, setText] = useState<string>("");
  const { mutateAsync } = useMutation({
    mutationFn: GetJobSearch,
    onSuccess: (data) => {
      console.log("Search result:", data);

      if (data && data.result && data.result.items.length > 0) {
        const jobSearchResults = data.result.items;
        // setJobSearch(data.result.items);

        navigation.navigate("SearchResults", {
          query: text,
          // location: location,
          jobSearch: jobSearchResults,
        });
      } else {
        navigation.navigate("SearchResults", {
          query: text,
          // location: location,
          jobSearch: data.result.items,
        });
      }

      // queryClient.invalidateQueries({
      //   queryKey: ["JobSearch"],
      //   refetchType: "active",
      // });

      // navigate("/it-jobs",{state : text});
    },
    onError: () => {
      Alert.alert("Failed to Search");
    },
  });

  const handleOnclick = async (column: string) => {
    setText(column);
    console.log("saovay", text);
    interface JobSearchResponse {
      result: {
        items: JobPost[];
      };
    }

    const searchDataArray = [
      // { companyName: column, pageSize: 9 },
      // { skillSet: column, pageSize:  1000  },
      // { location: column, pageSize: 9 },
      // { experience: column, pageSize: 9 },
      // { jobType: column, pageSize: 9 },
      {keyword:column,pageSize:1000}
    ];

    for (let i = 0; i < searchDataArray.length; i++) {
      try {
        console.log("Searching with:", searchDataArray[i]);

        const result: JobSearchResponse = await mutateAsync({
          data: searchDataArray[i],
        });
        console.log("chan", result.result.items);

        if (result && result.result && result.result.items.length > 0) {
          // setJobSearch(result.result.items);

          break;
        }
      } catch (error) {
        console.error("Error during job search:", error);
      }
    }
    // navigate("/it-jobs", { state: column });
  };
  return (
    <ScrollView>
      {/* <SearchHeader /> */}
      <View style={styles.main}>
        <View style={styles.main1}>
          <Image
            source={require("../assets/image.jpg")}
            style={{ width: 200, height: 150 }}
          />
          <Text style={styles.title}>Discover Jobs/Companies </Text>
          <Text style={styles.title1}>
            Try Discovering new jobs/companies with search on browse our
            categories{" "}
          </Text>
          <View style={styles.catgories}>
            <Text style={styles.title}>Top Keyword </Text>
            <View style={styles.skillList}>
              {uniqueArray.slice(0,10).map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.button}
                  onPress={() => handleOnclick(tag)}
                >
                  <Text style={styles.buttonText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.main2}>
          <View style={styles.main3}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                paddingHorizontal: 15,
              }}
            >
              <Text style={styles.title}>Popular Jobs from Companies</Text>
              <TouchableOpacity>
                <Text style={styles.title1}>View More</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.jobdisplay}>
              {jobSlice?.map((job) => {
                const companys = Companiesdata?.find(
                  (item) => item.id === job.companyId
                );
                return (
                  <CardJobs
                    key={job.id}
                    data={job}
                    // img={job.companyImage}
                    company={companys}
                    navigation={navigation}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },

  main1: {
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
  },
  title: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: "bold",
  },
  title1: {
    fontSize: 15,
    lineHeight: 22.5,
    textAlign: "center",
  },
  catgories: {
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 10,
  },

  skillList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#dedede",
    marginRight: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#6c6c6c",
    fontSize: 13,
    lineHeight: 22.5,
    fontWeight: "500",
    textAlign: "center",
  },

  main2: {
    paddingVertical: 30,
    paddingHorizontal: 50,
    backgroundColor: "#fff",
  },
  main3: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 10,
  },
  jobdisplay: {
    paddingRight: 12,
    flexDirection: "column",
    gap: 5,
    paddingLeft: 10,
    alignItems: "center",
  },
});
