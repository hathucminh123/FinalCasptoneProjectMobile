import React, { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import RenderHtml from "react-native-render-html";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PostFollowCompany } from "../Services/FollowCompany/PostFollowCompany";
import { queryClient } from "../Services/mainService";
import { DeleteFollowCompany } from "../Services/FollowCompany/DeleteFollowCompany";
import { GetFollowCompany } from "../Services/FollowCompany/GetFollowCompany";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthModal from "./AuthModal";
import { useFocusEffect } from "@react-navigation/native";
import { GetJobPost } from "../Services/JobsPost/GetJobPosts";

interface BusinessStream {
  id: number;
  businessStreamName: string;
  description: string;
}

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
  jobType: JobType;
  jobLocationCities: string[];
  jobLocationAddressDetail: string[];
  skillSets: string[];
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

interface CardEmployerProps {
  data: Company;
  navigation: any;
}

export default function CompanyCard({ data, navigation }: CardEmployerProps) {
  const [modalVisibleLogin, setModalVisibleLogin] = useState<boolean>(false);
  const [showMore, setShowMore] = useState<boolean>(false); // State to handle show more/less
  const [token, setToken] = useState<string | null>("");
  const fetchUserData = async () => {
    const id = await AsyncStorage.getItem("userId");
    const auth = await AsyncStorage.getItem("Auth");
    const token = await AsyncStorage.getItem("token");
    setToken(token);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData(); // Fetch Auth and UserId on focus
    }, [])
  );
  const toggleShowMore = () => {
    setShowMore(!showMore);
    navigation.navigate("CompanyDetail", {
      id: data?.id,
      companyDetail: JSON.stringify(data),
    });
  };
  const { mutate: followCompany } = useMutation({
    mutationFn: PostFollowCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["FollowCompany"],
        refetchType: "active",
      });
      Alert.alert(`Followed ${data?.companyName} successfully`);
    },
    onError: () => {
      Alert.alert(`Failed to follow ${data?.companyName}`);
    },
  });

  const { mutate: unfollowCompany } = useMutation({
    mutationFn: DeleteFollowCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["FollowCompany"],
        refetchType: "active",
      });
      Alert.alert(`Unfollowed ${data?.companyName} successfully`);
    },
    onError: () => {
      Alert.alert(`Failed to unfollow ${data?.companyName}`);
    },
  });

  const { data: FollowCompany } = useQuery({
    queryKey: ["FollowCompany"],
    queryFn: GetFollowCompany,
    staleTime: 5000,
    enabled: !!token,
  });

  const haveFollow = FollowCompany?.Companies?.find(
    (item) => item.id === Number(data.id)
  );

  const handleFollow = async () => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
      return;
    }
    followCompany({ data: { companyId: Number(data.id) } });
  };

  const handleUnFollow = async () => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
      return; // Prevent unfollowing if not authenticated
    }
    unfollowCompany({ id: Number(haveFollow?.id) });
  };

  const { width } = Dimensions.get("window");

  const { data: JobPosts } = useQuery({
    queryKey: ["JobPosts"],
    queryFn: ({ signal }) => GetJobPost({ signal: signal }),
    staleTime: 5000,
  });
  const JobPostsdata = JobPosts?.JobPosts;

  const jobsInCompany = JobPostsdata?.filter(
    (item) => item.companyId === data.id
  );

  const skills = jobsInCompany?.map((skill) => skill.skillSets);
  const flattenedArray = skills?.flat();
  const uniqueArray = [...new Set(flattenedArray)];
console.log('realy',uniqueArray)
  return (
    <View style={styles.main}>
   {data.imageUrl && <Image source={{ uri: data.imageUrl }} style={styles.logo} />}

      <View style={styles.main2}>
        <View style={styles.header}>
          <View style={styles.img}>
            <Image
              source={{ uri: data.imageUrl }}
              style={styles.logo1}
              resizeMode="contain"
            />
          </View>
          <View style={styles.main3}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CompanyDetail", {
                  id: data?.id,
                  companyDetail: JSON.stringify(data),
                })
              }
            >
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={styles.textStyle}
              >
                {data.companyName}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* <View style={styles.text} numberOfLines={2} ellipsizeMode="tail">
          <RenderHtml contentWidth={width} source={{ html: data.companyDescription }} />
        </View> */}
       <View>
  <View style={styles.clippedContainer}>
    <RenderHtml
      contentWidth={width}
      source={{ html: data.companyDescription }}
    />
  </View>

  <TouchableOpacity onPress={toggleShowMore}>
    <Text style={styles.readMoreText}>
      {showMore ? "Show less" : "Read more"}
    </Text>
  </TouchableOpacity>
</View>


        <View style={styles.job}>
          <Icon name="work" size={30} color="#808080" />
          <Text style={styles.text}>{data.jobPosts.length} Jobs</Text>
        </View>

        <View style={styles.skill}>
          <View style={styles.skillList}>
            {/* {data.jobPosts.map((job) =>
              job.skillSets.map((tag, index) => (
                <TouchableOpacity key={index} style={styles.button}>
                  <Text style={styles.buttonText}>{tag}</Text>
                </TouchableOpacity>
              ))
            )} */}
            {uniqueArray.slice(0,6).map((tag, index) => (
              <TouchableOpacity key={index} style={styles.button}>
                <Text style={styles.buttonText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View>
            {haveFollow && token ? (
              <TouchableOpacity onPress={handleUnFollow}>
               
                <Icon name="bookmark" size={30} color="#808080" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleFollow}>
                <Icon name="bookmark-border" size={30} color="#808080" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <AuthModal
          visible={modalVisibleLogin}
          onClose={() => setModalVisibleLogin(false)}
          navigation={navigation}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flexDirection: "column",
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
    height:520
  },
  logo: {
    height: 150,
    width: "100%",
    resizeMode: "cover",
    backgroundColor: "#f0f0f0", // Placeholder background color
  },
  main2: {
    padding: 16,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  img: {
    justifyContent: "center",
    alignItems: "center",
    height: 70,
    width: 70,
    borderRadius: 35,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    overflow: "hidden",
  },
  logo1: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  main3: {
    marginLeft: 12,
    flexShrink: 1,
  },
  textStyle: {
    color: "#333333",
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 26,
    flexShrink: 1,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: "#666666",
    marginTop: 4,
  },
  readMoreText: {
    color: "#FF4500",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 5,
  },
  job: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  skill: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  skillList: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  button: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: "#444444",
    fontSize: 13,
    fontWeight: "500",
  },
  followButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF4500",
    backgroundColor: "#FFFAF5",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  followButtonText: {
    color: "#FF4500",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  clippedContainer: {
    height: 80, // 3 lines * 24px line height
    lineHeight: 24, // Set line height
    overflow: "hidden", // Hide content that overflows
    marginBottom: 5,
  },
  // readMoreText: {
  //   color: "#FF4500",
  //   fontSize: 14,
  //   fontWeight: "600",
  //   textAlign: "right",
  //   marginTop: 5,
  // },
});

