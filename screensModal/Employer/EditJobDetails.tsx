import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  Checkbox,
  TextInput as PaperInput,
  Provider,
} from "react-native-paper";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { storage } from "../../firebase/config"; // Your Firebase config file
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid"; // Use UUID for unique file names
import { Picker } from "@react-native-picker/picker";
import { PostJobType } from "../../Services/JobTypeService/PostJobType";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../Services/mainService";
import { GetJobType } from "../../Services/JobTypeService/GetJobType";
import Icon from "react-native-vector-icons/MaterialIcons";
import { DeleteJobType } from "../../Services/JobTypeService/DeleteJobType";
import { GetSkillSets } from "../../Services/SkillSet/GetSkillSet";
import { PostSkillSets } from "../../Services/SkillSet/PostSkillSet";
import { DeleteSkillSet } from "../../Services/SkillSet/DeleteSkillSet";
import { PostJobPosts } from "../../Services/JobsPost/PostJobPosts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetJobPostById } from "../../Services/JobsPost/GetJobPostById";
import { PutJobPost } from "../../Services/JobsPost/PutJobPost";
import MultiSelect from "react-native-multiple-select";
import { GetBenefits } from "../../Services/Benefits/GetBenefits";

interface SkillSet {
  id: number;
  name: string;
  shorthand: string;
  description: string;
}
interface Benefits {
  id: number;
  name: string;
  // shorthand: string;
  // description: string;
}

const dataType = ["Full Time", "Part Time", "Remote"];

