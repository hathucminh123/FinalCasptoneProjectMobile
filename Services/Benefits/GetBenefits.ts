import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface Benefits {
  id: number;
  name: string;
  // shorthand: string;
  // description: string;
}
interface signal {
  signal: AbortSignal;
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

export const GetBenefits = async ({
  signal,
}: signal): Promise<{
  Benefits: Benefits[];
}> => {
  try {
    const response = await httpClient.get({
      url: apiLinks.Benefits.GET,
      signal: signal,
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching Benefits"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const Benefit = response.data;
    return {
      Benefits: Benefit.result as Benefits[],
    };
  } catch (error) {
    console.error("Fetching Benefits failed", error);
    throw error;
  }
};
