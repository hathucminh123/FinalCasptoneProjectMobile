import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Modal,
} from "react-native";
import { queryClient } from "../Services/mainService";
import { PostSkillSets } from "../Services/SkillSet/PostSkillSet";
import { useMutation, useQuery } from "@tanstack/react-query";
import Icon from "react-native-vector-icons/MaterialIcons";
import { GetSkillSets } from "../Services/SkillSet/GetSkillSet";
import { DeleteSkillSet } from "../Services/SkillSet/DeleteSkillSet";
import { PostUserSkill } from "../Services/UserSkillService/PostUserSkill";
import AsyncStorage from "@react-native-async-storage/async-storage";
const levels = ["Excellent", "Intermediate", "Beginner"];

export default function Skills({ navigation }: any) {
  const [skillName, setSkillName] = useState<string>("");
  const [shorthand, setShorthand] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null); // Track a single selected skill
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: PostSkillSets,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["SkillSetDetails"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["UserProfile"],
        refetchType: "active",
      });

      setSkillName("");
      setShorthand("");
      setDescription("");
      Alert.alert("SkillSet Details Updated Successfully");
    },
    onError: () => {
      Alert.alert("Failed to update skillset details");
    },
  });

  const { data: SkillSetData } = useQuery({
    queryKey: ["SkillSetDetails"],
    queryFn: ({ signal }) => GetSkillSets({ signal: signal }),
    staleTime: 1000,
  });

  const SkillSetDatas = SkillSetData?.SkillSets;

  const { mutate: Save, isPending: isSaving } = useMutation({
    mutationFn: PostUserSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["UserProfile"],
        refetchType: "active",
      });

      navigation.navigate("General Information");
      Alert.alert("SkillSet Details Saved Successfully");
    },
    onError: () => {
      Alert.alert("Failed to Save the skill set");
    },
  });

  const handleSaveSkillSet = async () => {
    const id = await AsyncStorage.getItem("userId");
    if (selectedSkillId && selectedLevel) {
      Save({
        data: {
          userId: Number(id),
          skillSetId: selectedSkillId,
          proficiencyLevel: selectedLevel,
        },
      });
      setSelectedLevel(null); // Reset level after saving
      setModalVisible(false); // Close modal
    } else {
      Alert.alert("Please select a skill level.");
    }
  };

  const { mutate: deleteMutate } = useMutation({
    mutationFn: DeleteSkillSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["SkillSetDetails"] });
      Alert.alert("SkillSet Details Deleted Successfully");
      setDeletingId(null);
    },
    onError: () => {
      Alert.alert("Failed to delete the skill set");
      setDeletingId(null);
    },
  });

  const handleDelete = (id: number) => {
    setDeletingId(id); // Set deleting ID before starting mutation

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this skill?",
      [
        { text: "Cancel", style: "cancel", onPress: () => setDeletingId(null) },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutate({ id }),
        },
      ]
    );
  };

  const handleSave = () => {
    if (!skillName || !shorthand || !description) {
      alert("Please fill in all required fields.");
      return;
    }
    mutate({
      data: {
        name: skillName,
        shorthand: shorthand,
        description: description,
      },
    });
  };

  const selectSkill = (id: number) => {
    setSelectedSkillId(id); // Only one skill can be selected
    setModalVisible(true);
  };

  return (
    <>
      <ScrollView style={styles.main}>
        <View style={styles.main1}>
          {/* Form for adding new skills */}
          <View style={styles.namecompany}>
            <Text style={styles.text}>
            Select your Skills Name <Text style={styles.require}> (*)</Text>
            </Text>
            {/* <TextInput
              style={styles.input}
              value={skillName}
              onChangeText={setSkillName}
            /> */}
          </View>

          {/* <View style={styles.position}>
            <Text style={styles.text}>
              Shorthand <Text style={styles.require}> (*)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={shorthand}
              onChangeText={setShorthand}
            />
          </View> */}

          {/* <View style={styles.position}>
            <Text style={styles.text}>
              Description <Text style={styles.require}> (*)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
            />
          </View> */}

          {/* Add More Skills Button */}
          {/* <TouchableOpacity
            style={styles.addSkillsButton}
            onPress={handleSave}
            disabled={isPending}
          >
            <Text style={styles.addSkillsText}>Add More Skill</Text>
            <Icon name="add" size={20} color="#007bff" />
          </TouchableOpacity> */}
        </View>

        {/* List of Skills */}
        <View style={styles.skillList}>
          {SkillSetDatas?.map((skill: any) => (
            <TouchableOpacity
              key={skill.id}
              onPress={() => selectSkill(skill.id)} // Select only one skill
              style={[
                styles.skillItem,
                selectedSkillId === skill.id && styles.selectedSkillItem, // Apply selected style
              ]}
            >
              <View style={{ flexDirection: "column", flex: 1 }}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillShorthand}>{skill.shorthand}</Text>
                <Text style={styles.skillDescription}>
                  {skill.description&& skill.description.replace(/<\/?[^>]+(>|$)/g, "")}
                </Text>
              </View>
              {/* Checkbox for selecting skills */}
              <TouchableOpacity
                onPress={() => selectSkill(skill.id)} // Toggle selection
              >
                <Icon
                  name={
                    selectedSkillId === skill.id
                      ? "check-box"
                      : "check-box-outline-blank"
                  } // Show checked or unchecked icon
                  size={24}
                  color="#007bff"
                />
              </TouchableOpacity>
              {deletingId === skill.id ? (
                <Text>Please wait a second...</Text>
              ) : (
                <TouchableOpacity onPress={() => handleDelete(skill.id)}>
                  <Icon name="delete" size={24} color="red" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Skill Level</Text>
            {levels.map((level) => (
              <TouchableOpacity
                key={level}
                style={styles.modalOption}
                onPress={() => setSelectedLevel(level)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedLevel === level && styles.modalSelectedOptionText,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSaveSkillSet}
                disabled={!selectedLevel}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Save button */}
      {/* <View style={styles.save}>
        <TouchableOpacity
          style={styles.buttonsave}
          onPress={handleSaveSkillSet} // Save the selected skill set for the user
          disabled={isSaving || selectedSkillId === null} // Disable if no skill is selected
        >
          <Text style={styles.textsave}>
            {isSaving ? "Saving..." : "Save Selected Skill"}
          </Text>
        </TouchableOpacity>
      </View> */}
    </>
  );
}

const styles = StyleSheet.create({
  main: {
    paddingVertical: 10,
    flexDirection: "column",
    gap: 10,
    backgroundColor: "#f9f9f9",
  },
  main1: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 10,
    backgroundColor: "white",
    width: "100%",
  },
  namecompany: {
    flexDirection: "column",
    gap: 5,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "100%",
  },
  text: {
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: "600",
  },
  require: {
    color: "red",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  position: {
    flexDirection: "column",
    gap: 5,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    width: "100%",
  },
  save: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    width: "100%",
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonsave: {
    width: "100%",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
  },
  textsave: {
    color: "white",
    fontSize: 20,
    lineHeight: 30,
    fontWeight: "bold",
  },
  addSkillsButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  addSkillsText: {
    fontSize: 16,
    color: "#007bff",
    marginRight: 5,
    marginLeft: 120,
  },
  skillList: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  skillItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedSkillItem: {
    backgroundColor: "#e0f7fa", // Highlight the selected item
  },
  skillName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  skillShorthand: {
    fontSize: 14,
    color: "#666",
  },
  skillDescription: {
    fontSize: 12,
    color: "#888",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  modalSelectedOptionText: {
    fontWeight: "bold",
    color: "#007bff",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
  },
});
