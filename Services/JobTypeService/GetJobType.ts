import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface JobType {
  id: number;
  name:string;
  description:string;
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}


interface signal{
  signal:AbortSignal
}
export const GetJobType = async ({signal}:signal): Promise<{
    JobTypes: JobType[];
}> => {
  try {
    const response = await httpClient.get({
      url: apiLinks.JobType.GET,
      signal:signal
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching JobType"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const JobType = response.data;
    return {
        JobTypes: JobType.result as JobType[],
    };
  } catch (error) {
    console.error("Fetching JobType failed", error);
    throw error;
  }
};
