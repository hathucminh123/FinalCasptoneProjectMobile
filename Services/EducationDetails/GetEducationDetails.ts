import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface EducationDetail {
  id: number;
  name: string;
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: number;
}

interface props {
  signal: AbortSignal;
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

export const fetchEducationDetails = async ({
  signal,
}: props): Promise<{
  EducationDetails: EducationDetail[];
}> => {
  try {
    const response = await httpClient.get({
      url: apiLinks.EducationDetails.GET,
      signal: signal,
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching EducationDetail"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const EducationDetail = response.data;
    return {
      EducationDetails: EducationDetail.result as EducationDetail[],
    };
  } catch (error) {
    console.error("Fetching EducationDetail failed", error);
    throw error;
  }
};
