import React, { useEffect, useState } from "react";
import {
  View,
  Modal,
  ScrollView,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Slider from "@react-native-community/slider"; // Ensure this is installed for native slider compatibility
import MultiSelect from "react-native-multiple-select";
import { queryClient } from "../Services/mainService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetJobSearch } from "../Services/JobSearchService/JobSearchService";
import { fetchCompanies } from "../Services/CompanyService/GetCompanies";
import { GetSkillSets } from "../Services/SkillSet/GetSkillSet";
import { JobSearchQuery } from "../Services/JobSearchService/JobSearchQuery";
import { Picker } from "@react-native-picker/picker";
import { GetBenefits } from "../Services/Benefits/GetBenefits";
const { width, height } = Dimensions.get("window");

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
interface SearchData {
  jobTitle?: string;
  companyNames?: string[];
  companyName?: string;
  skillSet?: string;
  skillSets?: string[];
  city?: string;
  cities?: string[];
  location?: string;
  locations?: string;
  experience?: number;
  jobType?: string;
  jobTypes?: string[];
  pageSize: number;
  minSalary?: number;
  maxSalary?: number;
  benefits?: string[];
}

interface FilterModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  onPress: () => void;
  filteredJobs: JobPost[] | undefined;
  navigation: any;
  setJobSearch?: React.Dispatch<React.SetStateAction<JobPost[]>>;
}

