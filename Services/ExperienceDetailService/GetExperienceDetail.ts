import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface ExperienceDetail {
  id: number;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
  achievements: string;
}

interface signal{
  signal:AbortSignal
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

export const fetchExperienceDetails = async ({signal}:signal): Promise<{
  ExperienceDetails: ExperienceDetail[];
}> => {
  try {
    const response = await httpClient.get({
      url: apiLinks.ExperienceDetail.GET,
      signal:signal
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching ExperienceDetail"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const ExperienceDetail = response.data;
    return {
      ExperienceDetails: ExperienceDetail.result as ExperienceDetail[],
    };
  } catch (error) {
    console.error("Fetching ExperienceDetails failed", error);
    throw error;
  }
};
