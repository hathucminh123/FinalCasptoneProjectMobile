import React from "react";
import { View, Text, FlatList, Image, StyleSheet, ScrollView } from "react-native";
import { ResumeCard } from "../components/TemplateCard";
interface ResumeTemplate {
  id: string;
  title: string;
  colors: string[];
  imageUrl: string | any;
}

const resumeTemplates: ResumeTemplate[] = [
  {
    id: "1",
    title: "Elegant",
    colors: ["#47c2ff", "#ff5a5f", "#54e346", "#f39c12"],
    imageUrl:
      "https://itviec.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd014UGc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--12916489f357a1afda8ea1665487be89a3bd9c97/elegant.png",
  },
  {
    id: "2",
    title: "Minimal",
    colors: ["#2ecc71", "#e74c3c", "#3498db", "#34495e"],
    imageUrl:
      "https://itviec.com/rails/active_storage/blobs/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBd0l4UGc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--c6372bbe203cf53eb2882072f1218222566c7c36/minimal.png",
  },
  

];
const CVTemplate = ({navigation}:any) => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
  <View style={styles.wrapContainer}>
    {resumeTemplates.map((item) => (
      <ResumeCard
      navigation={navigation}
        key={item.id}
        data={item}
        title={item.title}
        colors={item.colors}
        image={item.imageUrl}
      />
    ))}
  </View>
</ScrollView>
  );
};

const styles = StyleSheet.create({
    scrollContainer: {
      padding: 10,
    },
    wrapContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',  
      justifyContent: 'space-between', 
    },
  });
export default CVTemplate;
