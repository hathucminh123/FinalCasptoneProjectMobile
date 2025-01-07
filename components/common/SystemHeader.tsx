import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Alert, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons"; // Replace with `MaterialIcons` or any other icon library
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { GetUserProfile } from "../../Services/UserProfileService/UserProfile";
import VerificationModal from "../Employer/VerificationModal";
import PaymentModal from "../../screensModal/Employer/PaymentModal";

interface Props {
  setOpen?: Dispatch<SetStateAction<boolean>>;
  open?: boolean;
  token?: unknown;
  navigation: any;
}

const { width, height } = Dimensions.get("window"); // Get device dimensions for responsive design

const notifications = [
  {
    id: 1,
    title: "Thông báo từ hệ thống",
    message: "Bạn quá giỏi nên không có gì thông báo",
    date: "26/9/2024",
    isRead: false,
  },
  {
    id: 2,
    title: "Cập nhật hệ thống",
    message: "Phiên bản mới đã được phát hành.",
    date: "27/9/2024",
    isRead: false,
  },
  {
    id: 3,
    title: "Lịch bảo trì",
    message: "Hệ thống sẽ bảo trì vào cuối tuần.",
    date: "28/9/2024",
    isRead: true,
  },
];

export default function HeaderSystemEmployer({ setOpen, open, token, navigation }: Props) {
  const [openProfile, setOpenProfile] = useState<boolean>(false);
  const [openModalNotification, setOpenModalNotification] = useState<boolean>(false);
  // const [companyId, setCompanyId] = useState<string | null>(null);

  const [UserId, setUserId] = useState<string | null>(null);
  const [Auth, setAuth] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      const Auth = await AsyncStorage.getItem("Auth");
      const CompanyId = await AsyncStorage.getItem("CompanyId");
      setAuth(Auth);
      setUserId(id);
      setCompanyId(CompanyId);
    };

    fetchUserId();
  }, []);
  // useEffect(() => {
  //   const storedCompanyId = "123"; 
  //   setCompanyId(storedCompanyId);
  // }, []);

  const handleOpenProfile = () => setOpenProfile(!openProfile);

  const handleLogout = () => {
    Alert.alert("Logout", "You have been logged out.");
    // Clear storage and navigate to login
    // navigation.navigate("LoginScreen");
  };

  const handleOpenNotification = () => {
    setOpenModalNotification(!openModalNotification);
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [openModalPayment,setOpenModalPayment]=useState<boolean>(false)

  const handleNavigate = () => {
    if (companyId === "null") {
      setModalVisible(true);
      return
    } else  {
      navigation.navigate("CreateJob");
    }
    // setOpenModalPayment(true)
  };


  const handleOnclose=()=>{
    setOpenModalPayment(false)
  }

  const handleNavigateCompany =()=>{
    navigation.navigate("CompanyInfo");
    setModalVisible(false)
  }
 ;
  const { data: UserProfile } = useQuery({
    queryKey: ["UserProfile"],
    queryFn: ({ signal }) =>
      GetUserProfile({ id: Number(UserId), signal: signal }),
    staleTime: 1000,
  });

  const userName = `${UserProfile?.UserProfiles?.firstName ?? ""} ${
    UserProfile?.UserProfiles?.lastName ?? ""
  }`;

  return (
    <View style={styles.header}>
      <VerificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onNavigate={handleNavigateCompany}
        userName={userName}
      />
      {openModalPayment && (<PaymentModal onClose={handleOnclose} navigation={navigation}/>)}
      <View style={styles.nav}>
        <TouchableOpacity style={styles.logo} onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Amazing Job</Text>
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleNavigate}>
            <Icon name="create" size={24} color="#fff" />
            <Text style={styles.actionText}>Job Posts</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.actionButton} onPress={handleOpenNotification}>
            <Icon name="notifications" size={24} color="#fff" />
            {notifications.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.profileButton} onPress={handleOpenProfile}>
            <Image
              source={{ uri: "https://tuyendung.topcv.vn/app/_nuxt/img/noavatar-2.18f0212.svg" }}
              style={styles.profileImage}
            />
            <Icon name="arrow-drop-down" size={24} color="#fff" />
          </TouchableOpacity> */}
        </View>
      </View>

      {openModalNotification && (
        <View style={styles.notificationModal}>
          <Text style={styles.notificationTitle}>Notifications</Text>
          <ScrollView>
            {notifications.map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationDate}>{notification.date}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    backgroundColor: "#212f3f",
    justifyContent: "center",
    paddingHorizontal: width * 0.04, 
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    padding: 10, 
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  actionText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#da4538",
    borderRadius: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  notificationModal: {
    position: "absolute",
    top: 64,
    right: width * 0.04, 
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 15,
    maxHeight: height * 0.5, 
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  notificationItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e8edf2",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#212f3f",
  },
  notificationDate: {
    fontSize: 12,
    color: "#888",
  },
});
