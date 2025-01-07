import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { fetchCompaniesById } from "../Services/CompanyService/GetCompanyById";

type RootStackParamList = {
  Home: undefined;
  SearchResults: { query: string; location?: string };
  CompanyDetail: { idCom: number | undefined };
};

type SearchResultsRouteProp = RouteProp<RootStackParamList, "CompanyDetail">;

export const ReviewCompanySuccess: React.FC = ({route,navigation}:any) => {
  const routeNavigate = useRoute<SearchResultsRouteProp>();
  const { idCom } = routeNavigate.params;

   const { id, companyDetail } = route?.params;
   const { data: CompanyData } = useQuery({
     queryKey: ["Company-details", idCom ? idCom : id],
     queryFn: ({ signal }) =>
       fetchCompaniesById({ id: Number(idCom ? idCom : id), signal }),
     enabled: !!Number(idCom ? idCom : id),
   });
 
   const companyDataa = CompanyData?.Companies;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.logoTitle}>mazingJob</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Image
          style={styles.companyImage}
          source={{ uri: companyDataa?.imageUrl }}
          resizeMode="contain"
        />
        <Text style={styles.title}>Amazing! We have received your review</Text>
        <Text style={styles.description}>
          You must wait until we finish processing your review on{" "}
          {companyDataa?.companyName}.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("CompanyDetail", {
                id: idCom ? idCom : id,
                companyDetail: JSON.stringify(companyDataa),
              })
          }
        >
          <Text style={styles.buttonText}>Back to Company Page</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  header: {
    width: "100%",
    padding: 20,
    // backgroundColor: "#3cbc8c",
    backgroundColor: '#FF4500',
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3cbc8c",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  logoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
  },
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    padding: 20,
  },
  companyImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#414042",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#fff",
    borderColor: "#ed1b2f",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#ed1b2f",
    fontSize: 16,
    fontWeight: "500",
  },
});
