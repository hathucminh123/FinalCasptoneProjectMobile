import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome";
import CompaniesScreen from "../../screens/CompaniesScreen";
import PersonalScreen from "../../screens/PersonalScreen";
import { ProfileScreenWithDrawerEmployer } from "../../App";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import PersonalInfo from "../../screens/Employer/PersonalInfo";
import ChangePassword from "../../screens/Employer/ChangePassword";
import CompanyInfo from "../../screens/Employer/CompanyInfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InfoCompany from "../../screens/Employer/InfoCompany";

const Tab = createBottomTabNavigator();

export default function BottomEmployerAccount({
  navigation,
}: BottomTabScreenProps<any>) {
  const [userId, setUserId] = useState<string | null>(null);
  const [auth, setAuth] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  useEffect(() => {
    // Fetch user ID and auth info from AsyncStorage
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      const auth = await AsyncStorage.getItem("Auth");
      const companyId = await AsyncStorage.getItem("CompanyId");
      setAuth(auth);
      setUserId(id);
      setCompanyId(companyId);
    };

    fetchUserId();
  }, []);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName = "circle"; // Default icon

          switch (route.name) {
            case "Personal":
              iconName = "user"; // Personal = user icon
              break;
            case "Password":
              iconName = "lock"; // Password = lock icon
              break;
            case "CompanyInfo":
              iconName = "building"; // CompanyInfo = building icon
              break;
            default:
              iconName = "circle"; // Default fallback
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FF4500",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Personal" options={{ headerShown: false }}>
        {() => (
          <ProfileScreenWithDrawerEmployer
            component={PersonalInfo}
            headerType="main"
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Password" options={{ headerShown: false }}>
        {() => (
          <ProfileScreenWithDrawerEmployer
            component={ChangePassword}
            headerType="main"
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="CompanyInfo" options={{ headerShown: false }}>
        {() => (
          <ProfileScreenWithDrawerEmployer
            component={InfoCompany}
            headerType="main"
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
