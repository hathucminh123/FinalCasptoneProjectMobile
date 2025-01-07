import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import MaterialIcons

interface awards{
    id:number;
    awardName:string;
    awardOrganization:string;
    description:string;
    issueDate:string
  }

interface Props {
  item: awards;
  onDelete: (id: number) => void;
  setDeletingId: (deletingId: number | null) => void;
  deletingId: number | null;
  onClick: (item: awards) => void;
}

const AdwardDetails = ({
  item,
  onDelete,
  setDeletingId,
  deletingId,
  onClick,
}: Props) => {
 
  return (
    <TouchableOpacity
      style={styles.educationItem}
      onPress={() => onClick(item)}
    >
      <View style={styles.textContainer}>
        <Text style={styles.schoolName}>
          Awards name: {item.awardName}
        </Text>
        <Text style={styles.degree}>
          Organnization: {item.awardOrganization}
        </Text>
        <Text style={styles.dates}>
          Issue Date:
          {new Date(item.issueDate).toLocaleString("en", {
            month: "short",
            year: "numeric",
          })}
        </Text>
        <Text style={styles.degree}>
          description: {item.description}
        </Text>
       
      </View>
      {deletingId === item.id ? (
        <Text>Please wait a second...</Text>
      ) : (
        <TouchableOpacity onPress={() => onDelete(item.id)}>
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
  urlContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  urlText: {
    fontSize: 14,
    color: "blue",
    textDecorationLine: "underline",
  },
});

export default AdwardDetails;
