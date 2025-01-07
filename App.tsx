import { NavigationContainer, RouteProp } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import DetailsScreen from "./screens/DetailsScreen";
import MainHeader from "./components/common/MainHeader";
import BottomNav from "./components/common/BottomNav";
import CompanyDetail from "./screensModal/CompanyDetail";
import JobDetail from "./screensModal/JobDetail";
import InfomationCVModal from "./screensModal/InfomationCVModal";
import GerneralInfo from "./screensModal/GerneralInfo";
import Experience from "./screensModal/Experience";
import Skills from "./screensModal/Skills";
import Education from "./screensModal/Education";
import FormSearch from "./screensModal/FormSearch";
import SeacrHeader from "./components/common/SeacrHeader";
import SearchResults from "./screensModal/SearchResults";
import SearchHeader from "./components/common/SearchHeaderr";
import SeacrHeaderr from "./components/common/SearchHeaderr";
import Notification from "./screensModal/Notification";
import Apply from "./screensModal/Apply";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./Services/mainService";
import ApplyComplete from "./screensModal/ApplyComplete";
import EducationDetailsEdit from "./screensModal/EducationDetails";
import ExperienceDetailsEdit from "./screensModal/ExperienceDetails";
import ResumeScreen from "./screensModal/CVModal";
import UploadCVScreen from "./screensModal/UploadCV";
import "react-native-gesture-handler";

import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import VerificationModal from "./screensModal/VerificationModal";
import PersonalScreen from "./screens/PersonalScreen";
import { Text, View } from "react-native";
import AccountHeader from "./components/common/AccountHeader";
import SidebarContent from "./components/SideBarContent";
import CompaniesScreen from "./screens/CompaniesScreen";
import { ComponentType } from "react";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import EmailVerification from "./screens/EmailVerification";
import CVTemplate from "./screensModal/CVTemplate";
import MinimalModal from "./screensModal/MinimalModal";
import BottomEmployerAccount from "./components/common/BottomEmployerAccount";
import HeaderSystemEmployer from "./components/common/SystemHeader";
import SidebarEmployer from "./components/common/SideBarEmployer";
import Recruitment from "./screens/Employer/Recruitment";
import CreateJob from "./screensModal/Employer/CreateJob";
import EditJobDetails from "./screensModal/Employer/EditJobDetails";
import CvAppliedScreen from "./screensModal/Employer/ViewCandidate";
import CommentScreen from "./screens/Employer/CommentScreen";
import LoginEmployerScreen from "./screens/Employer/LoginEmployerScreen";
import EmailVerificationEmployer from "./screens/Employer/EmailVerificationEmployer";
import RegisterEmployer from "./screens/Employer/RegisterEmployer";
import ManageCVs from "./screens/Employer/ManageCVs";
import NotificationSystem from "./screens/Employer/NotificationSystem";
import { AppProvider } from "./components/Employer/Context";
import CompanyInfo from "./screens/Employer/CompanyInfo";
// import { PaymentScreen } from "./screens/Employer/PaymentScreen";
import FavoriteCompany from "./screensModal/FavoriteCompany";
import Billing from "./screens/Employer/Billing";
import JobAlert from "./screensModal/JobAlert";
import RecommendTalents from "./screensModal/Employer/FindTalents";
import Benefits from "./screensModal/Benefits";
import store from "./redux/store";
import { Provider } from "react-redux";
import { ReviewCompanyModal } from "./screensModal/ReviewCompanyModal";
import { ReviewCompanySuccess } from "./screensModal/ReviewCompanySucess";
import CertificatesDetailsEdit from "./screensModal/CertificatesDetailsEdit";
import Certificates from "./screensModal/Certificates";
import Awards from "./screensModal/Adward";
import AwardDetailsEdit from "./screensModal/AwardDetailsEdit";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
type RootStackParamList = {
  AppliedCV: { jobId: number };
};

interface CvAppliedScreenProps {
  route: RouteProp<RootStackParamList, "AppliedCV">;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="BottomTabs"
              component={BottomNav}
              // options={{
              //   header: () => <MainHeader />,
              // }}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="tabsEmployer"
              component={BottomEmployerAccount}
              // options={{
              //   header: () => <MainHeader />,
              // }}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="CompanyDetail"
              component={CompanyDetail}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="JobDetail"
              component={JobDetail}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="Information"
              component={InfomationCVModal}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="General Information"
              component={GerneralInfo}
              options={{ presentation: "modal" }}
            />
           
            <Stack.Screen
              name="CVModal"
              component={ResumeScreen}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="UploadCV"
              component={UploadCVScreen}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="Experience"
              component={Experience}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="ExperienceDetailsEdit"
              component={ExperienceDetailsEdit}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="Skills"
              component={Skills}
              options={{ presentation: "modal" }}
            />
             <Stack.Screen
              name="Benefits"
              component={Benefits}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="Education"
              component={Education}
              options={{ presentation: "modal" }}
            />
              <Stack.Screen
              name="Certificates"
              component={Certificates}
              options={{ presentation: "modal" }}
            />
              <Stack.Screen
              name="Adward"
              component={Awards}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="EducationDetailsEdit"
              component={EducationDetailsEdit}
              options={{ presentation: "modal" }}
            />
             <Stack.Screen
              name="CertificatesDetailsEdit"
              component={CertificatesDetailsEdit}
              options={{ presentation: "modal" }}
            />
             <Stack.Screen
              name="AwardDetailsEdit"
              component={AwardDetailsEdit}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
            name="FormSearch"
            component={FormSearch}
            options={{ presentation: "modal", header: () => <SeacrHeader /> }}
          />
            {/* <Stack.Screen
              name="FormSearch"
              component={FormSearch}
              options={{ presentation: "modal", header: () => <SeacrHeader /> }}
            /> */}
            <Stack.Screen
              name="SearchResults"
              component={SearchResults}
              options={({ route }) => ({
                presentation: "modal",
                headerShown: false,
                // header: () => <SeacrHeaderr />,
              })}
            />
            <Stack.Screen
              name="Notification"
              component={Notification}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="Apply"
              component={Apply}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="ApplyComplete"
              component={ApplyComplete}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="VerificationModal"
              component={VerificationModal}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="CVTemplate"
              component={CVTemplate}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="MinimalTemplate"
              component={MinimalModal}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
              // options={{ presentation: "modal" }}
            />

