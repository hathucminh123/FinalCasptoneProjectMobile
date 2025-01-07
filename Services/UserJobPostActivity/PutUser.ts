import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface User {
  data: { [key: string]: string | number | undefined | null | boolean };
}

export const PutUser = async ({ data }: User) => {
  try {
    const response = await httpClient.put({
      url: apiLinks.UserApply.PUT,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Put  User  request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
