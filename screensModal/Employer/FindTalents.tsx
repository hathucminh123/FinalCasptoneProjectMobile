import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";

import { useQuery } from "@tanstack/react-query";
import { GetSeekerJobPost } from "../../Services/JobsPost/GetSeekerJobPost";
import { GetUserProfile } from "../../Services/UserProfileService/UserProfile";
import { ListSeekers } from "../../Services/ListSeekers/ListSeekers";

import CheckIcon from "react-native-vector-icons/MaterialIcons";
import ModalSendEmail from "./ModalSendEmail";
// import ModalSendEmail from "../../components/NewUiEmployer/ModalSendEmail";
// import CommentModal from "../../components/NewUiEmployer/ModalComment";

export default function RecommendTalents({ navigation, route }: any) {
  //   const { id } = useParams();
  //   const JobId = Number(id);
  const { jobId } = route.params;
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openModalScore, setOpenModalScore] = useState<boolean>(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  // Fetch seeker applications
  //   const { data: SeekerApply } = useQuery({
  //     queryKey: ["SeekerApply", JobId],
  //     queryFn: ({ signal }) => GetSeekerJobPost({ id: JobId, signal }),
  //     enabled: !!JobId,
  //   });
  //   const dataSeekerApply = SeekerApply?.GetSeekers;

  // Fetch all seekers
  const { data: ListSeeker } = useQuery({
    queryKey: ["JobSeekerRole",jobId],
    queryFn: ({ signal }) => ListSeekers({ jobPostId: Number(jobId), signal }),
    enabled:!!Number(jobId)
  });
  const ListSeekrData = ListSeeker?.items;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const handleOpenModalScore = (profile: any) => {
    setOpenModalScore(true);
    setSelectedProfile(profile);
    setSelectedId(profile.id);
    console.log("concas");
  };

  const handleCloseModalScore = () => {
    setOpenModalScore(false);
    setSelectedProfile(null);
  };

  return (
    <ScrollView style={styles.container}>
      {openModalScore && (
        <ModalSendEmail
          idJob={jobId}
          onClose={handleCloseModalScore}
          id={selectedId}
          profileUser={selectedProfile}
        />
      )}

      {ListSeekrData?.map((data: any, index: number) => (
        <View key={index} style={styles.card}>
          <Text style={styles.name}>
            {data.firstName} {data.lastName}
          </Text>
          <Text style={styles.contact}>
            Email: {data.email} • Phone: {data.phoneNumber}
          </Text>

          {/* Experience Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experienceDetails?.map((exp: any, expIndex: number) => (
              <View key={expIndex} style={styles.experienceItem}>
                <Text style={styles.text}>Company: {exp.companyName}</Text>
                <Text style={styles.text}>Position: {exp.position}</Text>
                <Text style={styles.text}>
                  From: {new Date(exp.startDate).toLocaleDateString()} - To:{" "}
                  {exp.endDate
                    ? new Date(exp.endDate).toLocaleDateString()
                    : "Present"}
                </Text>
                <Text style={styles.text}>Responsibilities:</Text>
                <Text style={styles.text}>
                  {exp.responsibilities &&
                    exp.responsibilities.replace(/<\/?[^>]+(>|$)/g, "")}
                </Text>
                <Text style={styles.text}>Achievements:</Text>
                <Text style={styles.text}>
                  {exp.achievements &&
                    exp.achievements.replace(/<\/?[^>]+(>|$)/g, "")}
                </Text>
              </View>
            ))}
          </View>

          {/* Education Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.educationDetails?.map((edu: any, eduIndex: number) => (
              <View key={eduIndex} style={styles.educationItem}>
                <Text style={styles.text}>School: {edu.institutionName}</Text>
                <Text style={styles.text}>
                  Field of Study: {edu.fieldOfStudy} - GPA: {edu.gpa}
                </Text>
                <Text style={styles.text}>
                  From: {new Date(edu.startDate).toLocaleDateString()} - To:{" "}
                  {edu.endDate
                    ? new Date(edu.endDate).toLocaleDateString()
                    : "Present"}{" "}
                </Text>
              </View>
            ))}
          </View>

          {/* Skills Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <FlatList
              data={data.skillSets}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Text style={styles.text}>{item.name}</Text>
              )}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefits</Text>
            <FlatList
              data={data.benefits}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Text style={styles.text}>{item.name}</Text>
              )}
            />
          </View>

          {/* Action Button */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleOpenModalScore(data)}
            >
              <CheckIcon name="check" size={18} color="white" />
              <Text style={styles.buttonText}>Request to Send Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  contact: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  experienceItem: {
    marginBottom: 8,
  },
  educationItem: {
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 14,
  },
});
