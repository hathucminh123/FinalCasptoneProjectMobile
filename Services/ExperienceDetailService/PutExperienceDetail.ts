import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface ExperienceDetail {
  data: { [key: string]: string | number |undefined};
}

export const PutExperienceDetail = async ({ data }: ExperienceDetail) => {
  try {
    const response = await httpClient.put({
      url: apiLinks.ExperienceDetail.PUT,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Put  Experience Detail request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
