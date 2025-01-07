import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface Comment {
  id: number;
  commentText: string;
  commentDate: string;
  rating: number;
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

interface signal {
  signal: AbortSignal;
}

export const GetJobActivityComment = async ({
  signal,
}: signal): Promise<{ Comment: Comment[] }> => {
  try {
    const response = await httpClient.get({
      url: apiLinks.JobsComment.GET,
      signal: signal,
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while getting jobs comment"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const Companies = response.data;
    return {
      Comment: Companies.result as Comment[],
    };
  } catch (error) {
    console.error("Fetching companies failed", error);
    throw error;
  }
};
