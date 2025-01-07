import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../Services/mainService";
import { PostAwards } from "../Services/AwardsService/PostAwards";

export default function Awards({ navigation }: any) {
  const [awardName, setAwardName] = useState<string>("");
  const [awardOrganization, setAwardOrganization] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [issueDate, setIssueDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState(issueDate.toDateString());

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: issueDate,
      onChange: (event, selectedDate) => {
        const currentDate = selectedDate || issueDate;
        setIssueDate(currentDate);
        setFormattedDate(currentDate.toDateString());
      },
      mode: "date",
      is24Hour: true,
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: PostAwards,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["UserProfile"],
        refetchType: "active",
      });
      Alert.alert("Success", "Award saved successfully!");
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Error", "Failed to save award.");
    },
  });

  const handleSave = () => {
    if (!awardName || !awardOrganization) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    mutate({
      data: {
        awardName,
        awardOrganization,
        description,
        issueDate: issueDate.toISOString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        {/* Award Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Award Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={awardName}
            onChangeText={setAwardName}
            placeholder="Enter award name"
          />
        </View>

        {/* Award Organization */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Award Organization <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={awardOrganization}
            onChangeText={setAwardOrganization}
            placeholder="Enter organization name"
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            multiline={true}
            numberOfLines={4}
          />
        </View>

        {/* Issue Date */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Issue Date <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity onPress={showDatePicker}>
            <TextInput
              style={styles.input}
              value={formattedDate}
              editable={false}
              placeholder="Select issue date"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isPending}
        >
          <Text style={styles.saveButtonText}>
            {isPending ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  form: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  required: {
    color: "red",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  saveButton: {
    backgroundColor: "#FF5A5F",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
