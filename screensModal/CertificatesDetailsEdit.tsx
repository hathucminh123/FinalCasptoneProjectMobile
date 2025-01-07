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
import { PutCertificates } from "../Services/CertificatesService/PutCertificates";

export default function CertificatesDetailsEdit({ route, navigation }: any) {
  const { item } = route.params;

  // State for each field
  const [certificateName, setCertificateName] = useState<string>(
    item.certificateName
  );
  const [organizationName, setOrganizationName] = useState<string>(
    item.certificateOrganization
  );
  const [description, setDescription] = useState<string>(item.description);
  const [certificateURL, setCertificateURL] = useState<string>(
    item.certificateURL
  );
  const [issueDate, setIssueDate] = useState(new Date(item.issueDate));
  const [formattedDate, setFormattedDate] = useState(
    new Date(item.issueDate).toDateString()
  );

  // Show Date Picker
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

  // Mutation for saving changes
  const { mutate, isPending } = useMutation({
    mutationFn: PutCertificates,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["UserProfile"],
        refetchType: "active",
      });
      Alert.alert("Certificate updated successfully!");
      navigation.goBack();
    },
    onError: () => {
      Alert.alert("Failed to update certificate.");
    },
  });

  const handleSave = () => {
    if (!certificateName || !organizationName || !certificateURL) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    mutate({
      data: {
        id: item.id,
        certificateName,
        certificateOrganization: organizationName,
        description,
        certificateURL,
        issueDate: issueDate.toISOString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Form */}
      <View style={styles.form}>
        {/* Certificate Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Certificate Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={certificateName}
            onChangeText={setCertificateName}
            placeholder="Enter certificate name"
          />
        </View>

        {/* Organization Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Organization Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={organizationName}
            onChangeText={setOrganizationName}
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
            multiline
          />
        </View>

        {/* Certificate URL */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Certificate URL <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={certificateURL}
            onChangeText={setCertificateURL}
            placeholder="Enter certificate URL"
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
    backgroundColor: "#f9f9f9",
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
