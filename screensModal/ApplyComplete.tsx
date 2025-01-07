import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { GetJobPost } from "../Services/JobsPost/GetJobPosts";
import { useQuery } from "@tanstack/react-query";
import CardJobs from "../components/CardJobs";
import { fetchCompanies } from "../Services/CompanyService/GetCompanies";

export default function ApplyComplete({ navigation }: any) {
  const {
    data: JobPosts,
    isLoading: isJobLoading,
    isError: isJobError,
  } = useQuery({
    queryKey: ["JobPosts"],
    queryFn: ({ signal }) => GetJobPost({ signal: signal }),
    staleTime: 5000,
  });
  const JobPostsdata = JobPosts?.JobPosts;
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleNavigate = () => {
    navigation.navigate("Home");
  };

  const {
    data: Company,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
  } = useQuery({
    queryKey: ["Company"],
    queryFn: ({ signal }) => fetchCompanies({ signal: signal }),
    staleTime: 5000,
  });
  const Companiesdata = Company?.Companies;
  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.main}>
          {/* Confirmation message */}
          <View style={styles.main1}>
            <View style={styles.main2}>
              <Text style={styles.title}>Applied Completed</Text>
              <View style={styles.checkMarkContainer}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
              <Text style={styles.congrats}>Congratulation!</Text>
              <Text style={styles.message}>
                Your application has been sent successfully
              </Text>
            </View>
          </View>

          {/* Job suggestion section */}
          {/* <View style={styles.jobCardSection}>
            <Text style={styles.jobCardTitle}>
              Apply to other best jobs for you:
            </Text>
            {JobPostsdata?.map((item) => (
              <View style={styles.jobCard} key={item.id}>
                <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                <View style={styles.iconRow}>
                  <Icon name="place" size={20} color="#777" />
                  {item.jobLocationCities.map((location, index) => (
                    <Text style={styles.jobDetails} key={index}>
                      {location}
                      {index !== item.jobLocationCities.length - 1 ? "," : ""}
                    </Text>
                  ))}
                </View>
                <View style={styles.iconRow}>
                  <Icon name="attach-money" size={20} color="#777" />
                  <Text style={styles.jobDetails}>{item.salary}</Text>
                </View>
                <View style={styles.iconRow}>
                  <Icon name="access-time" size={20} color="#777" />
                  <Text style={styles.jobDetails}>
                    {formatDateTime(item.postingDate)}
                  </Text>
                </View>

                <View style={styles.skillContainer}>
                  {item.skillSets.map((skill, index) => (
                    <TouchableOpacity style={styles.skill} key={index}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View> */}
          <View style={styles.jobdisplay}>
          {JobPostsdata?.map((job) => {
           
            const jobsfavorite = JobPostsdata?.find(
              (item) => item.id === job.id
            );
            const company = Companiesdata?.find(
              (item) => item.id === jobsfavorite?.companyId
            );
            return (
              <CardJobs
                key={job.id}
                data={job}
                company={company}
                navigation={navigation}
              />
            );
          })}
        </View>          
        </View>
      </ScrollView>

      {/* Back button section */}
      <View style={styles.back}>
        <TouchableOpacity onPress={handleNavigate}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>BACK TO HOME</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 100, 
  },
  main: {
    flexDirection: "column",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: "#F7F7F7",
    flex: 1,
  },
  main1: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 10,
  },
  main2: {
    width: "100%",
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 10,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#FFFFFF", 
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  checkMarkContainer: {
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 50,
    padding: 10,
    marginBottom: 15,
  },
  checkMark: {
    fontSize: 24,
    color: "green",
  },
  congrats: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    color: "gray",
  },

  // Job Card Section
  jobCardSection: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    paddingTop: 20,
  },
  jobCardTitle: {
    fontSize: 16,
    color: "blue",
    fontWeight: "bold",
    marginBottom: 15,
  },
  jobCard: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#FFFFFF",
    marginBottom: 20, 
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
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
    paddingHorizontal:20,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    // alignItems: "center", 
  },
  button: {
    borderColor:"#ddd",
    borderWidth:1,
    width:"100%",
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
  jobdisplay: {
    flexDirection: "column",
    gap: 5,
    alignItems: "center",
  },
});
