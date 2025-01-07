import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface ReviewDetail {
  id: number;
  salaryRating: number;
  trainingRating: number;
  careRating: number;
  cultureRating: number;
  officeRating: number;
  summaryContent: string;
  reviewContent: string;
  reasonContent: string;
  experienceContent: string;
  suggestionContent: string;
  recommened: boolean;
  companyNName: string | null;
  rating:number;
}

interface Signal {
  signal: AbortSignal;
//   id: number;
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

export const GetPendingApproved = async ({
  signal,
//   id,
}: Signal): Promise<{
  reviewDetails: ReviewDetail[];
}> => {
  try {
    const response = await httpClient.get({
      url: `${apiLinks.ReviewCompany.GETPending}`,
      signal: signal,
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching ReviewDetail"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const reviewDetails = response.data.result;
    return {
      reviewDetails: reviewDetails as ReviewDetail[],
    };
  } catch (error) {
    console.error("Fetching ReviewDetails failed", error);
    throw error;
  }
};
