import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
  Linking,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import { RadioButton } from "react-native-paper";
import TextInputComponent from "../components/TextInputComponent";
import { fetchCompanies } from "../Services/CompanyService/GetCompanies";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GetJobPostById } from "../Services/JobsPost/GetJobPostById";
import { fetchCVs } from "../Services/CVService/GetCV";
import { PostCVs } from "../Services/CVService/PostCV";
import { queryClient } from "../Services/mainService";
import { PostJobPostActivity } from "../Services/JobsPostActivity/PostJobPostActivity";
import { GetJobActivity } from "../Services/UserJobPostActivity/GetUserJobPostActivity";
import { GetSeekerJobPost } from "../Services/JobsPost/GetSeekerJobPost";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import "react-native-get-random-values";
import * as uuid from "uuid";
import { storage } from "../firebase/config";
import { PostCVsAI } from "../Services/CVService/PostCVAI";
import { GetUserProfile } from "../Services/UserProfileService/UserProfile";

interface FileResponse {
  uri: string;
  name: string | null;
  mimeType: string | null;
  size: number | null;
}

export default function Apply({ route, navigation }: any) {
  const { id } = route.params;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toISOString().split("T")[0]; // Chỉ lấy phần ngày (YYYY-MM-DD)
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
    });
  };

  const { data: jobData } = useQuery({
    queryKey: ["Job-details", id],
    queryFn: ({ signal }) => GetJobPostById({ id: Number(id), signal }),
    enabled: !!id,
  });
  const job = jobData?.JobPosts;

  const { data: Company } = useQuery({
    queryKey: ["Company"],
    queryFn: ({ signal }) => fetchCompanies({ signal }),
    staleTime: 5000,
  });

  const Companiesdata = Company?.Companies;
  const companyDetail = Companiesdata?.find(
    (item) => item.id === job?.companyId
  );

  const { data: JobPostActivity } = useQuery({
    queryKey: ["JobPostActivity"],
    queryFn: ({ signal }) => GetJobActivity({ signal }),
    staleTime: 5000,
  });

  const JobPostActivitydata = JobPostActivity?.UserJobActivitys;
  const hasAppliedJobActivity = JobPostActivitydata?.find(
    (activity) => activity.jobPostId === job?.id
  );

  const [selectedFile, setSelectedFile] = useState<FileResponse | null>(null);
  const [selectedCV, setSelectedCV] = useState<string | null>(null);
  const [selectedCVId, setSelectedCVId] = useState<number | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string | null>("");

  // const [coverLetter, setCoverLetter] = useState<string|null>("");

  const stripHTML = (html: string): string => {
    return html.replace(/<[^>]*>?/gm, "");
  };

  const [UserId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    };

    fetchUserId();
  }, []);

  const { data: UserProfile } = useQuery({
    queryKey: ["UserProfile"],
    queryFn: ({ signal }) =>
      GetUserProfile({ id: Number(UserId), signal: signal }),
    enabled: !!UserId,
  });
  const UserProfileData = UserProfile?.UserProfiles;

  useEffect(() => {
    if (UserProfileData) {
      setName(UserProfileData?.firstName + " " + UserProfileData?.lastName);
      setEmail(UserProfileData?.email);
      setPhone(UserProfileData?.phoneNumber);
      // setCoverLetter(stripHTML(UserProfileData?.coverLetter));
    }
  }, []);

  const { data: CVdata } = useQuery({
    queryKey: ["CVs"],
    queryFn: ({ signal }) => fetchCVs({ signal }),
    staleTime: 5000,
  });

  const dataCVS = CVdata?.CVs || [];

  const selectedCv = dataCVS.find((item) => item.id === selectedCVId);
  const { mutate: PostCVAi } = useMutation({
    mutationFn: PostCVsAI,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["JobPostActivity"],
        refetchType: "active",
      });

      // console.log("ok chua ta ", data);
      // queryClient.invalidateQueries({
      //   queryKey: ["JobPostActivity"],
      //   refetchType: "active", // Ensure an active refetch
      // });
      // message.success(`CV Apply to ${job?.jobTitle} successfully!`);
      // navigate(`/thankyou/${job?.id}`);
    },
    onError: () => {
      Alert.alert("Failed to Apply CV .");
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: PostCVs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["CVs"] });
      Alert.alert("Post CV successfully");
    },
    onError: () => {
      Alert.alert("Failed to Upload CV");
    },
  });
  async function pickFile() {
    try {
      // Let the user pick a file with specified types
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      // Check if user cancelled file selection
      if (result.canceled) {
        Alert.alert("File selection was cancelled.");
        return;
      }

      const selectedAsset = result.assets ? result.assets[0] : result;

      if (!selectedAsset.uri) {
        Alert.alert("Error", "No file was selected.");
        return;
      }

      // Set file details to state (optional)
      setSelectedFile({
        uri: selectedAsset.uri,
        name: selectedAsset.name ?? "Unknown",
        mimeType: selectedAsset.mimeType ?? "Unknown",
        size: selectedAsset.size ?? 0,
      });

      // Generate a unique reference in Firebase Storage
      const fileRef = ref(storage, `${selectedAsset.name}`);

      // Convert file URI to blob for upload
      const response = await fetch(selectedAsset.uri);
      const blob = await response.blob();

      // Upload the file to Firebase Storage
      await uploadBytes(fileRef, blob);

      // Get the download URL once upload completes
      const fileUrl = await getDownloadURL(fileRef);

      // Perform mutation or any other action with the file URL and details
      mutate({
        data: {
          url: fileUrl,
          name: selectedAsset.name,
        },
      });

      Alert.alert("Success", "File uploaded successfully!");
    } catch (error) {
      console.error("Error picking or uploading file: ", error);
      Alert.alert(
        "Error",
        "There was an error while selecting or uploading the file."
      );
    }
  }
  const { mutate: JobApply, isPending: ApplyPending } = useMutation({
    mutationFn: PostJobPostActivity,
    // onSuccess: () => {
    //   queryClient.invalidateQueries({
    //     queryKey: ["JobPostActivity"],
    //     refetchType: "active",
    //   });
    //   Alert.alert(`CV Apply to ${job?.jobTitle} successfully!`);
    //   navigation.navigate("ApplyComplete");
    // },
    onSuccess: async () => {
      try {
        // await PostCVAi({
        //   data: {
        //     jobPostId: job?.id,
        //     url: selectedCv?.url ?? "",
        //     cvId: selectedCv?.id,
        //     userId: UserId,
        //   },
        // });
        Alert.alert(`CV Apply to ${job?.jobTitle} successfully!`);
        navigation.navigate("ApplyComplete");

        // queryClient.invalidateQueries({
        //   queryKey: ["JobPostActivity"],
        //   refetchType: "active",
        // });
        // Alert.alert(`CV Apply to ${job?.jobTitle} successfully!`);
        // navigation.navigate("ApplyComplete");
      } catch {
        Alert.alert("Failed to apply CV .");
      }
    },
    onError: () => {
      Alert.alert("Failed to Apply CV.");
    },
  });

  const handleSelectCV = (id: number, name: string) => {
    setSelectedCV(name);
    setSelectedCVId(id);
  };

  const handleApply = () => {
    if (selectedCV) {
      JobApply({
        data: {
          jobPostId: job?.id,
          cvId: selectedCVId,
        },
      });
    } else {
      Alert.alert("Please select a CV to apply.");
    }
  };
  const handleSendCvApply = async () => {
    if (selectedCVId && selectedCv?.url) {
      try {
        // Show loading indicator here if needed
        // const response = await fetch(selectedCv?.url);
        // const blob = await response.blob();

        // // Convert Blob to File
        // const file = new File([blob], selectedCv?.name || "uploaded_file", {
        //   type: blob.type,
        // });

        // Send file via PostCVAi
        // await PostCVAi({
        //   data: { jobPostId: job?.id, url: selectedCv?.url ?? "" },
        // });

        // Trigger mutation for further updates
        await JobApply({
          data: {
            jobPostId: job?.id,
            cvId: selectedCVId,
          },
        });

        // Alert.alert("CV sent successfully!");
      } catch (error) {
        console.error("Error during CV submission:", error);
        Alert.alert("Failed to send CV. Please try again.");
      }
    } else {
      Alert.alert("Please select a CV to apply.");
    }
  };

  const { data: SeekerApply } = useQuery({
    queryKey: ["SeekerApply", id],
    queryFn: ({ signal }) => GetSeekerJobPost({ id: Number(id), signal }),
    enabled: !!id,
  });

  const dataSeekerApply = SeekerApply?.GetSeekers;

  const feedBackUserJob = dataSeekerApply?.find(
    (item) => item.id === Number(UserId)
  );
  const profileApply = dataSeekerApply?.find(
    (item) => item.id === Number(UserId)
  );

  const CVApplied = dataCVS.find((item) => item.id === profileApply?.cvId);

  if (!job) {
    return (
      <View>
        <Text>Job not found</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView>
        <View style={styles.main}>
          <View style={styles.main1}>
            <Text style={styles.title}>{job?.jobTitle}</Text>
            <Text style={styles.companyText}>{companyDetail?.companyName}</Text>
            <View style={styles.location}>
              {job?.jobLocationAddressDetail?.length > 0 ? (
                <View style={styles.locationCo}>
                  {job.jobLocationAddressDetail.map((item, index) => (
                    <View style={styles.location} key={index}>
                      <Icon name="location-on" size={20} color="#808080" />
                      <Text style={styles.locationtext}>{item}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.location}>
                  <Icon name="location-on" size={20} color="#808080" />
                  <Text style={styles.locationtext}>
                    {companyDetail?.address}
                    {" in "}
                    {companyDetail?.city}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.tax}>
              <Icon name="attach-money" size={20} color="#808080" />
              <Text style={styles.taxtext}>{job?.salary}</Text>
            </View>
            <View style={styles.post}>
              <Icon name="access-time" size={15} color="#808080" />
              <Text style={styles.posttext}>
                {job?.postingDate
                  ? formatDate(job.postingDate)
                  : "No Date Available"}
              </Text>
              <Text>To</Text>
              <Text style={styles.posttext}>
                {job?.postingDate
                  ? formatDate(job.expiryDate)
                  : "No Date Available"}
              </Text>
            </View>
          </View>

          {hasAppliedJobActivity && profileApply ? undefined : (
            <View style={styles.container}>
              <TouchableOpacity style={styles.uploadButton} onPress={pickFile}>
                <Icon name="cloud-upload" size={24} color="#1E90FF" />
                <Text style={styles.uploadText}>Upload your CV</Text>
              </TouchableOpacity>

              <Text style={styles.hintText}>
                (*.doc, *.docx, *.pdf, and &lt; 5MB)
              </Text>

              {selectedFile && (
                <Text style={styles.selectedFileText}>
                  Selected file: {selectedFile.name}
                </Text>
              )}
            </View>
          )}

          <View style={styles.main1}>
            {feedBackUserJob ? (
              <Text style={styles.title1}>Your Submit File</Text>
            ) : (
              <Text style={styles.title1}>Select Your File</Text>
            )}

            <View style={styles.radioContainer}>
              {feedBackUserJob && profileApply ? (
                <TouchableOpacity
                  style={styles.radioButton}
                  key={CVApplied?.id}
                  onPress={() =>
                    profileApply?.cvPath &&
                    Linking.openURL(profileApply?.cvPath)
                  }
                >
                  <View
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Text style={styles.cvText} numberOfLines={1}>
                      {CVApplied?.name ?? "Your CV"}
                    </Text>

                    {hasAppliedJobActivity?.applicationDate && (
                      <View style={styles.location}>
                        <Icon name="access-time" size={20} color="#808080" />
                        <Text style={styles.locationtext}>
                          {formatDateTime(
                            hasAppliedJobActivity.applicationDate
                          )}
                        </Text>
                      </View>
                    )}
                  </View>
                  {/* <RadioButton
                    value={CVApplied?.name ?? ""}
                    status={
                      selectedCVId === CVApplied?.id ? "checked" : "unchecked"
                    }
                  /> */}
                </TouchableOpacity>
              ) : (
                dataCVS.map((cv) => (
                  <TouchableOpacity
                    style={styles.radioButton}
                    onPress={() => handleSelectCV(cv.id, cv.name)}
                    key={cv.id}
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Text style={styles.cvText} numberOfLines={1}>
                        {cv.name}
                      </Text>
                    </View>
                    <RadioButton
                      value={cv.name ?? ""}
                      status={selectedCVId === cv.id ? "checked" : "unchecked"}
                      onPress={() => handleSelectCV(cv.id, cv.name)}
                    />
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
          {feedBackUserJob ? (
            <View style={styles.main1}>
              <Text style={styles.title1}>FeedBack </Text>
              <FlatList
                data={feedBackUserJob.jobPostActivityComments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={{ width: "100%" }}>
                    <View style={styles.commentContainer}>
                      <Text style={styles.commentText}>{item.commentText}</Text>
                      <Text style={styles.commentDate}>
                        {new Date(item.commentDate).toLocaleDateString()}
                      </Text>
                      <View style={styles.ratingContainer}>
                        {Array.from({ length: item.rating }).map((_, index) => (
                          <Icon
                            key={index}
                            name="star"
                            size={20}
                            color="gold"
                          />
                        ))}
                      </View>
                    </View>
                    {/* <View style={styles.line}></View> */}
                  </View>
                )}
              />
            </View>
          ) : (
            <View style={styles.main1}>
              <Text style={styles.title1}>Information</Text>

              <TextInputComponent
                text={name ? name : ""}
                setText={setName}
                boolean={false}
                name="Fullname"
                placeholder="Input Your FullName"
              />

              <TextInputComponent
                text={email ? email : ""}
                setText={setEmail}
                name="Email"
                placeholder=""
                boolean={false}
              />
              <TextInputComponent
                text={phone ? phone : ""}
                setText={setPhone}
                boolean={false}
                name="Phone Number"
                placeholder="Optional"
              />
              {/* <TextInputComponent
                text={coverLetter}
                setText={setCoverLetter}
                boolean={false}
                name="Phone Number"
                placeholder="Optional"
              /> */}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.save}>
        {hasAppliedJobActivity ? (
          <TouchableOpacity style={styles.buttonsaveApplied}>
            <Text style={styles.textsave}>Applied</Text>
          </TouchableOpacity>
        ) : ApplyPending ? (
          <TouchableOpacity
            style={styles.buttonsave}
            onPress={handleSendCvApply}
          >
            <Text style={styles.textsave}>wait a seconds</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.buttonsave}
            onPress={handleSendCvApply}
          >
            <Text style={styles.textsave}>Confirm Apply</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  main: {
    paddingTop: 20,
    paddingBottom: 60,
    flexDirection: "column",
    gap: 10,
  },
  main1: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "column",
    gap: 10,
    // alignItems: "flex-start",
    // justifyContent: "flex-start",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF4500",
    lineHeight: 30,
  },
  title1: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 30,
  },
  companyText: {
    fontSize: 15,
    fontWeight: "bold",
    lineHeight: 22.5,
  },
  location: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  locationCo: {
    flexDirection: "column",
    gap: 5,
    // alignItems: "center",
    justifyContent: "flex-start",
  },

  locationtext: {
    fontSize: 15,
    lineHeight: 22.5,
  },
  tax: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  taxtext: {
    color: "#0AB305",
    fontSize: 15,
    lineHeight: 22.5,
  },
  post: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  posttext: {
    fontSize: 12,
    lineHeight: 18,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  uploadText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#1E90FF",
    fontWeight: "bold",
  },
  hintText: {
    marginTop: 5,
    fontSize: 12,
    color: "#808080",
  },
  selectedFileText: {
    marginTop: 10,
    fontSize: 14,
    color: "#1E90FF",
  },
  radioContainer: {
    marginTop: 10,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
    width: "100%",
  },
  cvText: {
    fontSize: 16,
    flexShrink: 1,
  },
  save: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    position: "absolute",
    width: "100%",
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonsave: {
    width: "100%",
    paddingVertical: 10,
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    backgroundColor: "#FF5A5F",
    borderRadius: 8,
  },
  buttonsaveApplied: {
    width: "100%",
    paddingVertical: 10,
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    backgroundColor: "#DEDEDE",
    borderRadius: 8,
  },
  textsave: {
    color: "white",
    fontSize: 20,
    lineHeight: 30,
    fontWeight: "bold",
  },
  commentContainer: {
    // padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,

    // width:'100%'
  },
  line: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  line1: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  commentText: {
    fontSize: 16,
    marginBottom: 5,
  },
  commentDate: {
    fontSize: 12,
    color: "#777",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
  },
});
