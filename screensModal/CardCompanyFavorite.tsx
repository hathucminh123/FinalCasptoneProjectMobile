import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { GetJobPost } from "../Services/JobsPost/GetJobPosts";
import { PostFollowCompany } from "../Services/FollowCompany/PostFollowCompany";
import { queryClient } from "../Services/mainService";
import { DeleteFollowCompany } from "../Services/FollowCompany/DeleteFollowCompany";
import { GetFollowCompany } from "../Services/FollowCompany/GetFollowCompany";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import AuthModal from "./AuthModal";
import { useFocusEffect } from "@react-navigation/native";

const SkillSet = ["PHP", "Front End", "Java", "End", "Javascript"];

type InfoLineProps = {
  icon: string;
  text: string;
};

const InfoLine = ({ icon, text }: InfoLineProps) => (
  <View style={styles.line}>
    <Icon name={icon} size={20} color="#808080" />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

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
  data: Company | undefined;
  navigation: any;
  jobs: JobPost[] | undefined;
}

export default function CardCompanyFavorite({
  data,
  navigation,
  jobs,
}: CardEmployerProps) {
  const [follow, setFollow] = useState<boolean>(false);
  const { data: JobPosts } = useQuery({
    queryKey: ["JobPosts"],
    queryFn: ({ signal }) => GetJobPost({ signal: signal }),
    staleTime: 5000,
  });
  const JobPostsdata = JobPosts?.JobPosts;

  const skills = jobs?.map((skill) => skill.skillSets);
  const flattenedArray = skills?.flat();
  const uniqueArray = [...new Set(flattenedArray)];

  const city = jobs?.map((city) => city.jobLocationCities);
  const flattenedArrayCity = city?.flat();
  console.log("aduphong1", city);
  const uniqueArrayCity = [...new Set(flattenedArrayCity)];

  const cityColumn = uniqueArrayCity;

  const { mutate } = useMutation({
    mutationFn: PostFollowCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["FollowCompany"],
        refetchType: "active",
      });
      Alert.alert(`Follow ${data?.companyName} Successfully`);
    },
    // onError: () => {
    //   Alert.alert(`Failed to Follow ${data?.companyName} `);
    // },
  });
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
    }, [token])
  );
  const { mutate: Unfollow } = useMutation({
    mutationFn: DeleteFollowCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["FollowCompany"],
        refetchType: "active",
      });
      Alert.alert(`Unfollow ${data?.companyName} Successfully`);
    },
    onError: () => {
      Alert.alert(`Failed to UnFollow ${data?.companyName} `);
    },
  });
  const { data: FollowCompany } = useQuery({
    queryKey: ["FollowCompany"],
    queryFn: ({ signal }) => GetFollowCompany({ signal }),
    staleTime: 5000,
    enabled: !!token,
  });
  const FollowCompanydata = FollowCompany?.Companies;

  const haveFollow = FollowCompanydata?.find(
    (item) => item.id === Number(data?.id)
  );
  const [modalVisibleLogin, setModalVisibleLogin] = useState<boolean>(false);
  const handleFollow = async () => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
      return;
    }
    mutate({
      data: {
        companyId: Number(data?.id),
      },
    });
  };
  const handleUnFollow = () => {
    Unfollow({ id: Number(haveFollow?.id) });
  };
  return (
    <View style={styles.card}>
      <Image
        source={{
          uri: data?.imageUrl,
        }}
        style={styles.image}
      />
      <View style={styles.main1}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("CompanyDetail", {
              id: data?.id,
              companyDetail: JSON.stringify(data),
            })
          }
        >
          <Text style={{ fontSize: 20, lineHeight: 30 }}>
            {data?.companyName}
          </Text>
        </TouchableOpacity>

        {/* Skill List */}
        <View style={styles.skillList}>
          {/* {data?.jobPosts.map((job, jobIndex) => {
            const jobSkill = JobPostsdata?.find((item) => item.id === job.id);
            return jobSkill?.skillSets?.map((tag, tagIndex) => (
              <TouchableOpacity
                key={`${jobIndex}-${tagIndex}`}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{tag}</Text>
              </TouchableOpacity>
            ));
          })} */}

          {uniqueArray.map((tag, index) => (
            <TouchableOpacity key={index} style={styles.button}>
              <Text style={styles.buttonText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location */}
        <View style={styles.location}>
          <Icon name="location-on" size={20} color="#808080" />
          {cityColumn.length && cityColumn.length > 0 ? (
            cityColumn?.slice(0, 3).map((item, index) => (
              <Text
                key={index}
                style={styles.locationtext}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item}
                {","}
                {/* {data?.address} in {data?.city} */}
              </Text>
            ))
          ) : (
            <Text
              style={styles.locationtext}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {data?.address} in {data?.city}
            </Text>
          )}
          {/* <Text
            style={styles.locationtext}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {data?.address} in {data?.city}
          </Text> */}
        </View>

        {/* Info Lines */}
        <View style={styles.line2}>
          <InfoLine icon="group" text={`${data?.numberOfEmployees} employees`} />
          <InfoLine icon="work" text={`${data?.jobPosts?.length} jobs`} />
        </View>

        {/* Job Tags */}
        <View style={styles.location}>
          <Icon name="folder" size={20} color="#808080" />
          <View style={styles.tagContainer}>
            {data?.businessStream && (
              <Text style={styles.tagText}>
                {data?.businessStream.businessStreamName},
              </Text>
            )}
          </View>
          {/* <AuthModal
            visible={modalVisibleLogin}
            onClose={() => setModalVisibleLogin(false)}
            navigation={navigation}
          /> */}
        </View>
      </View>
      <View style={styles.icon}>
        {haveFollow && token ? (
          <TouchableOpacity onPress={handleUnFollow}>
            <Icon name={"bookmark"} size={30} color="#808080" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleFollow}>
            <Icon name={"bookmark-border"} size={30} color="#808080" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#dedede",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    position: "relative",
    gap: 20,
  },
  image: {
    height: 48,
    width: 48,
    backgroundColor: "white",
  },
  main1: {
    flexDirection: "column",
    gap: 10,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexShrink: 1,
  },
  skillList: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  button: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#dedede",
    marginRight: 10,
    marginBottom: 10,
    maxWidth: "100%", // Ensures buttons don't overflow
  },
  buttonText: {
    color: "#6c6c6c",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500",
    textAlign: "center",
    flexShrink: 1, // Ensures text inside the button shrinks when necessary
  },
  location: {
    flexDirection: "row",

    gap: 5,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  locationtext: {
    fontSize: 15,
    lineHeight: 30,
    flexShrink: 1,
  },
  line2: {
    flexDirection: "row",
    alignItems: "center",
    gap: 50,
  },
  line: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  infoText: {
    fontSize: 15,
    lineHeight: 20,
  },
  tagContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 5,
  },
  tagText: {
    fontSize: 13,
    lineHeight: 20,
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 8,
  },
});
