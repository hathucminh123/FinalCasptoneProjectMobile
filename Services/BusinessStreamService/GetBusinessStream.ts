import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface GetBusinessStream {
  id: number;
  businessStreamName: string;
  description: string;
}
interface signal {
  signal: AbortSignal;
}
interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}
export const GetBusinessStream = async ({
  signal,
}: signal): Promise<{
    BusinessStreams: GetBusinessStream[];
}> => {
  try {
    const response = await httpClient.get({
      url: apiLinks.BusinessStream.GET,
      signal: signal,
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching BusinessStream"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const BusinessStream = response.data;
    return {
      BusinessStreams: BusinessStream.result as GetBusinessStream[],
    };
  } catch (error) {
    console.error("Fetching SkillSet failed", error);
    throw error;
  }
};
