import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface PutEmail {
  data: { [key: string]: string | number };
}

export const PutEmail = async ({ data }: PutEmail) => {
  try {
    const response = await httpClient.put({
      url: apiLinks.auth.Email,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Put  User Email request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
