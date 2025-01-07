import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface UserJobAlertCriteria {
  data: { [key: string]: string | number | number[]|null|undefined };
}

export const PostUserJobAlertCriteria  = async ({ data }: UserJobAlertCriteria) => {
  try {
    const response = await httpClient.post({
      url: apiLinks.UserJobAlertCriteria.POST,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Post AlertCriteria request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
