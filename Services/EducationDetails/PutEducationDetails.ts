import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface Education {
  data: { [key: string]: string | number |undefined};
}

export const PutEducationDetails = async ({ data }: Education) => {
  try {
    const response = await httpClient.put({
      url: apiLinks.EducationDetails.PUT,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Put  EducationsDetail  request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