            <Stack.Screen
              name="LoginEmployer"
              component={LoginEmployerScreen}
              options={{ headerShown: false }}
            />
           

            <Stack.Screen
              name="RegisterEmployer"
              component={RegisterEmployer}
              options={{ headerShown: false }}
              // options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="Verification"
              component={EmailVerification}
              options={{ headerShown: false }}
              // options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="VerificationEmployer"
              component={EmailVerificationEmployer}
              options={{ headerShown: false }}
              // options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="Employer"
              component={BottomEmployerAccount}
              options={{ headerShown: false }}
              // options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="CreateCompany"
              component={CompanyInfo}
              options={{ headerShown: false }}
              // options={{ presentation: "modal" }}
            />
              <Stack.Screen
              name="FavoriteCompany"
              component={FavoriteCompany}
              // options={{ headerShown: false }}
              options={{ presentation: "modal" }}
            />
            <Stack.Screen
              name="Recruitment"
              component={Recruitment}
              options={({ navigation }) => ({
                // header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            />
            {/* <Stack.Screen
              name="PaymentScreen"
              component={PaymentScreen}
              options={({ navigation }) => ({
                header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            /> */}
            <Stack.Screen
              name="ManageCVs"
              component={ManageCVs}
              options={({ navigation }) => ({
                // header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            />
            <Stack.Screen
              name="CreateJob"
              component={CreateJob}
              options={({ navigation }) => ({
                // header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            />
            <Stack.Screen
              name="EditJobDetails"
              component={EditJobDetails}
              options={({ navigation }) => ({
                // header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            />

            <Stack.Screen
              name="AppliedCV"
              component={CvAppliedScreen}
              options={({ navigation }) => ({
                // header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            />
            <Stack.Screen
              name="CommentScreen"
              component={CommentScreen}
              options={({ navigation }) => ({
                // header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            />
            <Stack.Screen
              name="NotificationSystem"
              component={NotificationSystem}
              options={({ navigation }) => ({
                // header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            />
             <Stack.Screen
              name="Billing"
              component={Billing}
              options={({ navigation }) => ({
                // header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            />
               <Stack.Screen
              name="JobsAlert"
              component={JobAlert}
              options={({ navigation }) => ({
                // header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            />
               <Stack.Screen
              name="Talents"
              component={RecommendTalents}
              options={({ navigation }) => ({
                // header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            />
               <Stack.Screen
              name="ReviewCompany"
              component={ReviewCompanyModal}
              options={({ navigation }) => ({
                // header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            />
              <Stack.Screen
              name="ReviewSucess"
              component={ReviewCompanySuccess}
              options={({ navigation }) => ({
                // header: () => <HeaderSystemEmployer navigation={navigation} />,
                presentation: "modal",
              })}
            />
            
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
      </Provider>
    </QueryClientProvider>
  );
}

type ProfileScreenWithDrawerProps = {
  component: ComponentType<any>;
  headerType?: string;
};

export const ProfileScreenWithDrawer: React.FC<
  ProfileScreenWithDrawerProps
> = ({ component: Component, headerType = true, ...restProps }) => {
  const Drawer = createDrawerNavigator();
  const getHeaderForType = (navigation: any) => {
    switch (headerType) {
      case "main":
        return <MainHeader navigation={navigation} />;
      case "account":
        return <AccountHeader navigation={navigation} />;
      // case "custom":
      //   return <CustomHeader navigation={navigation} />;
      default:
        return null;
    }
  };

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props: DrawerContentComponentProps) => (
        <SidebarContent {...props} />
      )}
    >
      <Drawer.Screen
        name="BottomTabs"
        options={({ navigation }) => ({
          header: () => getHeaderForType(navigation),
        })}
        component={(props: any) => <Component {...props} {...restProps} />}
      />
    </Drawer.Navigator>
  );
};
export const ProfileScreenWithDrawerEmployer: React.FC<
  ProfileScreenWithDrawerProps
> = ({ component: Component, headerType = true, ...restProps }) => {
  const Drawer = createDrawerNavigator();
  const getHeaderForType = (navigation: any) => {
    switch (headerType) {
      case "main":
        return <HeaderSystemEmployer navigation={navigation} />;
      case "account":
        return <AccountHeader navigation={navigation} />;
      // case "custom":
      //   return <CustomHeader navigation={navigation} />;
      default:
        return null;
    }
  };

  return (
    <AppProvider>
      <Drawer.Navigator
        initialRouteName="Personal"
        drawerContent={(props: DrawerContentComponentProps) => (
          <SidebarEmployer {...props} />
        )}
      >
        <Drawer.Screen
          name="tabsEmployer"
          options={({ navigation }) => ({
            header: () => getHeaderForType(navigation),
          })}
          component={(props: any) => <Component {...props} {...restProps} />}
        />
        {/* <Drawer.Screen
        name="Recruitment"
        options={({ navigation }) => ({
          header: () => <HeaderSystemEmployer navigation={navigation} />,
          
        })}
        component={Recruitment}
      /> */}
      </Drawer.Navigator>
    </AppProvider>
  );
};
