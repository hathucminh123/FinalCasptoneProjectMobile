import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { FontAwesome } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigationState } from "@react-navigation/native";
import { AxiosResponse } from "axios";
import { GetNotifications } from "../../Services/JobsPostActivity/GetNotifications";
import {
  HttpTransportType,
  HubConnectionBuilder,
  IHttpConnectionOptions,
} from "@microsoft/signalr";
import { signalR } from "../../Services/mainService";

import { useQuery } from "@tanstack/react-query";
import { GetUserProfile } from "../../Services/UserProfileService/UserProfile";
import VerificationModal from "../Employer/VerificationModal";

import { AppProvider } from "../Employer/Context";

import { useAppContext } from "../Employer/Context";

export interface Notification {
  id: number;
  title: string;
  description: string;
  receiverId: number;
  isRead: boolean;
  jobPostActivityId: number;
  jobPostActivity: any;
  userAccount: any;
  createdDate: string;
  modifiedDate: any;
  createdBy: any;
  modifiedBy: any;
  isDeleted: boolean;
}

export default function SidebarEmployer(props: any) {
  const { navigation } = props;
  const [loading, setLoading] = useState(false);
  const currentRoute = useNavigationState((state) => state.routes[state.index]);
  const [token, setToken] = useState<string | null>("");
  const { notifications, setNotifications } = useAppContext();
  // const [notifications, setNotifications] = useState<Notification[]>([]);
  const [UserId, setUserId] = useState<string | null>(null);
  const [Auth, setAuth] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      const Auth = await AsyncStorage.getItem("Auth");
      const CompanyId = await AsyncStorage.getItem("CompanyId");
      const token = await AsyncStorage.getItem("token");
      setAuth(Auth);
      setUserId(id);
      setCompanyId(CompanyId);
      setToken(token);
    };

    fetchUserId();
  }, []);

  const { data: UserProfile } = useQuery({
    queryKey: ["UserProfile"],
    queryFn: ({ signal }) =>
      GetUserProfile({ id: Number(UserId), signal: signal }),
    staleTime: 1000,
  });

  const userName = `${UserProfile?.UserProfiles?.firstName ?? ""} ${
    UserProfile?.UserProfiles?.lastName ?? ""
  }`;

  const startConnection = async () => {
    try {
      const options: IHttpConnectionOptions = {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => {
          return `${token}`;
        },
      };

      const connection = new HubConnectionBuilder()
        .withUrl(signalR.employer.getNotificationsURL, options)
        .build();

      connection.on(
        signalR.employer.groupNotificationsKey,
        async (receivedMessage) => {
          await fetchNotifications();
          console.log(`Notify: ${receivedMessage}`);
        }
      );

      connection.onclose(() => {
        console.log("closed");
      });

      await connection.start();
      return () => {
        connection.stop();
      };
    } catch (error) {
      console.log(error);
    }
  };
  const fetchNotifications = async () => {
    try {
      var response: AxiosResponse = await GetNotifications();
      if (response?.status === 200) {
        const notifications = response.data as Notification[];
        setNotifications(notifications);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    startConnection();
    fetchNotifications();
  }, []);

  const handleNavigate = () => {
    if (companyId === "null") {
      setModalVisible(true);
      return;
    } else {
      navigation.navigate("CreateJob");
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await AsyncStorage.clear();
      await AsyncStorage.setItem("redirectPath", currentRoute.name);
      navigation.replace(currentRoute.name);
      navigation.navigate("LoginEmployer");
    } catch (e) {
      console.error("Failed to sign out.", e);
    }
  };

  const handleNavigateVerifi = () => {
    //  navigation.navigate("Recruitment")
    //  setModalVisible(false)

    if (companyId === "null") {
      setModalVisible(true);
      return;
    } else {
      navigation.navigate("Recruitment");
    }
  };

  const handleNavigateCompany = () => {
    navigation.navigate("CompanyInfo");
    setModalVisible(false);
  };

  const handleSignIn = () => {
    navigation.navigate("Login");
  };
  const [drop, setDrop] = useState<boolean>(false);
  const handleOpen = () => {
    setDrop(!drop);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <VerificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onNavigate={handleNavigateCompany}
        userName={userName}
      />
      {token ? (
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: "https://tuyendung.topcv.vn/app/_nuxt/img/noavatar-2.18f0212.svg",
            }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userRole}>Employer</Text>
          <Text style={styles.welcomeText}>Welcome Back!</Text>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => navigation.navigate("Personal")}
          >
            <Icon name="security" size={18} color="#fff" />
            <Text style={styles.updateButtonText}>
              Update account information
            </Text>
            <Icon name="chevron-right" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.customLinks}>
          <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
            <Text style={[styles.linkText, { color: "white" }]}>Login</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.customLinks}>
        <TouchableOpacity
          style={styles.linkItem}
          onPress={handleNavigateVerifi}
        >
          <Icons name="newspaper" size={20} color="#000" />
          <Text style={styles.linkText}>Recruitment news</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.linkItem}
          onPress={() => navigation.navigate("ManageCVs")}
        >
          <Icon name="folder-open" size={20} color="#000" />
          <Text style={styles.linkText}>Manage CVs</Text>
          <TouchableOpacity style={styles.chevron} onPress={handleOpen}>
            <Icon
              name="chevron-right"
              size={20}
              color="#000"
              style={styles.chevron}
            />
          </TouchableOpacity>
        </TouchableOpacity> */}
        {drop && (
          <TouchableOpacity style={styles.linkItem}>
            <Icon name="search" size={20} color="#000" />
            <Text style={styles.linkText}>find CVs</Text>
            <TouchableOpacity
              style={styles.chevron}
              onPress={handleOpen}
            ></TouchableOpacity>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.linkItem}
          onPress={() => navigation.navigate("NotificationSystem")}
        >
          <Icon name="notifications" size={20} color="#000" />

          <Text style={styles.linkText}>System notification</Text>
          {notifications && notifications.some((notify) => !notify.isRead) ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {notifications.filter((notify) => !notify.isRead)?.length}
              </Text>
            </View>
          ) : undefined}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkItem}
          // onPress={handleNavigateVerifi}
          onPress={() => navigation.navigate("Billing")}
        >
          <Icons name="newspaper" size={20} color="#000" />
          <Text style={styles.linkText}>Transaction Billing</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.linkItem}
          onPress={() => navigation.navigate("Talents")}
        >
          <Icons name="account-search" size={20} color="#000" />
          <Text style={styles.linkText}>Find Talents</Text>
        </TouchableOpacity> */}
      </View>

      {/* Sign out */}
      {token && (
        <TouchableOpacity style={styles.lineItem} onPress={handleSignOut}>
          <FontAwesome name="sign-out" size={20} color="red" />
          <Text style={[styles.linkText, { color: "red" }]}>Sign Out</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={100} color="#0000ff" />
        </View>
      )}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#f5f8fa",
    paddingHorizontal: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#303235",
  },
  userRole: {
    fontSize: 14,
    color: "#666",
  },
  welcomeText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 20,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6f61",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginTop: 10,
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 14,
    marginHorizontal: 10,
    fontWeight: "500",
  },
  customLinks: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  linkText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#000",
  },
  chevron: {
    marginLeft: "auto",
  },
  notificationBadge: {
    backgroundColor: "#ff6f61",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: "auto",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
  },
  lineItem: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "#fff",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 15,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loginButton: {
    backgroundColor: "#FF4500",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
});