export default function EditJobDetails({ route, navigation }: any) {
  const [title, setTitle] = useState("");
  const { jobId } = route.params;

  const { data: jobData } = useQuery({
    queryKey: ["Job-details", jobId],
    queryFn: ({ signal }) => GetJobPostById({ id: Number(jobId), signal }),
    enabled: !!jobId,
  });
  const job = jobData?.JobPosts;

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [count, setCount] = useState(1);
  const [skills, setSkills] = useState<SkillSet[]>([]);
  const [benefitsData, setBenefitData] = useState<Benefits[]>([]);
  const [inputSkill, setInputSkill] = useState("");
  const [salary, setSalary] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirement] = useState("");
  const [benefits, setBenefits] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [jobType, setJobType] = useState<number>();
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);

  // For Skill Modal
  const [openSkillModal, setOpenSkillModal] = useState<boolean>(false);
  const [skillName, setSkillName] = useState("");
  const [skillShorthand, setSkillShorthand] = useState("");
  const [skillDescription, setSkillDescription] = useState("");

  const [jobTypeName, setJobTypeName] = useState<string>("");
  const [jobTypeDescription, setJobTypeDescription] = useState<string>("");
  const [SkillSet, setSkillSet] = useState<number | null>(null);

  const [UserId, setUserId] = useState<string | null>(null);
  const [Auth, setAuth] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setTitle(job.jobTitle || "");
      setDescription(job.jobDescription || "");
      setSalary(job?.salary ? job.salary.toString() : "0");

      setCount(job.experienceRequired || 1);
      setRequirement(job.qualificationRequired || "");
      setBenefits(job.benefits || "");
      //   setSkillLevel(job.skillLevelRequired || 0);
      setFileUrl(job.imageURL || "");
      setSkills(job.skillSetObjects || []);
      setBenefitData(job.benefitObjects || []);
      console.log("skill", job.skillSets);

      if (job.expiryDate) {
        setSelectedDate(new Date(job.expiryDate));
      }
    }
  }, [job]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedItemsBenefit, setSelectedItemsBenefit] = useState<number[]>(
    []
  );
  const onSelectedItemsChange = (selected: number[]) => {
    setSelectedItems(selected);
  };
  const onSelectedItemsChangeBenefit = (selected: number[]) => {
    setSelectedItemsBenefit(selected);
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      const Auth = await AsyncStorage.getItem("Auth");
      const CompanyId = await AsyncStorage.getItem("CompanyId");
      setAuth(Auth);
      setUserId(id);
      setCompanyId(CompanyId);
    };

    fetchUserId();
  }, []);

  const handleFileChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFileUrl(result.assets[0].uri);

      try {
        const fileName = `${uuidv4()}.jpg`;
        const fileRef = ref(storage, fileName);
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        await uploadBytes(fileRef, blob);
        const firebaseFileUrl = await getDownloadURL(fileRef);
        setFileUrl(firebaseFileUrl);
      } catch (error) {
        console.error("Error uploading file:", error);
        Alert.alert(
          "Upload Failed",
          "There was an error uploading the file. Please try again."
        );
      }
    }
  };

  const handleAddJobType = () => {
    setOpenModal(true);
  };

  const { mutate: JobType, isPending: PedingJobtype } = useMutation({
    mutationFn: PostJobType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["JobType"] });
      Alert.alert("Job type created successfully.");
      //   setNameJobtype("");
      //   setTypeDescription("");
      setOpenModal(false);
    },
    onError: () => {
      Alert.alert("Failed to create job type.");
    },
  });

  const { mutate: deleteJobType } = useMutation({
    mutationFn: DeleteJobType,
    onSuccess: () => {
      // Invalidate and refetch the cache to ensure the UI is updated immediately
      queryClient.invalidateQueries({
        queryKey: ["JobType"],
        refetchType: "active", // Ensure an active refetch
      });
      Alert.alert("JobType Details Deleted Successfully");
      // setDeletingId(null);
    },
    onError: () => {
      Alert.alert("Failed to delete the Job Types");
    },
  });

  const handleDeleteJobType = (id: number) => {
    deleteJobType({ id: id });
  };

  const { data: JobTypedata } = useQuery({
    queryKey: ["JobType"],
    queryFn: ({ signal }) => GetJobType({ signal }),
    staleTime: 5000,
  });

  const JobTypeDatas = JobTypedata?.JobTypes;

  const handleSaveJobType = () => {
    if (!jobTypeName || !jobTypeDescription) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    const jobTypeData = {
      name: jobTypeName,
      description: jobTypeDescription,
    };

    JobType({
      data: { name: jobTypeData.name, description: jobTypeData.description },
    });

    console.log("Job Type Data:", jobTypeData);

    setOpenModal(false);
    setJobTypeName("");
    setJobTypeDescription("");
  };

  const { mutate: createSkillSet, isPending: isLoadingSkillSet } = useMutation({
    mutationFn: PostSkillSets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["SkillSet"] });
      Alert.alert("Skill set created successfully.");
      setOpenSkillModal(false);
    },
    onError: () => {
      Alert.alert("Failed to create skill set.");
    },
  });

  const handleSkillSelect = (id: number) => {
    if (selectedSkills.includes(id)) {
      setSelectedSkills(selectedSkills.filter((skillId) => skillId !== id));
    } else {
      setSelectedSkills([...selectedSkills, id]);
    }
  };

  const handleSaveSkill = () => {
    if (!skillName || !skillShorthand || !skillDescription) {
      Alert.alert("Error", "Please fill out all fields for the skill");
      return;
    }

    const skillData = {
      name: skillName,
      shorthand: skillShorthand,
      description: skillDescription,
    };

    createSkillSet({
      data: {
        name: skillData.name,
        shorthand: skillData.shorthand,
        description: skillData.description,
      },
    });

    // Post skillData to your API
    console.log("Skill Data:", skillData);

    setOpenSkillModal(false);
    setSkillName("");
    setSkillShorthand("");
    setSkillDescription("");
  };

  const { mutate: deleteSkillSet } = useMutation({
    mutationFn: DeleteSkillSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["SkillSet"] });
      Alert.alert("Skill set deleted successfully.");
    },
    onError: () => {
      Alert.alert("Failed to delete skill set.");
    },
  });

  const handledeleteSkillSet = (Id: number) => {
    deleteSkillSet({ id: Id });
  };

  const { data: SkillSetdata } = useQuery({
    queryKey: ["SkillSet"],
    queryFn: ({ signal }) => GetSkillSets({ signal }),
    staleTime: 5000,
  });
  const SkillSetdataa = SkillSetdata?.SkillSets;

  const { data: Benefitdata } = useQuery({
    queryKey: ["Benefits"],
    queryFn: ({ signal }) => GetBenefits({ signal }),
    staleTime: 5000,
  });
  const Benefitdataa = Benefitdata?.Benefits;
  const { mutate: JobPost, isPending: PostPending } = useMutation({
    mutationFn: PutJobPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["JobPosts"] });
      queryClient.invalidateQueries({ queryKey: ["Job-details"] });
      queryClient.invalidateQueries({
        queryKey: ["JobSearch"],
        refetchType: "active",
      });
      Alert.alert("Update Job successfully.");
      navigation.navigate("Recruitment");
    },
    onError: () => {
      Alert.alert("Failed to Update the job.");
    },
  });
  //   const handleSubmit = async () => {
  //     const newJobData = {
  //       jobtitle: title || job?.jobTitle,
  //       jobDescription: description || job?.jobDescription,
  //       salary: salary ? parseFloat(salary) : job?.salary ?? 0,
  //       experienceRequired: count || job?.experienceRequired,
  //       qualificationRequired: requirements || job?.qualificationRequired,
  //       benefits:benefits || job?.benefits,
  //     //   skillLevelRequired:  skillLevel ?? job?.skillLevelRequired ?? 0,
  //       jobTypeId: jobType ?? job?.jobType.id ??0,
  //       imageURL: fileUrl,
  //       expiryDate: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
  //       skillSetIds: selectedSkills,

  //       userId: Number(UserId),
  //       companyId: Number(companyId),
  //     };
  //     // const cleanedData = Object.fromEntries(
  //     //     Object.entries(newJobData).filter(([_, value]) => value !== undefined)
  //     //   );

  //     await JobPost({
  //         data: newJobData,
  //         id: Number(jobId),
  //       });
  //     console.log("Job data to submit:", newJobData);
  //   };

  const handleSubmit = async () => {
    // Construct the newJobData object

    if (selectedDate && new Date(selectedDate) <= new Date()) {
      alert("The expiry date must be a future date.");
      return;
    }
    if (parseInt(salary) === 0) {
      alert("Salary must be more than 0");
      return;
    }
    const newJobData = {
      jobtitle: title || job?.jobTitle,
      jobDescription: description || job?.jobDescription,
      salary: salary ? parseFloat(salary) : job?.salary ?? 0, // Salary as number
      experienceRequired: count || job?.experienceRequired,
      qualificationRequired: requirements || job?.qualificationRequired,
      benefits: benefits || job?.benefits,
      jobTypeId: jobType ?? job?.jobType?.id ?? 0,
      imageURL: fileUrl,
      expiryDate: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
      // skillSetIds: selectedSkills,
      skillSetIds:
        selectedItems.length > 0
          ? selectedItems
          : skills.map((item) => item.id),
      benefitIds:
        selectedItemsBenefit.length > 0
          ? selectedItemsBenefit
          : benefitsData.map((item) => item.id),
      userId: Number(UserId),
      companyId: Number(companyId),
    };

    // Filter out undefined values
    const cleanedJobData = Object.fromEntries(
      Object.entries(newJobData).filter(([_, value]) => value !== undefined)
    );

    await JobPost({
      data: cleanedJobData, // Use the cleaned object
      id: Number(jobId),
    });

    console.log("Job data to submit:", cleanedJobData);
  };
  return (
    <Provider>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
            Recruitment Post
          </Text>

          {/* Job Title */}
          <PaperInput
            label="Job Title"
            mode="outlined"
            value={title}
            onChangeText={setTitle}
            style={{ marginBottom: 16 }}
          />

          {/* Application Deadline */}
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
            Application Deadline
          </Text>
          <TouchableOpacity
            onPress={() =>
              DateTimePickerAndroid.open({
                value: selectedDate || new Date(),
                onChange: (event, date) => {
                  if (date) setSelectedDate(date);
                },
                mode: "date",
                is24Hour: true,
              })
            }
            style={{ marginBottom: 16 }}
          >
            <TextInput
              value={
                selectedDate ? selectedDate.toLocaleDateString("en-GB") : ""
              }
              placeholder="Select date"
              editable={false}
              style={styles.input}
            />
          </TouchableOpacity>

          {/* Experience Required */}
          <View style={styles.row}>
            <Text style={{ fontWeight: "bold", flex: 1 }}>
              Experience Required
            </Text>
            <TouchableOpacity onPress={() => setCount(Math.max(1, count - 1))}>
              <Text>-</Text>
            </TouchableOpacity>
            <Text style={{ marginHorizontal: 8 }}>{count}</Text>
            <TouchableOpacity onPress={() => setCount(count + 1)}>
              <Text>+</Text>
            </TouchableOpacity>
          </View>

          {/* Salary */}
          <PaperInput
            label="Salary"
            mode="outlined"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            style={{ marginBottom: 16 }}
          />

          {/* Skill Level Required */}
          {/* <PaperInput
            label="Skill Level Required"
            mode="outlined"
            value={skillLevel}
            onChangeText={setSkillLevel}
            keyboardType="numeric"
            style={{ marginBottom: 16 }}
          /> */}
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
            Job Location cities:
          </Text>
          <View
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 4,
            }}
          >
            {job?.jobLocationCities.map((item, index) => (
              <Text key={index}>
                {item}
                {index < job.jobLocationCities.length - 1 ? ", " : ""}
              </Text>
            ))}
          </View>
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
            Job Location Address:
          </Text>
          <View
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 4,
            }}
          >
            {job?.jobLocationAddressDetail.map((item, index) => (
              <Text key={index}>
                {item}
                {index < job.jobLocationAddressDetail.length - 1 ? ", " : ""}
              </Text>
            ))}
          </View>
          {/* Job Type */}
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Job Type</Text>

          {/* Add Job Type Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleAddJobType}
          >
            <Text style={styles.saveButtonText}>Add Job Type</Text>
          </TouchableOpacity>

          {JobTypeDatas?.map((type) => (
            <TouchableOpacity
              key={type.id}
              onPress={() => setJobType(type.id)}
              style={styles.row}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Checkbox
                  status={jobType === type.id ? "checked" : "unchecked"}
                />
                <Text>{type.name}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteJobType(type.id)}>
                {/* Using MaterialIcons for trash icon */}
                <Icon name="delete" size={24} color="red" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Description */}
          <PaperInput
            label="Description"
            mode="outlined"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            style={{ marginBottom: 16 }}
          />

          {/* Requirement for Candidates */}
          <PaperInput
            label="Requirement for Candidates"
            mode="outlined"
            multiline
            numberOfLines={4}
            value={requirements}
            onChangeText={setRequirement}
            style={{ marginBottom: 16 }}
          />

          {/* Benefits */}
          <PaperInput
            label="Benefits"
            mode="outlined"
            multiline
            numberOfLines={4}
            value={benefits}
            onChangeText={setBenefits}
            style={{ marginBottom: 16 }}
          />

          {/* Add Image */}
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
            Featured Image
          </Text>
          <TouchableOpacity
            onPress={handleFileChange}
            style={{ marginBottom: 16, alignItems: "center" }}
          >
            {fileUrl ? (
              <Image
                source={{ uri: fileUrl }}
                style={{ width: 100, height: 100 }}
              />
            ) : (
              <Text>Pick an image</Text>
            )}
          </TouchableOpacity>

          {/* Add Skill Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => setOpenSkillModal(true)}
          >
            <Text style={styles.saveButtonText}>Add Skill</Text>
          </TouchableOpacity>

          {/* {SkillSetdataa?.map((type) => (
            <View
              key={type.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginVertical: 8,skillSetIds
              }}
            >
              <TouchableOpacity
                onPress={() => handleSkillSelect(type.id)}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Checkbox
                  status={
                    selectedSkills.includes(type.id) ? "checked" : "unchecked"
                  }
                />
                <Text>{type.name}</Text>
              </TouchableOpacity>

             
              <TouchableOpacity onPress={() => handledeleteSkillSet(type.id)}>
                <Icon name="delete" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))} */}
          <View style={styles.containerne}>
            <Text style={styles.label}>Select Skills:</Text>
            <MultiSelect
              items={SkillSetdataa || []}
              uniqueKey="id"
              onSelectedItemsChange={onSelectedItemsChange}
              selectedItems={
                selectedItems.length > 0
                  ? selectedItems
                  : skills.map((item) => item.id)
              }
              selectText="Pick Items"
              searchInputPlaceholderText="Search Skills..."
              onChangeInput={(text) => console.log(text)}
              tagRemoveIconColor="#ff0000"
              tagBorderColor="#ccc"
              tagTextColor="#000"
              selectedItemTextColor="#007bff"
              selectedItemIconColor="#007bff"
              itemTextColor="#000"
              displayKey="name" // Property name for display
              searchInputStyle={{ color: "#000" }}
              submitButtonColor="#007bff" // Submit button color
              submitButtonText="Submit"
            />
          </View>

          <View style={styles.containerne}>
            <Text style={styles.label}>Select Benefits:</Text>
            <MultiSelect
              items={Benefitdataa || []}
              uniqueKey="id"
              onSelectedItemsChange={onSelectedItemsChangeBenefit}
              selectedItems={
                selectedItemsBenefit.length > 0
                  ? selectedItemsBenefit
                  : benefitsData.map((item) => item.id)
              }
              selectText="Pick Items"
              searchInputPlaceholderText="Search Benefits..."
              onChangeInput={(text) => console.log(text)}
              tagRemoveIconColor="#ff0000"
              tagBorderColor="#ccc"
              tagTextColor="#000"
              selectedItemTextColor="#007bff"
              selectedItemIconColor="#007bff"
              itemTextColor="#000"
              displayKey="name" // Property name for display
              searchInputStyle={{ color: "#000" }}
              submitButtonColor="#007bff" // Submit button color
              submitButtonText="Submit"
            />
          </View>
        </ScrollView>

        {/* Job Type Modal */}
        <Modal
          visible={openModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setOpenModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add Job Type</Text>

              <TextInput
                style={styles.inputmodal}
                placeholder="Job Type Name"
                value={jobTypeName}
                onChangeText={setJobTypeName}
              />

              <TextInput
                style={styles.inputmodal}
                placeholder="Job Type Description"
                value={jobTypeDescription}
                onChangeText={setJobTypeDescription}
              />

              <TouchableOpacity
                onPress={handleSaveJobType}
                style={styles.saveButtonn}
              >
                <Text style={styles.saveButtonTextt}>Save</Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => setOpenModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Skill Modal */}
        <Modal
          visible={openSkillModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setOpenSkillModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add Skill</Text>

              <TextInput
                style={styles.inputmodal}
                placeholder="Skill Name"
                value={skillName}
                onChangeText={setSkillName}
              />

              <TextInput
                style={styles.inputmodal}
                placeholder="Skill Shorthand"
                value={skillShorthand}
                onChangeText={setSkillShorthand}
              />

              <TextInput
                style={styles.inputmodal}
                placeholder="Skill Description"
                value={skillDescription}
                onChangeText={setSkillDescription}
              />

              <TouchableOpacity
                onPress={handleSaveSkill}
                style={styles.saveButtonn}
              >
                <Text style={styles.saveButtonTextt}>Save</Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => setOpenSkillModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Submit Button */}
        <View style={styles.bottomContainer}>
          {PostPending ? (
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Wait a seconds</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveButtonText}>Update</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  formContainer: {
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  saveButton: {
    backgroundColor: "#ff4500",
    borderRadius: 5,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    width: "85%",
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#444",
  },
  inputmodal: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },
  saveButtonn: {
    backgroundColor: "#FF6F61",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  saveButtonTextt: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#FF6F61",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FF6F61",
    fontWeight: "bold",
    fontSize: 16,
  },
  containerne: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
