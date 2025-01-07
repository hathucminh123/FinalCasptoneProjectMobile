import AsyncStorage from "@react-native-async-storage/async-storage";
import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


export const GetNotifications = async () => {
  try {
    const token = await AsyncStorage.getItem('token') ?? undefined;
    const response = await httpClient.get({
      url: apiLinks.JobPostActivity.GetNotifications,
      authorization: `bearer ${token}`
    });
    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Get Notifications request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};

export const ReadNotification = async (id: number | string) => {
  try {
    const token = await AsyncStorage.getItem('token') ?? undefined;
    const response = await httpClient.put({
      url: apiLinks.JobPostActivity.ReadNotification + id,
      authorization: `bearer ${token}`
    });
    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Read Notifications request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
}

export const ReadAllNotifications = async () => {
  try {
    const token = await AsyncStorage.getItem('token') ?? undefined;
    const response = await httpClient.put({
      url: apiLinks.JobPostActivity.ReadAllNotifications,
      authorization: `bearer ${token}`
    });
    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Read All Notifications request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
}
