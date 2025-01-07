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
import { PostEducationDetails } from "../Services/EducationDetails/PostEducationDetails";
import { queryClient } from "../Services/mainService";

export default function Education({ navigation }: any) {
  const [schoolName, setSchoolName] = useState<string>("");
  const [institutionName, setInstitutionName] = useState<string>("");
  const [degree, setDegree] = useState<string>("");
  const [fieldOfStudy, setFieldOfStudy] = useState<string>("");
  const [gpa, setGpa] = useState<string>("");
  const [date, setDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState("select from date");
  const [dateTo, setDateTo] = useState(new Date());
  const [formattedDateTo, setFormattedDateTo] = useState("select to date");

  const showDatePicker = (
    setDateFunction: Function,
    setFormattedDateFunction: Function,
    selectedDate: Date
  ) => {
    DateTimePickerAndroid.open({
      value: selectedDate,
      onChange: (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setDateFunction(currentDate);
        setFormattedDateFunction(currentDate.toDateString());
      },
      mode: "date",
      is24Hour: true,
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: PostEducationDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["EducationDetails"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["UserProfile"],
        refetchType: "active",
      });
      navigation.navigate("General Information");
      // setFormData({
      //   name: "",
      //   institutionName: "",
      //   degree: "",
      //   FieldOfStudy: "",
      //   startMonth: "",
      //   startYear: "",
      //   endMonth: "",
      //   endYear: "",
      //   gpa: 0,
      // });

      Alert.alert("Complete add Education");
    },
    onError: () => {
      Alert.alert("Failed to update education details");
    },
  });

  const handleSave = () => {
    if (
      // !schoolName ||
      !formattedDate ||
      !formattedDateTo ||
      !institutionName ||
      !degree ||
      !fieldOfStudy ||
      !gpa
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    if (Number(gpa) <= 0 || Number(gpa) > 10) {
      alert
      ("GPA must be greater than 0 and less than or equal to 10.");
      return;
    }
    if (dateTo.getTime() < date.getTime()) {
      Alert.alert(
        "Invalid Date Range",
        "'To' date cannot be earlier than 'From' date."
      );
      return;
    }

    // Convert to ISO 8601 format
    const isoStartDate = new Date(date).toISOString();
    const isoEndDate = new Date(dateTo).toISOString();

    mutate({
      data: {
        // name: schoolName,
        institutionName: institutionName,
        degree: degree,
        fieldOfStudy: fieldOfStudy,
        startDate: isoStartDate,
        endDate: isoEndDate,
        gpa: parseFloat(gpa), // Ensure GPA is a number
      },
    });

    console.log("Education saved:", {
      schoolName,
      from: isoStartDate,
      to: isoEndDate,
      institutionName,
      degree,
      fieldOfStudy,
      gpa,
    });
  };

  return (
    <>
      <View style={styles.main}>
        <View style={styles.main1}>
          {/* <View style={styles.namecompany}>
            <Text style={styles.text}>
              School Name <Text style={styles.require}> (*)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={schoolName}
              onChangeText={setSchoolName}
            />
          </View> */}
          <View style={styles.date}>
            <View style={styles.start}>
              <Text style={styles.text}>
                from <Text style={styles.require}> (*)</Text>
              </Text>
              <TouchableOpacity
                onPress={() => showDatePicker(setDate, setFormattedDate, date)}
                style={{ width: "100%", paddingRight: 10 }}
              >
                <TextInput
                  style={styles.inputfrom}
                  value={formattedDate}
                  editable={false}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.end}>
              <Text style={styles.text}>
                to <Text style={styles.require}> (*)</Text>
              </Text>
              <TouchableOpacity
                onPress={() =>
                  showDatePicker(setDateTo, setFormattedDateTo, dateTo)
                }
                style={{ width: "100%", paddingRight: 10 }}
              >
                <TextInput
                  style={styles.inputfrom}
                  value={formattedDateTo}
                  editable={false}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.position}>
            <Text style={styles.text}>
              Institution Name <Text style={styles.require}> (*)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={institutionName}
              onChangeText={setInstitutionName}
            />
          </View>
          <View style={styles.position}>
            <Text style={styles.text}>
              Degree <Text style={styles.require}> (*)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={degree}
              onChangeText={setDegree}
            />
          </View>
          <View style={styles.position}>
            <Text style={styles.text}>
              Field of Study (Major) <Text style={styles.require}> (*)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={fieldOfStudy}
              onChangeText={setFieldOfStudy}
            />
          </View>
          <View style={styles.position}>
            <Text style={styles.text}>
              GPA <Text style={styles.require}> (*)</Text>
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={gpa}
              onChangeText={setGpa}
            />
          </View>
        </View>
      </View>
      <View style={styles.save}>
        <TouchableOpacity style={styles.buttonsave} onPress={handleSave}>
          <Text style={styles.textsave}>Save</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  main: {
    paddingVertical: 10,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
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
  date: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  start: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 5,
    width: "50%",
    paddingRight: 10,
    position: "relative",
  },
  inputfrom: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  end: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 5,
    marginLeft: "auto",
    paddingLeft: 10,
    position: "relative",
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
    textAlign: "center",
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
    textAlign: "center",
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
});
