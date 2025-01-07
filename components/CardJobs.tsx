// import { Link } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { GetFavoriteJobs } from "../Services/FavoriteJobs/GetFavoriteJobs";
import { PostFavoriteJobs } from "../Services/FavoriteJobs/PostFavoriteJobs";
import { queryClient } from "../Services/mainService";
import { DeleteFavoriteJobs } from "../Services/FavoriteJobs/DeleteFavoriteJobs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthModal from "./AuthModal";
import BenefitsList from "./Employer/BenefitList";
// import Image1 from './../assets/download.png'
interface JobType {
  id: number;
  name: string;
  description: string;
}

interface Benefits {
  id: number;
  name: string;
  // shorthand: string;
  // description: string;
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
  minsalary?: number;
  isHot?: boolean;
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
  benefitObjects?: Benefits[];
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
  data: JobPost | undefined;
  // img: string | undefined;
  company: Company | undefined;
  navigation: any;
}

export default function CardJobs({ data, company, navigation }: props) {
  const jobDetailHref = `/job/${data?.id}`;
  const [follow, setFollow] = useState<boolean>(false);
  const [modalVisibleLogin, setModalVisibleLogin] = useState<boolean>(false);
  const formatDateTime = (dateString: string | undefined) => {
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        // hour: "2-digit",
        // minute: "2-digit",
      });
    }

    // Return a fallback value if dateString is undefined
    return "Invalid date";
  };

  const pendingJobsArray = [];
  pendingJobsArray.push(data);
  const city = pendingJobsArray?.map((city) => city?.jobLocationCities);
  const flattenedArrayCity = city?.flat();
  console.log("aduphong1", city);
  const uniqueArrayCity = [...new Set(flattenedArrayCity)];

  const cityColumn = uniqueArrayCity;
  const { mutate: SaveJobs } = useMutation({
    mutationFn: PostFavoriteJobs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["FavoriteJob"],
        refetchType: "active",
      });
      // setFavorite(true)

      Alert.alert(`Save ${data?.jobTitle} Successfully`);
    },
    onError: () => {
      Alert.alert(`Failed to Follow ${data?.jobTitle} `);
    },
  });
  const { mutate: UnfollowJobs } = useMutation({
    mutationFn: DeleteFavoriteJobs,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["FavoriteJob"],
        refetchType: "active",
      });
      // setFavorite(false)
      Alert.alert(`Unsaved ${data?.jobTitle} Successfully`);
    },
    onError: () => {
      Alert.alert(`Failed to UnFollow ${data?.jobTitle} `);
    },
  });
  const { data: FavoriteJob } = useQuery({
    queryKey: ["FavoriteJob"],
    queryFn: ({ signal }) => GetFavoriteJobs({ signal }),
    staleTime: 5000,
  });

  const FavoriteJobs = FavoriteJob?.JobPost;
  const haveFavorite = FavoriteJobs?.find(
    (item) => item.id === Number(data?.id)
  );

  const handleSaveJob = async () => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
      return;
    }
    SaveJobs({
      data: {
        jobPostId: Number(data?.id),
      },
    });
  };

  const handleUnFollowJobs = async () => {
    const Auth = await AsyncStorage.getItem("Auth");
    if (!Auth) {
      setModalVisibleLogin(true);
    }
    UnfollowJobs({ id: Number(haveFavorite?.id) });
  };

  return (
    <View style={styles.card}>
      {data?.isHot && (
        <View style={styles.hotBadge}>
          <Text style={styles.hotText}>Hot</Text>
        </View>
      )}

      <AuthModal
        visible={modalVisibleLogin}
        onClose={() => setModalVisibleLogin(false)}
        navigation={navigation}
      />
      <View style={styles.main}>
        <View style={styles.main1}>
          <View style={styles.main2}>
            <Image
              source={{
                uri:
                  !company?.imageUrl || company?.imageUrl === "string"
                    ? data?.imageURL
                    : company?.imageUrl,
              }}
              style={styles.image}
            />
            <Text style={styles.text} numberOfLines={2} ellipsizeMode="tail">
              {company?.companyName}
            </Text>
          </View>

          <View style={{ marginTop: 10, paddingLeft: 20, marginLeft: "auto" }}>
            {/* Nút follow/unfollow */}
            {haveFavorite ? (
              <TouchableOpacity onPress={handleUnFollowJobs}>
                <Icon name={"bookmark"} size={30} color="#808080" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSaveJob}>
                <Icon name={"bookmark-border"} size={30} color="#808080" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* <Link href={{pathname:"/JobDetail",params:{id:data?.id } }} asChild> */}

        <TouchableOpacity
          onPress={() => navigation.navigate("JobDetail", { jobId: data?.id })}
        >
          <Text style={styles.text1} numberOfLines={2} ellipsizeMode="tail">
            {data?.jobTitle}
          </Text>
        </TouchableOpacity>
        {/* </Link> */}
        <View style={styles.main3}>
          <View style={styles.location}>
            <Icon name="location-on" size={15} color="#808080" />

            {/* <View> */}

            {cityColumn.length && cityColumn.length > 0 ? (
              <View style={styles.tagContainer}>
                {data?.jobLocationCities.map((item) => (
                  <Text style={styles.locationtext}>{item} </Text>
                ))}
              </View>
            ) : (
              // <Text style={styles.locationtext}>
              //   {company?.address}
              //   {" in "} {company?.city}
              //   {data?.jobLocationCities.map((item) => (
              //     <Text style={styles.locationtext}>{item} </Text>
              //   ))}
              // </Text>
              <View style={styles.tagContainer}>
                {data?.jobLocationCities.map((item) => (
                  <Text style={styles.locationtext}>{item} </Text>
                ))}
              </View>
            )}

            {/* </View> */}
          </View>
          <View style={styles.tax}>
            <Icon name="work" size={15} color="#808080" />
            <Text style={styles.locationtext}>{data?.jobType.name} Years</Text>
          </View>

          <View style={styles.tax}>
            <Icon name="attach-money" size={15} color="#808080" />
            <Text style={styles.taxtext}>
              {" "}
              {/* {`${data?.minsalary} - ${data?.salary} VNĐ`} */}
              {data?.minsalary && data?.salary
                ? `${
                    data.minsalary >= 1000000
                      ? data.minsalary / 1000000
                      : data.minsalary
                  } ${data.minsalary >= 1000000 ? "triệu" : "VNĐ"} - ${
                    data.salary >= 1000000 ? data.salary / 1000000 : data.salary
                  } ${data.salary >= 1000000 ? "triệu" : "VNĐ"}`
                : "Salary not specified"}
            </Text>
          </View>
          <View style={styles.tax}>
            <Icon name="work" size={15} color="#808080" />
            <Text style={styles.locationtext}>
              {data?.experienceRequired} Years
            </Text>
          </View>

          <View style={styles.post}>
            <Icon name="access-time" size={15} color="#808080" />
            <Text style={styles.posttext}>
              {formatDateTime(data?.postingDate)}
            </Text>
          </View>
        </View>
        <View style={styles.skillList}>
          {data?.skillSets.map((tag, index) => (
            <TouchableOpacity key={data?.id} style={styles.button}>
              <Text style={styles.buttonText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View>
          <BenefitsList data={data?.benefitObjects} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 16,
    paddingTop: 8,
    backgroundColor: "#fff",
    flexDirection: "column",
    position: "relative",
    width: 370,
    borderColor: "#FF4500",
    borderLeftWidth: 10,
    borderWidth: 1,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },

  main: {
    paddingLeft: 12,
    paddingRight: 12,
  },

  main1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  main2: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  image: {
    height: 48,
    width: 48,
    backgroundColor: "white",
  },
  text: {
    fontSize: 16,
    lineHeight: 25,
    marginTop: 5,
    marginBottom: 5,
  },
  text1: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: "700",
    marginTop: 5,
    marginBottom: 5,
    color: "#FF4500",
  },
  main3: {
    flexDirection: "column",
    gap: 5,
    marginVertical: 5,
  },
  location: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "flex-start",
    // flexWrap: "wrap",
  },
  locationtext: {
    fontSize: 12,
    lineHeight: 18,
    flexWrap: "wrap",
  },
  tax: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  taxtext: {
    color: "#0AB305",
    fontSize: 12,
    lineHeight: 18,
  },
  post: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  posttext: {
    // color: "#0AB305",
    fontSize: 12,
    lineHeight: 18,
  },
  skillList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  button: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#dedede",
    marginRight: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#6c6c6c",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  tagContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 5,
    flexShrink: 1,
  },
  hotBadge: {
    position: "absolute",
    top: 0,
    right: 10,
    backgroundColor: "#FF4500",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    zIndex: 1,
  },
  hotText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
