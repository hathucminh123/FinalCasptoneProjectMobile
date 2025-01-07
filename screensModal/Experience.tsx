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
import { PostExperienceDetails } from "../Services/ExperienceDetailService/PostExperienceDetail";
import { queryClient } from "../Services/mainService";
import { useMutation } from "@tanstack/react-query";

export default function Experience({ navigation }: any) {
  const [companyName, setCompanyName] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [responsibilities, setResponsibilities] = useState<string>("");
  const [achievements, setAchievements] = useState<string>("");
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
    mutationFn: PostExperienceDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ExperienceDetails"] ,refetchType:'active'});
      queryClient.invalidateQueries({
        queryKey: ["UserProfile"],
        refetchType: "active",
      });
      navigation.navigate("General Information");
      Alert.alert("Experience Details Updated Successfully");
    },
    onError: () => {
      Alert.alert("Failed to update experience details");
    },
  });

  const handleSave = () => {
    if (
      !companyName ||
      !formattedDate ||
      !formattedDateTo ||
      !position ||
      !responsibilities ||
      !achievements
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    if (dateTo.getTime() < date.getTime()) {
      Alert.alert("Invalid Date Range", "'To' date cannot be earlier than 'From' date.");
      return;
    }
    const isoStartDate = new Date(date).toISOString();
    const isoEndDate = new Date(dateTo).toISOString();
    // Logic to save the form data or handle further submission

    mutate({
      data: {
        companyName: companyName,
        position: position,
        startDate: isoStartDate,
        endDate: isoEndDate,
        responsibilities: responsibilities,
        achievements: achievements,
      },
    });
    console.log("Experience saved:", {
      companyName,
      from: formattedDate,
      to: formattedDateTo,
      position,
      responsibilities,
      achievements,
    });
  };

  return (
    <>
      <View style={styles.main}>
        <View style={styles.main1}>
          <View style={styles.namecompany}>
            <Text style={styles.text}>
              Company Name <Text style={styles.require}> (*)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={companyName}
              onChangeText={setCompanyName}
            />
          </View>
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
              Position Description <Text style={styles.require}> (*)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={position}
              onChangeText={setPosition}
            />
          </View>
          <View style={styles.position}>
            <Text style={styles.text}>
              Responsibilities <Text style={styles.require}> (*)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={responsibilities}
              onChangeText={setResponsibilities}
            />
          </View>
          <View style={styles.position}>
            <Text style={styles.text}>
              Achievements <Text style={styles.require}> (*)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={achievements}
              onChangeText={setAchievements}
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
