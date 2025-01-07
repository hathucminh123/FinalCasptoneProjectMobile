import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Location {
  id: number;
  city: string;
}

interface SkillSet {
  id: number;
  name: string;
  shorthand: string;
  description: string;
}

interface JobType {
  id: number;
  name: string;
  description: string;
}

interface ResultItem {
  id: number;
  location: Location;
  skillSet: SkillSet;
  jobType: JobType;
  userId: number;
}

interface AlertDataCardProps {
  data: ResultItem[] | undefined;
  onDelete: (id: number) => void; // Function to handle delete action
}

const AlertDataCard: React.FC<AlertDataCardProps> = ({ data, onDelete }) => {
  const renderCard = ({ item }: { item: ResultItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          Skill: {item.skillSet?.name ?? "No Skill Name"}
        </Text>
        
        <TouchableOpacity  onPress={() => onDelete(item.id)}>
          <Icon name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardText}>
        Location: {item.location?.city ?? "No City"}
      </Text>
      <Text style={styles.cardText}>
        Job Type: {item.jobType?.name ?? "No JobType"}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderCard}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    // padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    elevation: 10,
    width:'100%'
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
  },
});

export default AlertDataCard;
