import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface PostFavoriteJobs {
  data: { [key: string]:  number };
}

export const PostFavoriteJobs = async ({ data }: PostFavoriteJobs) => {
  try {
    const response = await httpClient.post({
      url: apiLinks.FavoriteJobs.POST,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Save Job request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
