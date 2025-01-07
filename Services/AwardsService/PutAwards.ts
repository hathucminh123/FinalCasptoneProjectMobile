import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface Awards {
  data: { [key: string]: string | number | undefined };
}

export const PutAwards = async ({ data }: Awards) => {
  try {
    const response = await httpClient.put({
      url: apiLinks.Award.PUT,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Put  Awards  request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
