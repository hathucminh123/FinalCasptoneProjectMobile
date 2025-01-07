import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface JobPosts {
  data: { [key: string]: string | number | number[] |undefined };
  id: number;
}

export const PutJobPost = async ({ data, id }: JobPosts) => {
  try {
    const response = await httpClient.put({
      url: apiLinks.JobPosts.PUT,
      data: data,
      params: { id },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Put JobPosts request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
