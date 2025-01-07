import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface CV {
  id: number;
  url: string;
  name:string
}
interface props {
  signal: AbortSignal;
}


interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

export const fetchCVs = async ({signal}:props): Promise<{ CVs: CV[] }> => {
  try {
    const response = await httpClient.get({
      url: apiLinks.CV.GET,
      signal:signal
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching CVs"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const CV = response.data;
    return {
      CVs: CV.result as CV[],
    };
  } catch (error) {
    console.error("Fetching CVs failed", error);
    throw error;
  }
};
