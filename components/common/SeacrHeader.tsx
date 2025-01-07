import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import LocationModal from "../LocationModal";
import { GetJobSearch } from "../../Services/JobSearchService/JobSearchService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../Services/mainService";
import { debounce } from "lodash";
import FilterModal from "../FilterModal";
import { GetJobPost } from "../../Services/JobsPost/GetJobPosts";
import { fetchCompanies } from "../../Services/CompanyService/GetCompanies";
import { SearchCompanyByName } from "../../Services/CompanyService/CompanySearchbyName";

type RootStackParamList = {
  SearchResults: { query?: string; location?: string; jobSearch?: JobPost[] };
  CompanyDetail: { id: number };
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

type SearchSuggestion = string | Company;

type SearchScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SearchResults",
  "CompanyDetail"
>;

export default function SearchHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [jobSearch, setJobSearch] = useState<JobPost[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsCompany, setSuggestionsCompany] = useState<
    Company[] | undefined
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  const { data: Company } = useQuery({
    queryKey: ["Company"],
    queryFn: ({ signal }) => fetchCompanies({ signal }),
    staleTime: 5000,
  });

  const Companiesdata = Company?.Companies;
  const { mutateAsync } = useMutation({
    mutationFn: GetJobSearch,
    onSuccess: (data) => {
      const jobSearchResults = data?.result?.items;
      if (data && data.result && data.result.items.length > 0) {
        setJobSearch(data.result.items);
        navigation.navigate("SearchResults", {
          query: searchQuery,
          location,
          jobSearch: jobSearchResults,
        });
      }
      // else{
      //   navigation.navigate("SearchResults", {
      //     query: searchQuery,
      //     location,
      //     jobSearch: jobSearchResults,
      //   });
      // }
      queryClient.invalidateQueries({
        queryKey: ["JobSearch"],
        refetchType: "active",
      });
    },
    onError: () => {
      Alert.alert("Failed to Search");
    },
  });

  const handleNavigate = async () => {
    const searchDataArray = [
      // { jobTitle: searchQuery, pageSize: 1000 },
      // { companyName: searchQuery, pageSize:  1000  },
      // { skillSet: searchQuery, pageSize: 1000 },
      // { location: searchQuery, pageSize: 1000 },
      // { city: searchQuery, pageSize:  1000  },
      // { jobType: searchQuery, pageSize:  1000  },
      { keyword: searchQuery, pageSize: 1000 },
    ];

    for (const searchData of searchDataArray) {
      try {
        const result = await mutateAsync({ data: searchData });
        if (result?.result?.items?.length) {
          setJobSearch(result.result.items);
          break;
        }
      } catch (error) {
        console.error("Error during job search:", error);
      }
    }
  };

  // const handleSearch = () => {
  //   searchQuery.trim()
  //     ? debouncedNavigate()
  //     : Alert.alert("Please enter a search query");
  // };

  const handleLocationChange = async (newLocation: string) => {
    setLocation(newLocation);
    navigation.setParams({ location: newLocation });
  };

  const handleSearchLocation = async () => {
    const searchDataArray =
      location === "All"
        ? [{ pageSize: 9 }]
        : [
            // { city: location, pageSize:  1000 },
            // { location: location, pageSize:  1000  },
            { keyword: location, pageSize: 1000 },
          ];

    try {
      for (const searchData of searchDataArray) {
        const result = await mutateAsync({ data: searchData });
        if (result?.result?.items?.length) {
          setJobSearch(result.result.items);
          break;
        }
        navigation.setParams({ location: location });
      }
    } catch (error) {
      console.error("Error during job search:", error);
    }
    setOpen(false);
    navigation.navigate("SearchResults", { location: location });
  };

  const JobTitle = JobPostsdata?.map((name) => name.jobTitle);

  const flattenedArrayJobTitle = JobTitle?.flat();
  const uniqueArrayJobTitle = [...new Set(flattenedArrayJobTitle)];

  const JobTitleColums = uniqueArrayJobTitle;

  const fetchSuggestions = debounce((query: string) => {
    if (query.length > 0) {
      // Filter job titles
      const filteredJobs = JobTitleColums.filter((title) =>
        title.toLowerCase().includes(query.toLowerCase())
      );

      // Filter companies
      const filteredCompanies = Companiesdata?.filter((company: Company) =>
        company.companyName.toLowerCase().includes(query.toLowerCase())
      );

      // Combine results
      const combinedSuggestions: SearchSuggestion[] = [
        ...filteredJobs,
        ...(filteredCompanies || []),
      ];

      setSuggestions(combinedSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, 300);

  // const { data: CompanySearch } = useQuery({
  //   queryKey: ["CompanySearch", searchQuery],
  //   queryFn: ({ signal }) => SearchCompanyByName({ signal, name: searchQuery }),
  //   enabled: !!searchQuery,
  //   staleTime: 5000,
  // });

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    fetchSuggestions(text);
  };
  const { data: CompanySearch, error } = useQuery({
    queryKey: ["CompanySearch", searchQuery],
    queryFn: ({ signal }) => SearchCompanyByName({ signal, name: searchQuery }),
    enabled: !!searchQuery,
    staleTime: 5000,
  });
  const CompaniesSearch = CompanySearch?.Companies;
  const fetchCompanyDetails = async (companyName: string) => {
    try {
      const result = await SearchCompanyByName({ name: companyName });
      const companies = result?.Companies;
      if (companies) {
        navigation.navigate("CompanyDetail", { id: companies?.id });
      } else {
        Alert.alert("No company details found.");
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  };
  const handleSuggestionPress = async (suggestion: SearchSuggestion) => {
    if (typeof suggestion === "string") {
      setSearchQuery(suggestion);

      const searchDataArray = [{ keyword: suggestion, pageSize: 1000 }];

      for (const searchData of searchDataArray) {
        try {
          const result = await mutateAsync({ data: searchData });
          if (result?.result?.items?.length) {
            setJobSearch(result.result.items);
            break;
          }
        } catch (error) {
          console.error("Error during job search:", error);
        }
      }
    } else {
      setSearchQuery(suggestion.companyName);

      await fetchCompanyDetails(suggestion.companyName);
    }
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          accessible={true}
        >
          <Icon name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>
        <View style={styles.search}>
          <Icon
            name="search"
            size={16}
            color="black"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Type keyword to search."
            value={searchQuery}
            // onChangeText={(text) => {
            //   setSearchQuery(text);
            //   // debouncedNavigate();
            //   // handleNavigate();
            // }}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleNavigate}
          />
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setOpen((prev) => !prev)}
        >
          <Icon name="tune" size={30} color="#fff" />
        </TouchableOpacity>
        {/* <LocationModal
          modalVisible={open}
          setModalVisible={setOpen}
          navigation={navigation}
          location={location}
          setLocation={handleLocationChange}
          onPress={handleSearchLocation}
        /> */}
        <FilterModal
          navigation={navigation}
          modalVisible={open}
          filteredJobs={JobPostsdata}
          onPress={handleSearchLocation}
          setModalVisible={setOpen}
          setJobSearch={setJobSearch}
        />
      </View>
      {/* <View style={styles.suggestionsContainer}> */}
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(item)}
              >
                <Text style={styles.suggestionText}>
                  {typeof item === "string" ? item : item.companyName}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      {/* </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FF4500",
    paddingTop: 30,
    paddingBottom: 1,
    paddingHorizontal: 10,
    elevation: 4,
    height: 90,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {},
  search: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    height: 40,
    width: 300,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  suggestionsContainer: {
    backgroundColor: "#FFF",
    // marginTop: 20,
    top: 90,
    // left:10,
    //   left:0,
    //  right:0,
    marginLeft: 10,
    width: "100%",
    position: "absolute",
    borderRadius: 8,
    elevation: 4,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  suggestionText: {
    fontSize: 16,
  },
});
