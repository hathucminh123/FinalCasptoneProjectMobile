import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface JobLocation {
  id: number;

  district: string;
  city: string;
  postCode: string;
  state: string;
  country: string;
  stressAddress:number
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

export const GetJobLocation = async (): Promise<{
    JobLocations: JobLocation[];
}> => {
  try {
    const response = await httpClient.get({
      url: apiLinks.JobLocation.GET,
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching JobLocations"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const JobLocation = response.data;
    return {
        JobLocations: JobLocation.result as JobLocation[],
    };
  } catch (error) {
    console.error("Fetching JobLocations failed", error);
    throw error;
  }
};
