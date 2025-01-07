import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import MaterialIcons

interface SkillSet {
  id: number;
  name: string;
  shorthand: string;
  description: string;
  proficiencyLevel?:string;
}

interface Props {
  item: SkillSet;
  onDelete: (id: number) => void;
  setDeletingId: (deletingId: number | null) => void;
  deletingId: number | null;
  onClick?: (item: SkillSet) => void;
}

const SkillCard = ({
  item,
  onDelete,
  setDeletingId,
  deletingId,
  onClick,
}: Props) => {
  return (
    // <TouchableOpacity style={styles.educationItem} onPress={() => onClick(item)}>
    <TouchableOpacity style={styles.educationItem}>
      <View style={styles.textContainer}>
        <Text style={styles.schoolName}>Skill Name: {item.name}</Text>
        {item.description && (
          <Text style={styles.degree}>
            Skill Description: {item.description.replace(/<\/?[^>]+(>|$)/g, "")}
          </Text>
        )}
          <Text style={styles.degree}>Skill Level: {item.proficiencyLevel}</Text>

        {/* <Text style={styles.dates}>
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
        </Text> */}
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

export default SkillCard;
