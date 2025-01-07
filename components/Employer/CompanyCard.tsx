import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import RenderHTML from "react-native-render-html";
import { LinearGradient } from "expo-linear-gradient";
interface JobType {
  id: number;
  name: string;
  description: string;
}

interface JobPost {
  id: number;
  jobTitle: string;
  jobDescription: string;
  salary: number;
  postingDate: string;
  expiryDate: string;
  experienceRequired: number;
  qualificationRequired: string;
  benefits: string;
  imageURL: string;
  isActive: boolean;
  companyId: number;
  companyName: string;
  websiteCompanyURL: string;
  jobType: JobType | string | null;
  jobLocationCities: string[];
  jobLocationAddressDetail: string[];
  skillSets: string[];
}

interface BusinessStream {
  id: number;
  businessStreamName: string;
  description: string;
}

interface Company {
  id: number;
  companyName: string;
  companyDescription: string;
  websiteURL: string;
  establishedYear: number;
  country: string;
  city: string;
  address: string;
  numberOfEmployees: number;
  businessStream: BusinessStream;
  jobPosts: JobPost[];
  imageUrl: string;
}
interface props {
  company?: Company;
  onChoose?: () => void;
  jobs: JobPost[] | undefined;
}
const CompanyCard = ({ company, onChoose,jobs }: props) => {
  const { width } = Dimensions.get("window");
  const skills = jobs?.map((skill) => skill.skillSets);
  const flattenedArray = skills?.flat();
  const uniqueArray = [...new Set(flattenedArray)];
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: company?.imageUrl }} style={styles.image} />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.companyName}>{company?.companyName}</Text>

        <View style={styles.descriptionContainer}>
          {company?.companyDescription ? (
            <>
              <RenderHTML
                contentWidth={width - 100}
                source={{ html: company.companyDescription }}
                baseStyle={styles.htmlDescription}
              />
              <LinearGradient
                colors={["transparent", "white"]}
                style={styles.gradientOverlay}
              />
            </>
          ) : (
            <Text
              style={styles.description}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              Description not available
            </Text>
          )}
        </View>

        <Text style={styles.employees}>
          {company?.numberOfEmployees} employees
        </Text>
        <View style={styles.tagContainer}>
      {uniqueArray.map((tag, index) => (
        <Text key={index} style={styles.tag}>
          {tag}
        </Text>
      ))}
    </View>
      </View>

   
      <TouchableOpacity style={styles.chooseButton} onPress={onChoose}>
        <Text style={styles.buttonText}>Choose</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 10,
    backgroundColor: "#FFE6E6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  companyName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  descriptionContainer: {
    maxHeight: 55, 
    overflow: "hidden",
    position: "relative",
  },
  htmlDescription: {
    color: "#666",
    fontSize: 14,
    lineHeight: 18, // Adjust line height for better text fit
  },
  description: {
    color: "#666",
    fontSize: 14,
    lineHeight: 18,
    marginTop: 5,
  },
  employees: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
  },
  chooseButton: {
    alignSelf: "center",
    backgroundColor: "#FFD4C3",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  buttonText: {
    color: "#FF6F61",
    fontWeight: "bold",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 20, // Height of the gradient overlay
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows tags to wrap to the next line if they overflow
    marginBottom: 5,
  },
  tag: {
    backgroundColor: '#e8edf2',
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginRight: 3,
    marginVertical: 5,
    borderRadius: 5,
    fontSize: 14,
    color: '#5e6368',
  },
});

export default CompanyCard;
