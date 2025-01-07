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

const ResumeScreen = () => {
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
      }
      .card {
        background-color: #fff;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid #ddd;
      }
      .header {
        background-color: #383d44; /* Dark background color */
        color: white;
        padding: 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
      }
      .profile-image {
        width: 60px; /* Placeholder image size */
        height: 60px;
        background-color: #ddd; /* Gray circle */
        border-radius: 50%;
        margin-right: 16px;
      }
      .profile-details {
        flex: 1; /* Takes up remaining space */
      }
      .user-name {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 8px; /* Space below name */
      }
      .contact-row {
        display:block;
        box-sizing:border-box
      }
          .contact-roww {
        display: flex;
        
        align-items: center;
      }
      .contact-row p {
        margin-left: 8px;
        font-size: 14px;
        color: white;
        margin-bottom: 0;
      }
      .contact-icon {
        margin-right: 8px;
      }
      .divider {
        border-bottom: 1px solid #ccc;
        margin: 16px 0;
      }
      h2 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #383d44;
      }
      p, li {
        font-size: 14px;
        color: #555;
      }
      .education-details, .skill, .work-experience {
        padding: 10px;
        margin-bottom: 16px; /* Space between sections */
      }
      ul {
        padding-left: 20px; /* Indentation for bullet points */
      }
    </style>
  </head>
  <body>
    <div class="card">
      <!-- Header Section -->
      <div class="header">
        <!-- Profile Image Placeholder -->
        <div class="profile-image"></div>

        <!-- Profile Details -->
        <div class="profile-details">
          <div class="user-name">${UserProfileData?.firstName}${""} ${
      UserProfileData?.lastName
    }</div>
          <div class="contact-row">
            <!-- Phone Icon (optional) -->
            <div class="contact-roww">
            <svg
              class="contact-icon"
              xmlns="http://www.w3.org/2000/svg"
              height="16"
              viewBox="0 0 24 24"
              width="16"
              fill="#fff"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path
                d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              />
            </svg>
              <p>${UserProfileData?.phoneNumber}</p>
           </div>
            <!-- Email Icon -->
              <div class="contact-roww">
            <svg
              class="contact-icon"
              xmlns="http://www.w3.org/2000/svg"
              height="16"
              viewBox="0 0 24 24"
              width="16"
              fill="#fff"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path
                d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
              />
            </svg>

            <!-- Email Address -->
            <p>${UserProfileData?.email}</p>
             </div>
            
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Education Section -->
      <div class="education-details">
        <h2>Education</h2>
        ${UserProfileData?.educationDetails
          .map(
            (edu) => `
          <div>
            <p><strong>School Name:</strong> ${
              edu.institutionName || "Not provided"
            }</p>
            <p><strong>From:</strong> ${new Date(
              edu.startDate
            ).toLocaleDateString("en", {
              month: "short",
              year: "numeric",
            })} - <strong>To:</strong> ${
              edu.endDate
                ? new Date(edu.endDate).toLocaleDateString("en", {
                    month: "short",
                    year: "numeric",
                  })
                : "Present"
            }</p>
            <p><strong>Major:</strong> ${edu.fieldOfStudy || "Not provided"}</p>
            <p><strong>Degree:</strong> ${edu.degree || "Not provided"}</p>
          </div>
          `
          )
          .join("")}
      </div>

       <div class="divider"></div>

      <!-- Certificates Section -->
      <div class="education-details">
        <h2>Certificates</h2>
        ${UserProfileData?.certificates
          .map(
            (edu) => `
          <div>
            <p><strong>Certificates Name:</strong> ${
              edu.certificateName || "Not provided"
            }</p>
            <p><strong>Issue Date:</strong> ${new Date(
              edu.issueDate
            ).toLocaleDateString("en", {
              month: "short",
              year: "numeric",
            })} 
            }</p>
            <p><strong>Organization:</strong> ${
              edu.certificateOrganization || "Not provided"
            }</p>
            <p><strong>URL:</strong> ${edu.certificateURL || "Not provided"}</p>
             <p><strong>Description:</strong> ${edu.description || "Not provided"}</p>
          </div>
          `
          )
          .join("")}
      </div>
         <div class="divider"></div>

      <!-- Adward Section -->
      <div class="education-details">
        <h2>Award</h2>
        ${UserProfileData?.awards
          .map(
            (edu) => `
          <div>
            <p><strong>Award Name:</strong> ${
              edu.awardName || "Not provided"
            }</p>
            <p><strong>Issue Date:</strong> ${new Date(
              edu.issueDate
            ).toLocaleDateString("en", {
              month: "short",
              year: "numeric",
            })} 
            }</p>
            <p><strong>Organization:</strong> ${
              edu.awardOrganization || "Not provided"
            }</p>
            <p><strong>Description:</strong> ${
              edu.description || "Not provided"
            }</p>
            
          </div>
          `
          )
          .join("")}
      </div>

      <div class="divider"></div>

      <!-- Skills Section -->
      <div class="skill">
        <h2>Skill</h2>
        <ul>
          ${UserProfileData?.skillSets
            .map(
              (skills) =>
                `<li>${skills.name}: 
            
              ${skills.proficiencyLevel}  
              </li>`
            )
            .join("")}
        </ul>
      </div>

      <div class="divider"></div>

        <!-- Benefit Section -->
      <div class="skill">
        <h2>Benefits</h2>
        <ul>
          ${(UserProfileData?.benefits ?? [])
            .map(
              (skills) =>
                `<li>${skills.name}: 
              </li>`
            )
            .join("")}
        </ul>
      </div>

      <div class="divider"></div>

      <!-- Work Experience Section -->
      <div class="work-experience">
        <h2>Work Experience</h2>
        ${UserProfileData?.experienceDetails
          .map(
            (exp) => `
            <div>
              <h3>${exp.companyName} (${new Date(
              exp.startDate
            ).toLocaleDateString()} - ${
              exp.endDate
                ? new Date(exp.endDate).toLocaleDateString()
                : "Present"
            })</h3>
              <p>Position: ${exp.position}</p>
              <p>Responsibilities: ${
                exp.responsibilities &&
                exp.responsibilities.replace(/<\/?[^>]+(>|$)/g, "")
              }</p>
              <p>Achievements: ${
                exp.achievements &&
                exp.achievements.replace(/<\/?[^>]+(>|$)/g, "")
              }</p>
            </div>`
          )
          .join("")}
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
        <View style={styles.card}>
          {/* Technical Skills Section */}
          <View style={styles.header}>
            <View style={styles.profileContainer}>
              <Icon name="person" size={60} color="#fff" />
              <View style={styles.profileDetails}>
                <Text style={styles.userName}>
                  {UserProfileData?.firstName} {UserProfileData?.lastName}
                </Text>
                <View style={styles.contactRow}>
                  <Icon name="email" size={16} color="#fff" />
                  <Text style={styles.emailText}>{UserProfileData?.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Icon name="phone" size={16} color="#fff" />
                  <Text style={styles.emailText}>
                    {UserProfileData?.phoneNumber}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ padding: 16 }}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Technical Skills</Text>
              {UserProfileData?.skillSets.map((skills) => (
                <Text style={styles.bulletPoint} key={skills.name}>
                  •{skills.name}:{" "}
                  {/* {skills.description &&
                    skills.description.replace(/<\/?[^>]+(>|$)/g, "")}{" "} */}
                  {skills.proficiencyLevel}
                </Text>
              ))}
            </View>

            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benefits</Text>
              {UserProfileData?.benefits &&
              UserProfileData?.benefits.length > 0 ? (
                UserProfileData?.benefits.map((skills) => (
                  <Text style={styles.bulletPoint} key={skills.id}>
                    •{skills.name}:{" "}
                  </Text>
                ))
              ) : (
                <Text style={styles.bulletPoint}> No Benefit yet</Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* Work Experience Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work Experience</Text>
              {UserProfileData?.experienceDetails.map((exp) => (
                <View style={styles.job} key={exp.companyName}>
                  <Text style={styles.jobTitle}>
                    Company Name: {exp.companyName} |{" "}
                    {new Date(exp.startDate).toLocaleString("en", {
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {exp.endDate
                      ? new Date(exp.endDate).toLocaleString("en", {
                          month: "short",
                          year: "numeric",
                        })
                      : "Present"}{" "}
                  </Text>
                  <Text style={styles.jobRole}>Position: {exp.position}</Text>
                  <Text style={styles.jobResponsibilities}>
                    {exp.responsibilities &&
                      exp.responsibilities.replace(/<\/?[^>]+(>|$)/g, "")}
                  </Text>
                  <Text style={styles.jobTitle}>Achievements:</Text>
                  <Text style={styles.jobDescription}>
                    {exp.achievements &&
                      exp.achievements.replace(/<\/?[^>]+(>|$)/g, "")}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            {/* Education Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {UserProfileData?.educationDetails.map((edu) => (
                <View style={styles.education} key={edu.name}>
                  <Text style={styles.school}>
                    School Name: {edu.institutionName} |{" "}
                    {new Date(edu.startDate).toLocaleString("en", {
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {edu.endDate
                      ? new Date(edu.endDate).toLocaleString("en", {
                          month: "short",
                          year: "numeric",
                        })
                      : "Present"}{" "}
                  </Text>
                  <Text style={styles.degree}>Major: {edu.fieldOfStudy}</Text>
                  <Text style={styles.thesis}>GPA: {edu.gpa}</Text>
                </View>
              ))}
            </View>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certificates</Text>
              {UserProfileData?.certificates.map((edu) => (
                <View style={styles.education} key={edu.id}>
                  <Text style={styles.school}>
                    Certificates Name: {edu.certificateName} |{" Issue Date: "}
                    {new Date(edu.issueDate).toLocaleString("en", {
                      month: "short",
                      year: "numeric",
                    })}{" "}
                  </Text>
                  <Text style={styles.degree}>
                    Organization: {edu.certificateOrganization}
                  </Text>
                  <Text style={styles.thesis}>URL: {edu.certificateURL}</Text>
                  <Text style={styles.thesis}>
                    Description: {edu.description}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Adward</Text>
              {UserProfileData?.awards.map((edu) => (
                <View style={styles.education} key={edu.id}>
                  <Text style={styles.school}>
                    Adward Name: {edu.awardName} |{" Issue Date: "}
                    {new Date(edu.issueDate).toLocaleString("en", {
                      month: "short",
                      year: "numeric",
                    })}{" "}
                  </Text>
                  <Text style={styles.degree}>
                    Organization: {edu.awardOrganization}
                  </Text>

                  <Text style={styles.thesis}>
                    Description: {edu.description}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />
          </View>
        </View>
      </ScrollView>
      <View style={styles.like}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <TouchableOpacity style={styles.saveButton} onPress={createPDF}>
            <Text style={styles.saveButtonText}>Download CV</Text>
            <View style={{ marginLeft: 10 }}>
              <Icon name={"file-download"} size={30} color="#FF5A5F" />
            </View>
          </TouchableOpacity>
        </View>
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
  card: {
    backgroundColor: "#fff",
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 5,
  },
  header: {
    backgroundColor: "#383d44",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileDetails: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  emailText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    marginLeft: 8,
  },
  job: {
    marginTop: 8,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  jobRole: {
    fontSize: 14,
    marginTop: 4,
  },
  jobResponsibilities: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 4,
  },
  jobDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  education: {
    marginTop: 8,
  },
  school: {
    fontSize: 14,
    fontWeight: "bold",
  },
  degree: {
    fontSize: 14,
    marginTop: 4,
  },
  thesis: {
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: 16,
  },
  like: {
    position: "absolute",
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 30,
    backgroundColor: "white",
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderColor: "#FF5A5F",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  saveButtonText: {
    color: "#FF5A5F",
    fontWeight: "bold",
  },
});

export default ResumeScreen;
