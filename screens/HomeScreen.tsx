import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "../Services/CompanyService/GetCompanies";
import { GetJobPost } from "../Services/JobsPost/GetJobPosts";
import CompanyCard from "../components/CompanyCard";
import CardJobs from "../components/CardJobs";
import { GetJobSearch } from "../Services/JobSearchService/JobSearchService";

const { width } = Dimensions.get("window");


interface JobType {
  id: number;
  name: string;
  description: string;
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
}
const HomeScreen: React.FC = ({ navigation }: any) => {
  const [showAllJobs, setShowAllJobs] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch companies and job posts
  const {
    data: companyData,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
  } = useQuery({
    queryKey: ["Company"],
    queryFn: fetchCompanies,
    staleTime: 5000,
  });
  const {
    data: jobData,
    isLoading: isJobLoading,
    isError: isJobError,
  } = useQuery({
    queryKey: ["JobPosts"],
    queryFn: GetJobPost,
    staleTime: 5000,
  });

  const [jobSearch, setJobSearch] = useState<JobPost[]>([]);

  const { mutateAsync } = useMutation({
    mutationFn: GetJobSearch,
    onSuccess: (data) => {
      if (data && data.result && data.result.items.length > 0) {
        setJobSearch(data.result.items);
        // setTotalJobs(data.result.totalCount);
      } else {
        setJobSearch([]);
        // setTotalJobs(0);
      }
    },
    onError: () => {
      Alert.alert("Failed to fetch job data");
    },
  });

  useEffect(() => {
    mutateAsync({
      data: {
        // pageIndex: currentPage,
        pageSize: 2000,
      },
    });
  }, [mutateAsync]);

  // Extended data for infinite horizontal scroll
  const companies = companyData?.Companies || [];
  const extendedData = [...companies, ...companies];

  // Scroll reset for horizontal FlatList
  // const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  //   const contentOffsetX = event.nativeEvent.contentOffset.x;
  //   const currentIndex = Math.floor(contentOffsetX / width);

  //   if (currentIndex >= companies.length && flatListRef.current) {
  //     flatListRef.current.scrollToIndex({
  //       index: currentIndex % companies.length,
  //       animated: false,
  //     });
  //   }
  // };

  // const displayedJobs = showAllJobs
  //   ? jobData?.JobPosts
  //   : jobData?.JobPosts?.slice(0, 4);

  const displayedJobs = showAllJobs ? jobSearch : jobSearch.slice(0, 4);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % extendedData.length;
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * width,
          animated: true,
        });
        return nextIndex;
      });
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [extendedData]);
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.floor(contentOffsetX / width) % companies.length;
    setCurrentIndex(index);
  };

  // Render loading and error states
  if (isCompanyLoading || isJobLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (isCompanyError || isJobError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Failed to load data. Please try again later.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Company for you</Text>
      {/* <FlatList
        ref={flatListRef}
        data={extendedData}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        pagingEnabled
        renderItem={({ item }) => (
          <View style={{ width }}>
            <CompanyCard data={item} navigation={navigation} />
          </View>
        )}
      /> */}
      <FlatList
        ref={flatListRef}
        data={extendedData}
        horizontal
        keyExtractor={(_, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        pagingEnabled
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <CompanyCard data={item} navigation={navigation} />
          </View>
        )}
      />
      {/* <View style={styles.pagination}>
        {companies.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View> */}

      <View style={styles.see}>
        <Text style={styles.heading}>Popular Jobs </Text>
        <Text
          style={styles.heading1}
          onPress={() => setShowAllJobs(!showAllJobs)}
        >
          {showAllJobs ? "Show Less" : "View More"}
        </Text>
      </View>

      <View style={styles.jobdisplay}>
        {displayedJobs?.map((job) => {
          const company = companies.find((item) => item.id === job.companyId);
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
  },
  heading1: {
    color: "blue",
    fontSize: 15,
    fontWeight: "400",
  },
  jobdisplay: {
    alignItems: "center",
    marginTop: 10,
  },
  see: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "red",
  },
});

export default HomeScreen;
