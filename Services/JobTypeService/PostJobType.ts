import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface JobType {
  data: { [key: string]: string | number };
}

export const PostJobType = async ({ data }: JobType) => {
  try {
    const response = await httpClient.post({
      url: apiLinks.JobType.POST,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Post JobType request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
