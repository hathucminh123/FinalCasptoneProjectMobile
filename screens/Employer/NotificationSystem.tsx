import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  HttpTransportType,
  HubConnectionBuilder,
  IHttpConnectionOptions,
} from "@microsoft/signalr";
import {
  GetNotifications,
  ReadAllNotifications,
  ReadNotification,
} from "../../Services/JobsPostActivity/GetNotifications";
import { AxiosResponse } from "axios";
import { signalR } from "../../Services/mainService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useAppContext } from "../../components/Employer/Context";

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

export default function NotificationSystem({ navigation }: any) {
  const notificationsPerPage = 10;
  // const [notifications, setNotifications] = useState<Notification[]>([]);
  const {notifications, setNotifications}= useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [token, setToken] = useState<string | null>(null);

  const fetchUserData = async () => {
    const token = await AsyncStorage.getItem("token");
    setToken(token);
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData(); // Fetch token on focus
    }, [])
  );

  useEffect(() => {
    const startConnection = async () => {
      if (!token) return;

      const options: IHttpConnectionOptions = {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => `${token}`,
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
        console.log("Connection closed");
      });

      await connection
        .start()
        .catch((error) => console.log("Connection error:", error));

      // Clean up the connection on unmount
      return () => {
        connection.stop();
      };
    };

    startConnection();

    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const response: AxiosResponse = await GetNotifications();
      if (response?.status === 200) {
        setNotifications(response.data as Notification[]);
      }
    } catch (error) {
      console.log("Fetch error:", error);
    }
  };

  const readNotifications = async (id: number | string) => {
    try {
      const response: AxiosResponse = await ReadNotification(id);
      if (response?.status === 200) {
        await fetchNotifications();
      }
    } catch (error) {
      console.log("Read error:", error);
    }
  };

  const readAllNotifications = async () => {
    try {
      const response: AxiosResponse = await ReadAllNotifications();
      if (response?.status === 200) {
        await fetchNotifications();
      }
    } catch (error) {
      console.log("Read all error:", error);
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View style={styles.notificationCard}>
      <Text style={styles.notificationTitle}>Notification</Text>
      <Text style={styles.notificationDate}>
        {new Date(item.createdDate).toLocaleString()}
      </Text>
      <TouchableOpacity onPress={() => readNotifications(item.id)}>
        <Text style={styles.notificationLink}>{item.title}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Mark All as Read button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          onPress={readAllNotifications}
          style={styles.markAllReadButton}
        >
          <Icon name="done-all" size={24} color="#007bff" />
          <Text style={styles.markAllReadText}>Mark All as Read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications.slice(
          (currentPage - 1) * notificationsPerPage,
          currentPage * notificationsPerPage
        )}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.pagination}>
        {Array.from(
          { length: Math.ceil(notifications.length / notificationsPerPage) },
          (_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentPage(index + 1)}
              style={[
                styles.pageButton,
                currentPage === index + 1 && styles.activePage,
              ]}
            >
              <Text style={styles.pageButtonText}>{index + 1}</Text>
            </TouchableOpacity>
          )
        )}

        <TouchableOpacity
          onPress={() =>
            setCurrentPage((prev) =>
              Math.min(
                prev + 1,
                Math.ceil(notifications.length / notificationsPerPage)
              )
            )
          }
          style={styles.pageButton}
          disabled={
            currentPage >=
            Math.ceil(notifications.length / notificationsPerPage)
          }
        >
          <Icon name="navigate-next" style={styles.nextIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  markAllReadButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  markAllReadText: {
    marginLeft: 5,
    color: "#007bff",
    fontWeight: "bold",
  },
  notificationCard: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  notificationDate: {
    color: "#888",
    marginVertical: 4,
  },
  notificationLink: {
    color: "#007bff",
    textDecorationLine: "underline",
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  pageButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: "#007bff",
  },
  activePage: {
    backgroundColor: "#0056b3",
  },
  pageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  nextIcon: {
    fontSize: 20,
    color: "#fff",
  },
});
