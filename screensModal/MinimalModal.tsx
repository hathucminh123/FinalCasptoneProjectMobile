import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { GetUserProfile } from "../Services/UserProfileService/UserProfile";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const MinimalModal = () => {
  const [UserId, setUserId] = useState<string | null>(null);
  const [Auth, setAuth] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      const Auth = await AsyncStorage.getItem("Auth");
      setAuth(Auth);
      setUserId(id);
    };

    fetchUserId();
  }, []);

  const { data: UserProfile } = useQuery({
    queryKey: ["UserProfile"],
    queryFn: ({ signal }) =>
      GetUserProfile({ id: Number(UserId), signal: signal }),
    staleTime: 1000,
  });

  const UserProfileData = UserProfile?.UserProfiles;

  // Function to handle PDF generation using expo-print
  const createPDF = async () => {
    const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
            color: #333;
          }
          .container {
            display: flex;
            justify-content: space-between;
            width: 100%;
          }
          .header {
            background-color: #e9e9e9;
            padding: 20px;
            font-size: 32px;
            font-weight: bold;
            color: #333;
          }
          .left-column {
            width: 48%;
            padding-right: 10px;
          }
          .right-column {
            width: 48%;
            padding-left: 10px;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #e74c3c; /* Red color for section titles */
          }
          .contact-row {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
          }
          .contact-row img {
            margin-right: 8px;
          }
          .school-name, .company-name {
            font-weight: bold;
            margin-bottom: 2px;
          }
          .divider {
            border-bottom: 1px solid #ddd;
            margin: 16px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">${UserProfileData?.firstName}${""} ${
      UserProfileData?.lastName
    }</div>
  
        <div class="container">
          <!-- Left Column -->
          <div class="left-column">
            <div class="section">
              <div class="section-title">PERSONAL DETAILS</div>
              <div class="contact-row">
                <img src="https://img.icons8.com/ios-glyphs/30/000000/phone.png" width="16" />
                <span>${UserProfileData?.phoneNumber || "N/A"}</span>
              </div>
              <div class="contact-row">
                <img src="https://img.icons8.com/ios-glyphs/30/000000/email.png" width="16" />
                <span>${UserProfileData?.email || "N/A"}</span>
              </div>
            </div>
  
            <div class="section">
              <div class="section-title">EDUCATION</div>
              ${UserProfileData?.educationDetails
                .map(
                  (edu) => `
                  <div class="school-name">School name: ${
                    edu.institutionName || "N/A"
                  }</div>
                  <div>Major: ${edu.fieldOfStudy || "N/A"}</div>
                  <div>From: ${new Date(
                    edu.startDate
                  ).toLocaleDateString()} - To: ${
                    edu.endDate
                      ? new Date(edu.endDate).toLocaleDateString()
                      : "Present"
                  }
                  </div>
                  <div>Degree: ${edu.degree || "N/A"}</div>
                  `
                )
                .join("")}
            </div>
  
            <div class="section">
              <div class="section-title">SKILLS</div>
              <ul>
              ${UserProfileData?.skillSets
                .map(
                  (skill) =>
                    `<li>${skill.name || "N/A"} ${": "} ${
                      skill.proficiencyLevel
                    }</li>`
                )
                .join("")}
              </ul>
            </div>
              <div class="section">
              <div class="section-title">Benefits</div>
              <ul>
              ${(UserProfileData?.benefits ?? [])
                .map((skill) => `<li>${skill.name || "N/A"}</li>`)
                .join("")}
              </ul>
            </div>
          </div>

         
          
  
          <!-- Right Column -->
          <div class="right-column">
            <div class="section">
              <div class="section-title">WORK EXPERIENCE</div>
              ${UserProfileData?.experienceDetails
                .map(
                  (exp) => `
                  <div class="company-name">${exp.companyName}</div>
                  <div>${new Date(exp.startDate).toLocaleDateString()} - ${
                    exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString()
                      : "Present"
                  }</div>
                  <div>Position: ${exp.position}</div>
                  <div>Responsibilities: ${exp.responsibilities}</div>
                  <div>Achievements: ${exp.achievements}</div>
                  `
                )
                .join("")}
            </div>
              <div class="section">
              <div class="section-title">Certificates</div>
              ${UserProfileData?.certificates
                .map(
                  (edu) => `
                  <div class="school-name">Certificates name: ${
                    edu.certificateName || "N/A"
                  }</div>
                  <div>Organization: ${
                    edu.certificateOrganization || "N/A"
                  }</div>
                  <div>Issue Date: ${new Date(
                    edu.issueDate
                  ).toLocaleDateString()} 
                  
                  </div>
                  <div>URL: ${edu.certificateURL || "N/A"}</div>
                     <div>Description: ${edu.description || "N/A"}</div>
                  `
                )
                .join("")}
            </div>
               <div class="section">
              <div class="section-title">Adwards</div>
              ${UserProfileData?.awards
                .map(
                  (edu) => `
                  <div class="school-name">Adwards name: ${
                    edu.awardName || "N/A"
                  }</div>
                  <div>Organization: ${edu.awardOrganization || "N/A"}</div>
                  <div>Issue Date: ${new Date(
                    edu.issueDate
                  ).toLocaleDateString()} 
                  
                  </div>
                 
                     <div>Description: ${edu.description || "N/A"}</div>
                  `
                )
                .join("")}
            </div>
          </div>
        
           
        </div>
      </body>
    </html>
    `;

    try {
      // Generate the PDF
      const { uri } = await Print.printToFileAsync({ html });

      // Save PDF to the local filesystem and share
      const pdfName = `${FileSystem.documentDirectory}${UserProfileData?.firstName}_Resume.pdf`;
      await FileSystem.moveAsync({
        from: uri,
        to: pdfName,
      });

      // Check if sharing is available and then share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfName);
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create or share the PDF");
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.userName}>
            {UserProfileData?.firstName}
            {""} {UserProfileData?.lastName}
          </Text>
        </View>

        <View style={styles.resumeContent}>
          {/* Left Column - Personal Details */}
          <View style={styles.leftColumn}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
              <View style={styles.contactRow}>
                <Icon name="phone" size={16} color="#333" />
                <Text style={styles.contactText}>
                  {UserProfileData?.phoneNumber || "N/A"}
                </Text>
              </View>
              <View style={styles.contactRow}>
                <Icon name="email" size={16} color="#333" />
                <Text style={styles.contactText}>
                  {UserProfileData?.email || "N/A"}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EDUCATION</Text>
              {UserProfileData?.educationDetails.map((edu, index) => (
                <View key={index}>
                  <Text style={styles.schoolName}>
                    School name: {edu.institutionName || "N/A"}
                  </Text>
                  <Text>Major: {edu.fieldOfStudy || "N/A"}</Text>
                  <Text>
                    From: {new Date(edu.startDate).toLocaleDateString()} - To:{" "}
                    {edu.endDate
                      ? new Date(edu.endDate).toLocaleDateString()
                      : "Present"}
                  </Text>
                  <Text>Degree: {edu.degree || "N/A"}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SKILLS</Text>
              {UserProfileData?.skillSets.map((skill, index) => (
                <Text key={index}>
                  • {skill.name || "N/A"} {": "} {skill.proficiencyLevel}
                </Text>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benefits</Text>
              {UserProfileData?.benefits &&
              UserProfileData.benefits.length > 0 ? (
                UserProfileData?.benefits.map((benefits, index) => (
                  <Text key={benefits.id}>• {benefits.name || "N/A"}</Text>
                ))
              ) : (
                <Text>No Benefit Yet</Text>
              )}
            </View>
          </View>

          {/* Right Column - Work Experience */}
          <View style={styles.rightColumn}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>WORK EXPERIENCE</Text>
              {UserProfileData?.experienceDetails.map((exp, index) => (
                <View key={index}>
                  <Text style={styles.companyName}>
                    {exp.companyName || "N/A"}
                  </Text>
                  <Text>
                    {new Date(exp.startDate).toLocaleDateString()} -{" "}
                    {exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString()
                      : "Present"}
                  </Text>
                  <Text>Position: {exp.position || "N/A"}</Text>
                  <Text>
                    Responsibilities:{" "}
                    {exp.responsibilities &&
                      exp.responsibilities.replace(/<\/?[^>]+(>|$)/g, "")}
                  </Text>
                  <Text>
                    Achievements:{" "}
                    {exp.achievements &&
                      exp.achievements.replace(/<\/?[^>]+(>|$)/g, "")}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certificates</Text>
              {UserProfileData?.certificates.map((edu, index) => (
                <View key={index}>
                  <Text style={styles.schoolName}>
                    Certificates name: {edu.certificateName || "N/A"}
                  </Text>
                  <Text>
                    Organization: {edu.certificateOrganization || "N/A"}
                  </Text>
                  <Text>
                    Issue Date: {new Date(edu.issueDate).toLocaleDateString()}
                  </Text>
                  <Text>Description: {edu.description || "N/A"}</Text>
                </View>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Adwards</Text>
              {UserProfileData?.awards.map((edu, index) => (
                <View key={index}>
                  <Text style={styles.schoolName}>
                    Adwards name: {edu.awardName || "N/A"}
                  </Text>
                  <Text>Organization: {edu.awardOrganization || "N/A"}</Text>
                  <Text>
                    Issue Date: {new Date(edu.issueDate).toLocaleDateString()}
                  </Text>
                  <Text>Description: {edu.description || "N/A"}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={createPDF}>
          <Text style={styles.saveButtonText}>Download CV</Text>
          <Icon name={"file-download"} size={30} color="#FF5A5F" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#e9e9e9",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  resumeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  leftColumn: {
    width: "48%", // Take 48% of the screen width
    paddingRight: 10,
  },
  rightColumn: {
    width: "48%", // Take 48% of the screen width
    paddingLeft: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#e74c3c", // Red for section titles
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  schoolName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  companyName: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  footer: {
    padding: 16,
    borderTopColor: "#ddd",
    borderTopWidth: 1,
    backgroundColor: "#fff",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderColor: "#FF5A5F",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FF5A5F",
    fontWeight: "bold",
    marginRight: 10,
  },
});

export default MinimalModal;
