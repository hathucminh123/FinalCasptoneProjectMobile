import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import MaterialIcons

interface EducationDetail {
  id: number;
  name: string;
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: number;
}

interface Props {
  item: EducationDetail;
  onDelete: (id: number) => void;
  setDeletingId: (deletingId: number | null) => void;
  deletingId: number | null;
  onClick: (item: EducationDetail) => void;
}

const EducationCard = ({ item, onDelete, setDeletingId, deletingId, onClick }: Props) => {
  return (
    <TouchableOpacity style={styles.educationItem} onPress={() => onClick(item)}>
      <View style={styles.textContainer}>
        <Text style={styles.schoolName}>School name:{" "}{item.institutionName}</Text>
        <Text style={styles.degree}>Degree:{" "} {item.degree}</Text>
        <Text style={styles.dates}>
          {new Date(item.startDate).toLocaleString("en", {
            month: "short",
            year: "numeric",
          })}{" "}
          -{" "}
          {item.endDate
            ? new Date(item.endDate).toLocaleString("en", {
                month: "short",
                year: "numeric",
              })
            : "Present"}{" "}
        </Text>
      </View>
      {deletingId === item.id ? (
        <Text>Please wait a second...</Text>
      ) : (
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          {/* Using MaterialIcons for trash icon */}
          <Icon name="delete" size={24} color="red" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  educationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
  },
  textContainer: {
    flexDirection: "column",
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  degree: {
    fontSize: 14,
    color: "#666",
  },
  dates: {
    fontSize: 12,
    color: "#888",
  },
});

export default EducationCard;
