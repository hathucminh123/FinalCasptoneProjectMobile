import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Alert,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import CardCompany from "../components/CardCompany";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetJobPost } from "../Services/JobsPost/GetJobPosts";
import { fetchCompanies } from "../Services/CompanyService/GetCompanies";
import CompanyCard from "../components/CompanyCard";
import { GetJobSearch } from "../Services/JobSearchService/JobSearchService";
import { queryClient } from "../Services/mainService";
import { SearchCompany } from "../Services/CompanyService/SearchCompany";
import { SearchCompanyByName } from "../Services/CompanyService/CompanySearchbyName";
interface BusinessStream {
  id: number;
  businessStreamName: string;
  description: string;
}
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
  jobType: JobType; // jobType là đối tượng JobType
  jobLocationCities: string[];
  jobLocationAddressDetail: string[];
  skillSets: string[]; // Array of skill sets, có thể là array rỗng
}
interface Company {
  id: number;
  companyName: string;
  companyDescription: string;
  websiteURL: string;
  establishedYear: number;
  country: string;
  city: string;
  address: string;
  numberOfEmployees: number;
  businessStream: BusinessStream;
  jobPosts: JobPost[];
  imageUrl: string;
}
const SkillSet = ["PHP", "Front End", "Java", "End", "Javascript"];
const { width } = Dimensions.get("window");

export default function CompaniesScreen({ navigation }: any) {
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

  const flatListRef = useRef<FlatList<Company>>(null);

  // const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  //   const contentOffsetX = event.nativeEvent.contentOffset.x;
  //   const currentIndex = Math.floor(contentOffsetX / width);

  //   if (
  //     Companiesdata &&
  //     currentIndex >= Companiesdata.length &&
  //     flatListRef.current
  //   ) {
  //     const scrollToIndex = currentIndex % Companiesdata.length;
  //     flatListRef.current.scrollToIndex({
  //       index: scrollToIndex,
  //       animated: false,
  //     });
  //   }
  // };

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

  const Companiesdata = Company?.Companies ||[];

  const { data: CompanySearch } = useQuery({
    queryKey: ["CompanySearch", location],
    queryFn: ({ signal }) => SearchCompanyByName({ signal, name: location }),
    enabled: !!location,
    staleTime: 5000,
  });

  const CompaniesSearch = CompanySearch?.Companies;

  useEffect(() => {
    if (location && CompaniesSearch) {
      navigation.navigate("CompanyDetail", {
        id: CompaniesSearch.id,
        companyDetail: JSON.stringify(CompaniesSearch),
      });
    }
  }, [location, CompaniesSearch]);

  const JobPostsdata = JobPosts?.JobPosts;
  const extendedData = Companiesdata
    ? [...Companiesdata, ...Companiesdata]
    : [];
  const skills = JobPostsdata?.map((skill) => skill.skillSets);
  const flattenedArray = skills?.flat();
  const uniqueArray = [...new Set(flattenedArray)];

  const [text, setText] = useState<string>("");
  const { mutateAsync } = useMutation({
    mutationFn: GetJobSearch,
    onSuccess: (data) => {
      console.log("Search result:", data);

      if (data && data.result && data.result.items.length > 0) {
        const jobSearchResults = data.result.items;

        navigation.navigate("SearchResults", {
          query: text,
          location: location,
          jobSearch: jobSearchResults,
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["JobSearch"],
        refetchType: "active",
      });
    },
    onError: () => {
      Alert.alert("Failed to Search");
    },
  });

  const handleOnclick = async (column: string) => {
    setText(column);
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
      jobType?: string;
      pageSize: number;
      keyword?: string;
    }

    const searchDataArray: SearchData[] = [
      // { companyName: column, pageSize:  1000  },
      // { skillSet: column, pageSize:  1000  },
      // { city: column, pageSize:  1000  },
      // { location: column, pageSize:  1000  },
      // { jobType: column, pageSize:  1000  },
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
          break;
        }
      } catch (error) {
        console.error("Error during job search:", error);
      }
    }
  };

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
    const index = Math.floor(contentOffsetX / width) % Companiesdata?.length;
    setCurrentIndex(index);
  };


  if (isCompanyLoading || isJobLoading) {
    return <ActivityIndicator size={100} color="#0000ff" />;
  }

  if (isCompanyError || isJobError) {
    return <Text>Error fetching data</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Top Keywords</Text>
        <View style={styles.skillList}>
          {uniqueArray.slice(0, 10).map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={styles.button}
              onPress={() => handleOnclick(tag)}
            >
              <Text style={styles.buttonText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.title1}>Spotlight Search Page</Text>
        {/* <FlatList
          ref={flatListRef}
          data={extendedData}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          snapToInterval={width}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScrollEnd}
          pagingEnabled
          initialNumToRender={5}
          windowSize={10}
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

        <Text style={styles.title1}>Popular Companies</Text>
        {/* <View style={styles.filter}>
          <View style={styles.dropdown}>
            <Text style={styles.label}>Company Name:</Text>
            <Picker
              selectedValue={location}
              onValueChange={(value) => setLocation(value)}
              style={{ flex: 1 }}
            >
              <Picker.Item label="Select Location..." value="" />
              {Companiesdata?.map((item) => (
                <Picker.Item
                  key={item.id}
                  label={item.companyName}
                  value={item.companyName}
                />
              ))}
            </Picker>
          </View>
        </View> */}

        <View style={styles.companiesDisplay}>
          {Companiesdata?.map((company) => {
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
  title: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: "bold",
  },
  title1: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: "bold",
    marginTop: 10,
  },
  skillList: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  button: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  buttonText: { fontSize: 16 },
  filter: {
    borderWidth: 1,
    borderBottomColor: "#dedede",
    borderTopColor: "#dedede",
    paddingVertical: 1,
    paddingHorizontal: 2,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginRight: 10,
  },
  companiesDisplay: {
    width: "100%",
    flexDirection: "column",
    marginBottom: 10,
    alignItems: "center",
  },
});
