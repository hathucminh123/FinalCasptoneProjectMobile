import React, { useState, useEffect, useCallback } from "react";
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
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import LocationModal from "../LocationModal";
import { StackNavigationProp } from "@react-navigation/stack";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetJobSearch } from "../../Services/JobSearchService/JobSearchService";
import { queryClient } from "../../Services/mainService";
import { useAppContext } from "../Employer/Context";
import LocationModall from "../LocationModall";
import debounce from "lodash/debounce";
import FilterModal from "../FilterModal";
import { GetJobPost } from "../../Services/JobsPost/GetJobPosts";
import { fetchCompanies } from "../../Services/CompanyService/GetCompanies";
import { SearchCompanyByName } from "../../Services/CompanyService/CompanySearchbyName";

type RootStackParamList = {
  Home: undefined;
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

interface JobType {
  id: number;
  name: string;
  description: string;
}
interface BusinessStream {
  id: number;
  businessStreamName: string;
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

// Define kiểu cho route prop
type SearchScreenRouteProp = RouteProp<RootStackParamList, "SearchResults">;
type SearchScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SearchResults",
  "CompanyDetail"
>;

interface props {
  setJobSearch: React.Dispatch<React.SetStateAction<JobPost[]>>;
  jobSearch: JobPost[] | undefined;
  navigation: any;
}

type SearchSuggestion = string | Company;

export default function SeacrHeaderr({ setJobSearch, jobSearch }: props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsCompany, setSuggestionsCompany] = useState<
    Company[] | undefined
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigation = useNavigation<SearchScreenNavigationProp>();

  // Lấy route với kiểu cụ thể
  const route = useRoute<SearchScreenRouteProp>();

  const query = route.params?.query || "";
  const filterLocation = route.params?.location || "";
  // const [jobSearch, setJobSearch] = useState<JobPost[]>();

  // const {jobSearch,setJobSearch}=useAppContext()

  const { mutateAsync } = useMutation({
    mutationFn: GetJobSearch,
    onSuccess: (data) => {
      console.log("Search result:", data);

      if (data && data.result && data.result.items.length > 0) {
        setJobSearch(data.result.items);
        const jobSearchResults = data.result.items;
        navigation.navigate("SearchResults", {
          query: searchQuery,
          location: location,
          jobSearch: jobSearch || [],
        });
      } else {
        navigation.navigate("SearchResults", {
          query: searchQuery,
          location: location,
          jobSearch: (jobSearch = []),
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["JobSearch"],
        refetchType: "active",
      });

      // navigate("/it-jobs");
      // navigation.navigate("SearchResults", { query: searchQuery ,location:location });
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
      jobTitle?: string;
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
      // { jobTitle: searchQuery, pageSize:  1000  },
      // { companyName: searchQuery, pageSize: 1000  },
      // { skillSet: searchQuery, pageSize: 1000  },
      // { location: searchQuery, pageSize:  1000  },
      // { city: searchQuery, pageSize:  1000  },
      { keyword: searchQuery, pageSize: 1000 },
      // { experience: searchQuery ,pageSize: 9},
      // { jobType: searchQuery, pageSize:  1000  },
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

  useEffect(() => {
    if (query || filterLocation) {
      setSearchQuery(query);
      setLocation(filterLocation);
    }
  }, [query]);

  // Cập nhật location và truyền nó vào SearchResults thông qua navigation.setParams()
  // const handleLocationChange = async (newLocation: string) => {
  //   setLocation(newLocation);

  //   interface JobSearchResponse {
  //     result: {
  //       items: JobPost[];
  //     };
  //   }

  //   interface SearchData {
  //     companyName?: string;
  //     skillSet?: string;
  //     city?: string;
  //     location?: string;
  //     // experience?: number;
  //     jobType?: string;
  //     pageSize: number;
  //   }

  //   let searchDataArray: SearchData[];
  //   if (newLocation === "All") {
  //     searchDataArray = [
  //       { companyName: "", pageSize: 9 },
  //       { skillSet: "", pageSize: 9 },
  //       { location: "", pageSize: 9 },
  //       { city: "", pageSize: 9 },
  //       // { experience: searchQuery ,pageSize: 9},
  //       { jobType: "", pageSize: 9 },
  //     ];
  //   } else {
  //     searchDataArray = [
  //       // { companyName: searchQuery ,pasize:9},
  //       // { skillSet: searchQuery,pageSize: 9 },
  //       // { location: searchQuery ,pageSize: 9 },
  //       { city: newLocation, pageSize: 9 },
  //       { location: newLocation, pageSize: 9 },
  //       // { experience: searchQuery ,pageSize: 9},
  //       // { jobType: searchQuery ,pageSize: 9},
  //     ];
  //   }

  //   for (let i = 0; i < searchDataArray.length; i++) {
  //     try {
  //       console.log("Searching with:", searchDataArray[i]);

  //       const result: JobSearchResponse = await mutateAsync({
  //         data: searchDataArray[i],
  //       });
  //       console.log("chan", result.result.items);

  //       if (result && result.result && result.result.items.length > 0) {
  //         setJobSearch(result.result.items);
  //         break;
  //       }
  //     } catch (error) {
  //       console.error("Error during job search:", error);
  //     }
  //   }

  //   navigation.setParams({ location: newLocation });
  // };
  const handleLocationChange = async (newLocation: string) => {
    setLocation(newLocation);
    navigation.setParams({ location: newLocation });
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
  const JobPostsdata = JobPosts?.JobPosts;

  const { data: Company } = useQuery({
    queryKey: ["Company"],
    queryFn: ({ signal }) => fetchCompanies({ signal }),
    staleTime: 5000,
  });

  const Companiesdata = Company?.Companies;
  const JobTitle = JobPostsdata?.map((name) => name.jobTitle);

  const flattenedArrayJobTitle = JobTitle?.flat();
  const uniqueArrayJobTitle = [...new Set(flattenedArrayJobTitle)];

  const JobTitleColums = uniqueArrayJobTitle;

  const fetchSuggestions = debounce((query: string) => {
    if (query.length === 0) return setShowSuggestions(false);
  
    const filteredJobs = JobTitleColums?.filter((title) =>
      title.toLowerCase().includes(query.toLowerCase())
    );
  
    const filteredCompanies = Companiesdata?.filter((company: Company) =>
      company.companyName.toLowerCase().includes(query.toLowerCase())
    );
  
    setSuggestions([...filteredJobs, ...(filteredCompanies || [])]);
    setShowSuggestions(true);
  }, 300);
  

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
  const debouncedNavigate = useCallback(
    debounce(handleNavigate, 500), // wait 500ms after the user stops typing
    [searchQuery, location]
  );

  const handleSearchLocation = async () => {
    const searchDataArray =
      location === "All"
        ? [{ pageSize: 9 }]
        : [
            // { city: location, pageSize:  1000  },
            // { location: location, pageSize: 1000  },
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

  const handleOpenModal = () => {
    setOpen((prev) => !prev);
  };
  console.log("ok chua ta wtf",showSuggestions)

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
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
            // onChangeText={setSearchQuery}
            onChangeText={handleSearchChange}
            // onSubmitEditing={handleNavigate}
            onSubmitEditing={debouncedNavigate}
          />
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={handleOpenModal}>
          <Icon name="tune" size={30} color="#fff" />
        </TouchableOpacity>

        {/* <LocationModal
          modalVisible={open}
          navigation={navigation}
          setModalVisible={setOpen}
          location={location}
          setLocation={handleLocationChange}
          onPress={handleSearchLocation}
        /> */}
        <FilterModal
          navigation={navigation}
          modalVisible={open}
          filteredJobs={jobSearch}
          onPress={handleSearchLocation}
          setModalVisible={setOpen}
          setJobSearch={setJobSearch}
        />
         
      </View>
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
    // height: 90,
    zIndex:1000,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    // padding: 10,
  },
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
  top:70,
  
    // left:10,
    //   left:0,
    //  right:0,
    marginLeft: 10,
    width: "100%",
  position:'absolute',
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
