import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetSkillSets } from "../Services/SkillSet/GetSkillSet";

import { GetJobType } from "../Services/JobTypeService/GetJobType";
import { GetUserJobAlertCriteria } from "../Services/UserJobAlertCriteriaService/GetUserJobAlertCriteria";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import AlertDataCard from "../components/AlertDataCard";
import { PostUserJobAlertCriteria } from "../Services/UserJobAlertCriteriaService/PostUserJobAlertCriteria ";
import { queryClient } from "../Services/mainService";
import { DeleteUserJobAlertCriteria } from "../Services/UserJobAlertCriteriaService/DeleteUserJobAlertCriteria";
interface SkillSet {
  id: number;
  name: string;
  shorthand: string;
  description: string;
}

const locationsData = [
  { City: "HO CHI MINH", Id: 1 },
  { City: "HA NOI", Id: 2 },
  { City: "DA NANG", Id: 3 },
  { City: "HAI PHONG", Id: 4 },
  { City: "CAN THO", Id: 5 },
  { City: "NHA TRANG", Id: 6 },
];

interface Location {
  Id: number;
  City: string;
}

interface JobType {
  id: number;
  name: string;
  description: string;
}

export default function JobAlert() {
  const [skills, setSkills] = useState("");
  const [selectSkills, setSelectSkills] = useState<SkillSet | null>(null);
  const [dropdownOpenSkills, setDropdownOpenSkills] = useState(false);
  const [SkillId, setSkillId] = useState<number | null>(null);

  const [filteredSkills, setFilteredSkills] = useState<SkillSet[]>([]);

  //location
  const [dropdownOpenLocation, setDropdownOpenLocation] =
    useState<boolean>(false);
  const [selectLocation, setSelectLocation] = useState<Location | null>(null);
  const [location, setLocation] = useState<string>("");
  const [filteredLocation, setFilteredLocation] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState<number | null>(null);

  //JobType
  const [dropdownOpenJobType, setDropdownOpenJobType] =
    useState<boolean>(false);
  const [selectJobType, setSelectJobType] = useState<JobType | null>(null);
  const [jobType, setJobType] = useState<string>("");
  const [filteredJobType, setFilteredJobType] = useState<JobType[] | undefined>(
    []
  );
  const [jobTypeId, setJobTypeId] = useState<number | null>(null);
  //user
  const [UserId, setUserId] = useState<string | null>(null);

  const fetchUserData = async () => {
    const id = await AsyncStorage.getItem("userId");
    const Auth = await AsyncStorage.getItem("Auth");
    // setAuth(Auth);
    setUserId(id);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  // Fetch skills data
  const { data: SkillSetdata } = useQuery({
    queryKey: ["SkillSet"],
    queryFn: ({ signal }) => GetSkillSets({ signal }),
    staleTime: 5000,
  });

  const skillsData = SkillSetdata?.SkillSets || [];

  const { data: JobTypedata } = useQuery({
    queryKey: ["JobType"],
    queryFn: ({ signal }) => GetJobType({ signal }),
    staleTime: 5000,
  });

  const JobTypeDatas = JobTypedata?.JobTypes;

  const handleSkillsInputChange = (text: string) => {
    setSkills(text);
    setSelectSkills(null);
    if (text) {
      const filtered = skillsData.filter((skill) =>
        skill.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSkills(filtered);
      setDropdownOpenSkills(filtered.length > 0);
    } else {
      setFilteredSkills([]);
      setDropdownOpenSkills(false);
    }
  };

  const handleChangeJobType = (text: string) => {
    setJobType(text);
    setSelectJobType(null);

    if (text) {
      setFilteredJobType(
        JobTypeDatas?.filter((comp) =>
          comp.name.toLowerCase().includes(text.toLowerCase())
        )
      );
      setDropdownOpenJobType(true);
    } else {
      setFilteredJobType([]);
      setDropdownOpenJobType(false);
    }
  };

  const handleChangeLocation = (text: string) => {
    setLocation(text);
    setSelectLocation(null);

    if (text) {
      setFilteredLocation(
        locationsData?.filter((comp) =>
          comp.City.toLowerCase().includes(text.toLowerCase())
        )
      );
      setDropdownOpenLocation(true);
    } else {
      setFilteredLocation([]);
      setDropdownOpenLocation(false);
    }
  };

  const handleSelectSkill = (item: SkillSet) => {
    setSelectSkills(item);
    setSkills(item.name);
    setDropdownOpenSkills(false);
    setSkillId(item.id);
  };

  const handleSelectLocation = (comp: Location) => {
    setLocationId(comp.Id);
    setSelectLocation(comp);
    setDropdownOpenLocation(false);
  };

  const handleSelectJobType = (comp: JobType) => {
    setJobTypeId(comp.id);
    setSelectJobType(comp);
    setDropdownOpenJobType(false);
  };

  const { mutate: PostAlert } = useMutation({
    mutationFn: PostUserJobAlertCriteria,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["UserJobAlertCriteria"],
        refetchType: "active", // Ensure an active refetch
      });
      Alert.alert("Subscribe");
    },

    onError: () => {
      Alert.alert("Failed to Alert .");
    },
  });

  const handleAlert = () => {
    if (!SkillId || !selectSkills?.name) {
      Alert.alert("Please select a valid skill ");
      return;
    }
    PostAlert({
      data: {
        jobTitle: selectSkills?.name,
        locationId: locationId,
        skillSetId: SkillId,
        userId: Number(UserId),
        jobTypeId: jobTypeId,
      },
    });
  };

  const { mutate: DeleteUserAlert } = useMutation({
    mutationFn: DeleteUserJobAlertCriteria,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["UserJobAlertCriteria"],
        refetchType: "active", // Ensure an active refetch
      });
      Alert.alert("UnSubscribe sucessfully");
    },

    onError: () => {
      Alert.alert("Failed to Alert .");
    },
  });
  const handleUnSubscide = (id: number) => {
    DeleteUserAlert({ id: Number(id) });
  };

  const { data: AlertDatane, refetch } = useQuery({
    queryKey: ["UserJobAlertCriteria", UserId],
    queryFn: ({ signal }) =>
      UserId ? GetUserJobAlertCriteria({ signal, id: Number(UserId) }) : null,
    staleTime: 1000,
    enabled: !!UserId,
  });
  const AlertData = AlertDatane?.Criteria;


  console.log("okchuane", AlertData);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.main}>
        <View style={styles.section}>
          <Text style={styles.heading}>Subscribe to Amazing Job</Text>
          <Text style={styles.description}>
            By subscribing, Amazing Job will suggest new jobs matching your
            skills.
          </Text>

          <View style={styles.inputContainer}>
            <Icon name="search" size={20} color="#A3A3A3" />
            <TextInput
              style={styles.input}
              placeholder="Skills, Job Title"
              value={selectSkills ? selectSkills.name : skills}
              aria-disabled={true}
              onChangeText={handleSkillsInputChange}
              onFocus={() => setDropdownOpenSkills(filteredSkills.length > 0)}
            />
          </View>

          {dropdownOpenSkills && (
            // <Modal
            //   transparent={true}
            //   visible={dropdownOpenSkills}
            //   animationType="fade"
            // >
            <TouchableWithoutFeedback
              onPress={() => setDropdownOpenSkills(false)}
            >
              <View>
                <View style={[styles.dropdown]}>
                  <FlatList
                    data={filteredSkills}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => handleSelectSkill(item)}>
                        <Text style={styles.dropdownItem}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
            // </Modal>
          )}

          <View style={styles.inputContainer}>
            <Icon name="place" size={20} color="#A3A3A3" />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={selectLocation ? selectLocation.City : location}
              aria-disabled={true}
              onChangeText={handleChangeLocation}
              onFocus={() =>
                setDropdownOpenLocation(filteredLocation.length > 0)
              }
            />
          </View>

          {dropdownOpenLocation && (
            // <Modal
            //   transparent={true}
            //   visible={dropdownOpenSkills}
            //   animationType="fade"
            // >
            <TouchableWithoutFeedback
              onPress={() => setDropdownOpenLocation(false)}
            >
              <View>
                <View style={[styles.dropdown]}>
                  <FlatList
                    data={filteredLocation}
                    keyExtractor={(item) => item.Id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleSelectLocation(item)}
                      >
                        <Text style={styles.dropdownItem}>{item.City}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
            // </Modal>
          )}

          <View style={styles.inputContainer}>
            <Icon name="work" size={20} color="#A3A3A3" />
            <TextInput
              style={styles.input}
              placeholder="Job Type"
              value={selectJobType ? selectJobType.name : jobType}
              aria-disabled={true}
              onChangeText={handleChangeJobType}
              onFocus={() =>
                setDropdownOpenJobType(
                  filteredJobType ? filteredJobType?.length > 0 : false
                )
              }
            />
          </View>

          {dropdownOpenJobType && (
            // <Modal
            //   transparent={true}
            //   visible={dropdownOpenSkills}
            //   animationType="fade"
            // >
            <TouchableWithoutFeedback
              onPress={() => setDropdownOpenJobType(false)}
            >
              <View>
                <View style={[styles.dropdown]}>
                  <FlatList
                    data={filteredJobType}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleSelectJobType(item)}
                      >
                        <Text style={styles.dropdownItem}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
            // </Modal>
          )}

          <TouchableOpacity style={styles.button} onPress={handleAlert}>
            <Text style={styles.buttonText}>Subscribe</Text>
          </TouchableOpacity>
          {/* <View style={styles.container}> */}
            <AlertDataCard data={AlertData} onDelete={handleUnSubscide} />
          {/* </View> */}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    marginVertical: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#777",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  dropdown: {
    backgroundColor: "#fff",
    // position: "absolute",
    maxHeight: 100,
    borderRadius: 8,
    padding: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    zIndex: 1000,
    // right:50
  },
  dropdownItem: {
    padding: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#ed1b2f",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
});
