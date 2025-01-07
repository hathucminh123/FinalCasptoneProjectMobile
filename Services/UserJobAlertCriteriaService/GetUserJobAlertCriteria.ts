import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";
interface Location {
  id: number;
  city: string;
}

interface SkillSet {
  id: number;
  name: string;
  shorthand: string;
  description: string;
}

interface JobType {
  id: number;
  name: string;
  description: string;
}

interface ResultItem {
  id: number;
  location: Location;
  skillSet: SkillSet;
  jobType: JobType;
  userId: number;
}

// For the entire response structure
// interface ApiResponse {
//   statusCode: number;
//   isSuccess: boolean;
//   errorMessage: string | null;
//   result: ResultItem[];
// }

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

interface signal {
  signal: AbortSignal;
  id: number;
}

export const GetUserJobAlertCriteria = async ({
  signal,
  id,
}: signal): Promise<{
  Criteria: ResultItem[];
}> => {
  try {
    const response = await httpClient.get({
      url: `${apiLinks.UserJobAlertCriteria.GET}/${id}`,
      signal: signal,
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching Criteria"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const JobPost = response.data;
    return {
      Criteria: JobPost.result as ResultItem[],
    };
  } catch (error) {
    console.error("Fetching Criteria failed", error);
    throw error;
  }
};
