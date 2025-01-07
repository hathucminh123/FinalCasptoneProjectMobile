import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface JobPosts {
  data: { [key: string]: string | number | number[] };
}

export const PostJobPosts = async ({ data }: JobPosts) => {
  try {
    const response = await httpClient.post({
      url: apiLinks.JobPosts.POST,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Post JobPosts request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
