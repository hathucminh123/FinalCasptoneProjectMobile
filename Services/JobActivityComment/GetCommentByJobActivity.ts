import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface Comment {
  id: number;
  commentText: string;
  commentDate: string;
  rating: number;
}

interface PaginationInfo {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: Comment[];  // Array of comments
}

interface signal {
  signal?: AbortSignal;
  id: number;
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

export const GetCommentByJobActivity = async ({
  id,
  signal,
}: signal): Promise<{
  pagination: PaginationInfo;
}> => {
  try {
    const response = await httpClient.get({
      url: `${apiLinks.JobsComment.GETBYID}/${id}/JobPostActivity`,
      signal: signal,
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching Comment by JobPost"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const Seeker = response.data;
    
    return {
      pagination: {
        pageIndex: Seeker.result.pageIndex,
        pageSize: Seeker.result.pageSize,
        totalCount: Seeker.result.totalCount,
        totalPages: Seeker.result.totalPages,
        items: Seeker.result.items as Comment[],
      },
    };
  } catch (error) {
    console.error("Fetching Seeker by JobPost failed", error);
    throw error;
  }
};
