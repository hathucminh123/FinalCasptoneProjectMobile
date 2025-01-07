import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { queryClient } from "../Services/mainService";
import { PostSkillSets } from "../Services/SkillSet/PostSkillSet";
import { useMutation, useQuery } from "@tanstack/react-query";
import Icon from "react-native-vector-icons/MaterialIcons";
import { GetSkillSets } from "../Services/SkillSet/GetSkillSet";
import { DeleteSkillSet } from "../Services/SkillSet/DeleteSkillSet";
import { PostUserSkill } from "../Services/UserSkillService/PostUserSkill";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PostBenefits } from "../Services/Benefits/PostBenefits";
import { GetBenefits } from "../Services/Benefits/GetBenefits";
import { PostUserBenefit } from "../Services/UserBenefits/PostUserBenefit";
import { DeleteBenefits } from "../Services/Benefits/DeleteBenefits";

export default function Benefits({ navigation }: any) {
  const [skillName, setSkillName] = useState<string>("");
//   const [shorthand, setShorthand] = useState<string>("");
//   const [description, setDescription] = useState<string>("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null); // Track a single selected skill

  const { mutate, isPending } = useMutation({
    mutationFn: PostBenefits,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Benefits"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["UserProfile"],
        refetchType: "active",
      });

      setSkillName("");
    //   setShorthand("");
    //   setDescription("");
      Alert.alert("Benefits Details Updated Successfully");
    },
    onError: () => {
      Alert.alert("Failed to update Benefits Details");
    },
  });

  const { data: SkillSetData } = useQuery({
    queryKey: ["Benefits"],
    queryFn: ({ signal }) => GetBenefits({ signal: signal }),
    staleTime: 1000,
  });

  const SkillSetDatas = SkillSetData?.Benefits;

  const { mutate: Save, isPending: isSaving } = useMutation({
    mutationFn: PostUserBenefit,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["UserProfile"],
        refetchType: "active",
      });

      navigation.navigate("General Information");
      Alert.alert("Benefits Details Saved Successfully");
    },
    onError: () => {
      Alert.alert("Failed to Save the Benefits");
    },
  });

  const handleSaveSkillSet = async () => {
    const id = await AsyncStorage.getItem("userId");
    Save({
      data: {
        userId: Number(id),
        benefitId: selectedSkillId, // Save the selected skill set ID
        // proficiencyLevel: "",
      },
    });
  };

  const { mutate: deleteMutate } = useMutation({
    mutationFn: DeleteBenefits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Benefits"] });
      Alert.alert("Benefits Details Deleted Successfully");
      setDeletingId(null);
    },
    onError: () => {
      Alert.alert("Failed to delete the Benefits");
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
    if (!skillName) {
      alert("Please fill in all required fields.");
      return;
    }
    mutate({
      data: {
        name: skillName,
       
      },
    });
  };

  const selectSkill = (id: number) => {
    setSelectedSkillId(id); // Only one skill can be selected
  };

  return (
    <>
      <ScrollView style={styles.main}>
        <View style={styles.main1}>
          {/* Form for adding new skills */}
          <View style={styles.namecompany}>
            <Text style={styles.text}>
            Select Your Benefit Name <Text style={styles.require}> (*)</Text>
            </Text>
            {/* <TextInput
              style={styles.input}
              value={skillName}
              onChangeText={setSkillName}
            /> */}
          </View>

          

        

          {/* Add More Skills Button */}
          {/* <TouchableOpacity
            style={styles.addSkillsButton}
            onPress={handleSave}
            disabled={isPending}
          >
            <Text style={styles.addSkillsText}>Add More Benefits</Text>
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

      {/* Save button */}
      <View style={styles.save}>
        <TouchableOpacity
          style={styles.buttonsave}
          onPress={handleSaveSkillSet} // Save the selected skill set for the user
          disabled={isSaving || selectedSkillId === null} // Disable if no skill is selected
        >
          <Text style={styles.textsave}>
            {isSaving ? "Saving..." : "Save Selected Benefits"}
          </Text>
        </TouchableOpacity>
      </View>
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
});
