import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface UserJobActivity {
 id:number;
 applicationDate:string;
 status:string;
 imageURL:string;
 jobTitle:string;
 userId:number;
 jobPostId:number

}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

interface signal{
  signal:AbortSignal
}

export const GetJobActivity = async ({signal}:signal): Promise<{
  UserJobActivitys: UserJobActivity[];
}> => {
  try {
    const response = await httpClient.get({
      url: apiLinks.UserApply.GET,
      signal:signal
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching User JobActivity"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const UserJobActivity = response.data;
    return {
      UserJobActivitys: UserJobActivity.result as UserJobActivity[],
    };
  } catch (error) {
    console.error("Fetching User JobActivity failed", error);
    throw error;
  }
};
