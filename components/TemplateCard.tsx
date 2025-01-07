import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

// Define types for the props
interface ResumeTemplate {
  id: string;
  title: string;
  colors: string[];
  imageUrl: string | any; // to handle both remote and local images
}

const resumeTemplates: ResumeTemplate[] = [
  {
    id: "1",
    title: "Outstanding 10",
    colors: ["#47c2ff", "#ff5a5f", "#54e346", "#f39c12"],
    imageUrl:
      "https://itviec.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd014UGc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--12916489f357a1afda8ea1665487be89a3bd9c97/elegant.png",
  },
  {
    id: "2",
    title: "Outstanding 4",
    colors: ["#2ecc71", "#e74c3c", "#3498db", "#34495e"],
    imageUrl:
      "https://itviec.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd0l4UGc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--c6372bbe203cf53eb2882072f1218222566c7c36/minimal.png",
  },
];
interface ResumeTemplate {
    id: string;
    title: string;
    colors: string[];
    imageUrl: string | any;
  }
// Define prop types for ResumeCard
interface ResumeCardProps {
  title: string;
  colors: string[];
  image: string | any;
  data:ResumeTemplate
  navigation: any;
}

// Functional component for individual card
export const ResumeCard: React.FC<ResumeCardProps> = ({
  title,
  colors,
  image,
  data,
  navigation,
}) => {
  const handleNavigate = (key: string) => {
    console.log('quap',key)

    if (key === '1') {
      navigation.navigate("CVModal");
    } else if (key === '2') {
      navigation.navigate("MinimalTemplate");
    }
  };
  return (
    <TouchableOpacity style={styles.card} onPress={() => handleNavigate(data.id)}>
      <Image
        source={typeof image === "string" ? { uri: image } : image}
        style={styles.image}
      />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.colorRow}>
        {/* {colors.map((color, index) => (
          <View key={index} style={[styles.colorCircle, { backgroundColor: color }]} />
        ))} */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  card: {
    flex: 1,
    minWidth: 165,
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  title: {
    marginVertical: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  colorRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 5,
  },
});
