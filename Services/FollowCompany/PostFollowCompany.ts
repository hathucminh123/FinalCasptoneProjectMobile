import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface FollowCompany {
  data: { [key: string]:  number };
}

export const PostFollowCompany = async ({ data }: FollowCompany) => {
  try {
    const response = await httpClient.post({
      url: apiLinks.CompanyFollow.POST,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Follow Company request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