const FilterModal: React.FC<FilterModalProps> = ({
  modalVisible,
  setModalVisible,
  onPress,
  filteredJobs,
  navigation,
  setJobSearch,
}) => {
  const [skills, setSkills] = useState<string[]>([]); // Example skills
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [experience, setExperience] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string[]>([]);
  const [location, setLocation] = useState<string>("");
  const [emailContent, setEmailContent] = useState("");
  //salary
  const JobSalary = filteredJobs?.map((salary) => salary.salary);
  const flattenedArraySalary = JobSalary?.flat();

  const uniqueArraySalary = [...new Set(flattenedArraySalary)];
  console.log("realyne", uniqueArraySalary);

  const SalaryJob = uniqueArraySalary;
  const maxSalaryJob = Math.max(...SalaryJob);
  const [salary, setSalary] = useState<[number, number]>([500, maxSalaryJob]);
  //skills

  const { data: SkillSetData } = useQuery({
    queryKey: ["SkillSetDetails"],
    queryFn: ({ signal }) => GetSkillSets({ signal: signal }),
    staleTime: 1000,
  });

  const SkillSetDatas = SkillSetData?.SkillSets;

  // const skillss = filteredJobs?.map((skill) => skill.skillSets);
  const skillss = SkillSetDatas?.map((skill) => skill.name);
  const flattenedArray = skillss?.flat();
  const uniqueArray = [...new Set(flattenedArray)];
  console.log("realy", uniqueArray);

  const skillsColumns = uniqueArray;

  //benefits

  const { data: Benefitdata } = useQuery({
    queryKey: ["Benefits"],
    queryFn: ({ signal }) => GetBenefits({ signal: signal }),
    staleTime: 1000,
  });

  const BenefitDatas = Benefitdata?.Benefits;

  const benefits = BenefitDatas?.map((skill) => skill.name);
  const flattenedArrayBenefits = benefits?.flat();
  const uniqueArrayBenefits = [...new Set(flattenedArrayBenefits)];
  console.log("realy", uniqueArray);

  const BenefitColumns = uniqueArrayBenefits;

  //Jobtype
  const Jobtype = filteredJobs?.map((type) => type.jobType.name);
  const flattenedArrayType = Jobtype?.flat();
  const uniqueArrayType = [...new Set(flattenedArrayType)];
  console.log("realy", uniqueArrayType);

  const TypeJob = uniqueArrayType;

  const JobExp = filteredJobs?.map((exp) => exp.experienceRequired);
  const flattenedArrayExp = JobExp?.flat();
  const uniqueArrayExp = [...new Set(flattenedArrayExp)];
  console.log("realyne", uniqueArrayExp);

  const ExpJob = uniqueArrayExp;

  //companyname

  const {
    data: Company,
    // isLoading: isCompanyLoading,
    // isError: isCompanyError,
  } = useQuery({
    queryKey: ["Company"],
    queryFn: ({ signal }) => fetchCompanies({ signal: signal }),
    staleTime: 5000,
  });
  const Companiesdata = Company?.Companies;
  // const CompanyName = filteredJobs?.map((name) => name.companyName);
  const CompanyName = Companiesdata?.map((name) => name.companyName);

  const flattenedArrayCompanyName = CompanyName?.flat();
  const uniqueArrayCompanyName = [...new Set(flattenedArrayCompanyName)];
  console.log("realy1", CompanyName);

  const CompanyColums = uniqueArrayCompanyName;
  const datacities = [
    "HO CHI MINH",
    "HA NOI",
    "DA NANG",
    "HAI PHONG",
    "CAN THO",
    "NHA TRANG",
  ];

  const handleSkillSelect = (skill: string) => {
    setSelectedSkill((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleTypeSelect = (type: string) => {
    setSelectedJobType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleExperienceSelect = (exp: number) => {
    setExperience((prev) => (prev === exp ? null : exp));
  };
  const [minSalary, setMinSalary] = useState<number>(500);
  const [maxSalary, setMaxSalary] = useState<number>(10000);
  const handleSalaryChange = (value: number, index: number) => {
    const newSalary = [...salary] as [number, number];
    newSalary[index] = value;
    setSalary(newSalary);
  };
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const onSelectedItemsChange = (selectedItems: string[]) => {
    setSelectedLocations(selectedItems);
  };

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const onSelectedItemsChangeCompanies = (selectedItems: string[]) => {
    setSelectedCompanies(selectedItems);
  };

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const onSelectedItemsChangeSkills = (selectedItems: string[]) => {
    setSelectedSkills(selectedItems);
  };

  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const onSelectedItemsChangeBenefits = (selectedItems: string[]) => {
    setSelectedBenefits(selectedItems);
  };
  const [searchDataArray, setSearchDataArray] = useState<SearchData[]>([]);
  const [activeTab, setActiveTab] = useState<"find" | "create">("find");
  useEffect(() => {
    const newSearchDataArray: SearchData[] = [];

    // Build the search object conditionally
    const searchObject: SearchData = {
      pageSize: 1000,
      minSalary: salary[0],
      maxSalary: salary[1],
    };

    if (selectedSkills.length > 0) {
      searchObject.skillSets = selectedSkills;
    }
    if (selectedBenefits.length > 0) {
      searchObject.benefits = selectedBenefits;
    }

    if (selectedJobType.length > 0) {
      searchObject.jobTypes = selectedJobType;
    }
    if (experience) {
      searchObject.experience = experience;
    }
    if (selectedCompanies.length > 0) {
      searchObject.companyNames = selectedCompanies;
    }
    if (selectedLocations.length > 0) {
      searchObject.cities = selectedLocations;
    }
    // Push to newSearchDataArray only if at least one filter is selected
    if (
      selectedSkills ||
      selectedJobType ||
      selectedCompany ||
      selectedBenefits ||
      experience ||
      selectedLocations
    ) {
      newSearchDataArray.push(searchObject);
    }

    setSearchDataArray(newSearchDataArray);
  }, [
    selectedSkills,
    selectedBenefits,
    selectedJobType,
    // minSalary,
    // maxSalary,
    selectedCompanies,
    experience,
    selectedLocations,
  ]);
  const { mutate, isPending: SearchPending } = useMutation({
    mutationFn: JobSearchQuery,
    onSuccess: (data) => {
      console.log("Search result:", data);

      if (data && data.result && data.result.length > 0) {
        const jobSearchResults = data.result;
        setJobSearch?.(data.result);
        navigation.navigate("SearchResults", {
          // query: searchQuery,
          // location,
          jobSearch: jobSearchResults,
        });
        setModalVisible(false);
      }
      // setSearchOpen(false);

      // navigate("/it-jobs",{state : text});
    },
    onError: () => {
      Alert.alert("Failed to Search");
    },
  });

  const handleSearch = () => {
    mutate({
      data: {
        query: emailContent,
      },
    });
  };

  const { mutateAsync, isPending } = useMutation({
    mutationFn: GetJobSearch,
    onSuccess: (data) => {
      console.log("Search result:", data);

      if (data && data.result && data.result.items.length > 0) {
        const jobSearchResults = data.result.items;
        setJobSearch?.(data.result.items);
        navigation.navigate("SearchResults", {
          // query: searchQuery,
          // location,
          jobSearch: jobSearchResults,
        });
        setModalVisible(false);
      }
      //   else {
      //     navigate("/it_jobs", { state: { jobSearch: [] } });
      //     onDone?.();
      //   }

      queryClient.invalidateQueries({
        queryKey: ["JobSearch"],
        refetchType: "active",
      });

      // navigate("/it-jobs",{state : text});
    },
    onError: () => {
      Alert.alert("Failed to Search");
    },
  });

  const handleNavigateJob = async () => {
    try {
      for (let i = 0; i < searchDataArray.length; i++) {
        const result = await mutateAsync({
          data: searchDataArray[i],
        });

        if (result && result.result && result.result.items.length > 0) {
          setJobSearch?.(result.result.items);
          navigation.navigate("SearchResults", {
            // query: searchQuery,
            // location,
            jobSearch: result.result.items,
          });
          break;
        }
      }
    } catch (error) {
      console.error("Error during job search:", error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "find" && styles.activeTab]}
              onPress={() => setActiveTab("find")}
            >
              {/* <FontAwesome
            name="search"
            size={20}
            color={activeTab === "find" ? "#FF7F7F" : "#888"}
          /> */}
              <Text
                style={
                  activeTab === "find" ? styles.activeTabText : styles.tabText
                }
              >
                Advanced Filter
              </Text>
            </TouchableOpacity>
          </View>
          {/* <Text style={styles.modalTitle}>Advanced Filter</Text> */}
          {activeTab === "find" ? (
            <ScrollView contentContainerStyle={styles.scrollView}>
              <Text style={styles.sectionTitle}>Skills</Text>
              {/* <View style={styles.filterContainer}>
              {skillsColumns.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.filterButton,
                    selectedSkill.includes(skill) && styles.selectedButton,
                  ]}
                  onPress={() => handleSkillSelect(skill)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedSkill.includes(skill) && styles.selectedText,
                    ]}
                  >
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View> */}
              <MultiSelect
                items={skillsColumns.map((skills) => ({
                  id: skills,
                  name: skills,
                }))}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChangeSkills}
                selectedItems={selectedSkills}
                selectText="Select Skill(s)"
                searchInputPlaceholderText="Search Skills Name..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: "#CCC" }}
                submitButtonColor="#FF4500"
                submitButtonText="Select"
              />
              <Text style={styles.sectionTitle}>Benefits</Text>
              <MultiSelect
                items={BenefitColumns.map((skills) => ({
                  id: skills,
                  name: skills,
                }))}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChangeBenefits}
                selectedItems={selectedBenefits}
                selectText="Select Benefit(s)"
                searchInputPlaceholderText="Search Benefits Name..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: "#CCC" }}
                submitButtonColor="#FF4500"
                submitButtonText="Select"
              />

              <Text style={styles.sectionTitle}>Job Type</Text>
              <View style={styles.filterContainer}>
                {TypeJob.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      selectedJobType.includes(type) && styles.selectedButton,
                    ]}
                    onPress={() => handleTypeSelect(type)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selectedJobType.includes(type) && styles.selectedText,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* <Text style={styles.sectionTitle}>Salary Range</Text>
              <View style={styles.sliderContainer}>
                <Text>Min Salary: ${salary[0]}</Text>
                <Text>Max Salary: ${salary[1]}</Text>
                <Slider
                  minimumValue={500}
                  maximumValue={maxSalaryJob}
                  step={100}
                  onValueChange={(value) => handleSalaryChange(value, 0)}
                  value={salary[0]}
                  style={styles.slider}
                />
                <Slider
                  minimumValue={500}
                  maximumValue={maxSalaryJob}
                  step={100}
                  onValueChange={(value) => handleSalaryChange(value, 1)}
                  value={salary[1]}
                  style={styles.slider}
                />
              </View> */}

              {/* <Text style={styles.sectionTitle}>Experience</Text>
              <Picker
                selectedValue={experience}
                onValueChange={(value) =>
                  handleExperienceSelect(value as number)
                }
                style={pickerSelectStyles.inputPicker}
              >
                <Picker.Item label="Select Experience" value={null} />
                {[...Array(11).keys()].map((year) => (
                  <Picker.Item
                    key={year}
                    label={`${year}+ years`}
                    value={year}
                  />
                ))}
              </Picker> */}

              <Text style={styles.sectionTitle}>Location</Text>
              {/* <RNPickerSelect
              onValueChange={(value) => setLocation(value)}
              items={datacities.map((city) => ({
                label: city,
                value: city,
              }))}
              placeholder={{ label: "Select Location", value: null }}
              style={pickerSelectStyles}
            /> */}
              <MultiSelect
                items={datacities.map((city) => ({ id: city, name: city }))}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChange}
                selectedItems={selectedLocations}
                selectText="Select Location(s)"
                searchInputPlaceholderText="Search Locations..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: "#CCC" }}
                submitButtonColor="#FF4500"
                submitButtonText="Select"
              />

              <Text style={styles.sectionTitle}>Company Name</Text>
              {/* <RNPickerSelect
              onValueChange={(value) => setLocation(value)}
              items={datacities.map((city) => ({
                label: city,
                value: city,
              }))}
              placeholder={{ label: "Select Location", value: null }}
              style={pickerSelectStyles}
            /> */}
              <MultiSelect
                items={CompanyColums.map((city) => ({ id: city, name: city }))}
                uniqueKey="id"
                onSelectedItemsChange={onSelectedItemsChangeCompanies}
                selectedItems={selectedCompanies}
                selectText="Select Companies(s)"
                searchInputPlaceholderText="Search Companies Name..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: "#CCC" }}
                submitButtonColor="#FF4500"
                submitButtonText="Select"
              />
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollView}>
              <View>
                <Text style={styles.sectionTitle}>Enter Your description</Text>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Start writing your Description..."
                  multiline
                  value={emailContent}
                  onChangeText={setEmailContent}
                />
              </View>
            </ScrollView>
          )}

          {activeTab === "find" ? (
            <View style={styles.buttonContainer}>
              <Button
                title="Apply Filter"
                onPress={handleNavigateJob}
                color="#FF4500"
              />
              <Button
                title="Reset Filter"
                onPress={() => setModalVisible(false)}
                color="#777"
              />
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              {SearchPending ? (
                <Button
                  title="Wait a seconds"
                  // onPress={handleSearch}
                  color="#FF4500"
                />
              ) : (
                <Button
                  title="Advaned Search"
                  onPress={handleSearch}
                  color="#FF4500"
                />
              )}

              {/* <Button
                title="Reset Filter"
                onPress={() => setModalVisible(false)}
                color="#777"
              /> */}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: width * 0.9,
    maxHeight: height * 0.85,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 5,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ed1b2f",
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedButton: {
    backgroundColor: "#ed1b2f",
  },
  filterText: {
    color: "#ed1b2f",
    fontSize: 14,
  },
  selectedText: {
    color: "#fff",
  },
  sliderContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  slider: {
    width: "100%",
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#FF7F7F",
  },
  tabText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF7F7F",
    textAlign: "center",
  },
  emailInput: {
    height: 150,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    fontSize: 14,
    color: "#333",
  },
});


const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30,
    marginVertical: 5,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30,
    marginVertical: 5,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    marginVertical: 5,
    overflow: "hidden",
  },
  inputPicker: {
    fontSize: 16,
    height: 40,
    color: "black",
  },
});

export default FilterModal;
