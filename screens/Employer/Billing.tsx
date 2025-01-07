import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { GetUserProfile } from "../../Services/UserProfileService/UserProfile";
import { GetPaymentSubsciption } from "../../Services/PaymentSubscription/PaymentSubscription";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function Billing() {
  const [UserId, setUserId] = useState<string | null>(null);

  const fetchUserData = async () => {
    const id = await AsyncStorage.getItem("userId");
    setUserId(id);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const { data: UserProfile } = useQuery({
    queryKey: ["UserProfile"],
    queryFn: ({ signal }) =>
      UserId ? GetUserProfile({ id: Number(UserId), signal: signal }) : null,
    staleTime: 1000,
    enabled: !!UserId,
  });

  const UserProfileData = UserProfile?.UserProfiles;

  const { data: GetSubscriptions } = useQuery({
    queryKey: ["Payment"],
    queryFn: ({ signal }) =>
      UserId ? GetPaymentSubsciption({ id: Number(UserId), signal: signal }) : null,
    staleTime: 1000,
    enabled: !!UserId,
  });

  const PaymentSubscription = GetSubscriptions?.Subscriptions;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
  
    // Format date as "DD/MM/YYYY"
    const formattedDate = date.toLocaleDateString("en-GB");
  
    // Format time as "HH:MM AM/PM"
    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  
    return `${formattedDate} ${formattedTime}`;
  };
  

  const calculateRemainingDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)); // chuyển đổi miligiây sang ngày
  };

  return (
    <View style={styles.main}>
      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Billing</Text>
        </View>

        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          {PaymentSubscription?.map((item, index) => {
            const subscriptionDate = formatDate(item.subscriptionDate);
            const expiredDate = formatDate(item.expiredDate);
            const remainingDays = calculateRemainingDays(item.subscriptionDate, item.expiredDate);

            return (
              <View key={index} style={styles.transactionCard}>
                <View style={styles.dateInfo}>
                  <Text style={styles.label}>Subscription Date:</Text>
                  <Text style={styles.date}>{subscriptionDate}</Text>
                  {/* <Text style={styles.separator}> - </Text> */}
                
                </View>
                {/* <View style={styles.dateInfo}>
                 
                  <Text style={styles.label}>Expired Date:</Text>
                  <Text style={styles.date}>{expiredDate}</Text>
                  <Text style={styles.days}>({remainingDays} Days)</Text>
                </View> */}

                <View style={styles.table}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.serviceTitle}>Name User</Text>
                    <Text style={styles.quantity}>Payment Amount</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.serviceTitle}>
                      {UserProfileData?.firstName} {UserProfileData?.lastName}
                    </Text>
                    <Text style={styles.quantity}>{item.paymentAmount} VND</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mainContent: {
    padding: 16,
    alignItems: "center",
  },
  header: {
    width: "100%",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "#050c26",
  },
  transactionsSection: {
    width: "100%",
    maxWidth: 752,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  transactionCard: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#fafafa",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap:'wrap'
  },
  label: {
    color: "#333",
   
  },
  date: {
    color: "#1e90ff",
    marginHorizontal: 1,
    fontWeight: "500",
  },
  separator: {
    color: "#333",
  },
  days: {
    color: "#1e90ff",
    fontSize: 13,
    marginLeft: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  rowHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f7fa",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  row: {
    flexDirection: "row",
    padding: 12,
  },
  serviceTitle: {
    flex: 3,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  quantity: {
    flex: 1,
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
});
