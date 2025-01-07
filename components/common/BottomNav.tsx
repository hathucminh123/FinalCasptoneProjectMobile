import React, { useCallback, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome";
import HomeScreen from "../../screens/HomeScreen";
import CompaniesScreen from "../../screens/CompaniesScreen";
import PersonalScreen from "../../screens/PersonalScreen";
import { ProfileScreenWithDrawer } from "../../App";
import {
  BottomTabNavigationOptions,
  BottomTabScreenProps,
} from "@react-navigation/bottom-tabs";
import MyJobs from "../../screens/MyJobs";
// import AdvancedSearch from "../../screens/AdvancedSearch";
// import ChatBoxScreen from "../../screens/ChatBoxScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import ChatBox from "../../screens/ChatBoxScreen";
const Tab = createBottomTabNavigator();

export default function BottomNav({ navigation }: BottomTabScreenProps<any>) {
  const [Auth, setAuth] = useState<string | null>("");
  const [UserId, setUserId] = useState<string | null>("");
  const [token, setToken] = useState<string | null>("");
  const [email, setEmail] = useState<string | null>("");
  console.log("tokenne", token);
  console.log();
  const fetchUserData = async () => {
    const id = await AsyncStorage.getItem("userId");
    const auth = await AsyncStorage.getItem("Auth");
    const token = await AsyncStorage.getItem("token");
    const Email = await AsyncStorage.getItem("Email");
    setToken(token);
    setAuth(auth);
    setUserId(id);
    setEmail(Email);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData(); // Fetch Auth and UserId on focus
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName = "circle";

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Companies") {
            iconName = "building";
          } else if (route.name === "Account") {
            iconName = "user";
          } else if (route.name === "My Jobs") {
            iconName = "briefcase";
          } else if (route.name === "Advance Search") {
            iconName = "search";
          } else if (route.name === "ChatBox") {
            iconName = "comments";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FF4500",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" options={{ headerShown: false }}>
        {() => (
          <ProfileScreenWithDrawer component={HomeScreen} headerType="main" />
        )}
      </Tab.Screen>

      <Tab.Screen name="Companies" options={{ headerShown: false }}>
        {() => (
          <ProfileScreenWithDrawer
            component={CompaniesScreen}
            headerType="main"
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="My Jobs" options={{ headerShown: false }}>
        {() => <ProfileScreenWithDrawer component={MyJobs} headerType="main" />}
      </Tab.Screen>
      {Auth && token ? (
        <Tab.Screen name="ChatBox" options={{ headerShown: false }}>
          {() => <ProfileScreenWithDrawer component={ChatBox} />}
        </Tab.Screen>
      ) : null}
      {/* {Auth && token && (
        <Tab.Screen
          name="ChatBox"
          component={() => (
            <ProfileScreenWithDrawer component={ChatBox} headerType="chat" />
          )}
          options={{ headerShown: false }}
        />
      )} */}

      {/* <Tab.Screen name="Advance Search" options={{ headerShown: false }}>
        {() => (
          <ProfileScreenWithDrawer
            component={AdvancedSearch}
            headerType="main"
          />
        )}
      </Tab.Screen> */}

      <Tab.Screen name="Account" options={{ headerShown: false }}>
        {() => (
          <ProfileScreenWithDrawer
            component={PersonalScreen}
            headerType="account"
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
