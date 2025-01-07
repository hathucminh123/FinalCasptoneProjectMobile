import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, View } from "react-native";
import { GetFollowCompany } from "../Services/FollowCompany/GetFollowCompany";
import { useQuery } from "@tanstack/react-query";
import CardCompanyFavorite from "./CardCompanyFavorite";
import { GetJobPost } from "../Services/JobsPost/GetJobPosts";
import { fetchCompanies } from "../Services/CompanyService/GetCompanies";

export default function FavoriteCompany({ navigation }: any) {
  const { data: FollowCompany } = useQuery({
    queryKey: ["FollowCompany"],
    queryFn: ({ signal }) => GetFollowCompany({ signal }),
    staleTime: 5000,
  });
  const FollowCompanydata = FollowCompany?.Companies;

  const {
    data: JobPosts,
    isLoading: isJobLoading,
    isError: isJobError,
  } = useQuery({
    queryKey: ["JobPosts"],
    queryFn: ({ signal }) => GetJobPost({ signal: signal }),
    staleTime: 5000,
  });
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
  const JobPostsdata = JobPosts?.JobPosts;
  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.companiesDisplay}>
          {FollowCompanydata?.map((company) => {
            const jobsInCompany = JobPostsdata?.filter(
              (item) => item.companyId === company.id
            );
            const infoCompany = Companiesdata?.find(
              (item) => item.id === company.id
            );

            return (
              <CardCompanyFavorite
                jobs={jobsInCompany}
                key={company.id}
                // data={company}
                data={infoCompany}
                navigation={navigation}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 120,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 10,
    backgroundColor: "white",
  },
  companiesDisplay: {
    width: "100%",
    flexDirection: "column",
    marginBottom: 10,
    alignItems: "center",
  },
});
