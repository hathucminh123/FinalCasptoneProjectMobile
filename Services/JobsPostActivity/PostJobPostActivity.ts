import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface JobPostActivity{
    data: { [key: string]: string|number|undefined |null};
}

export const PostJobPostActivity = async ({ data }: JobPostActivity) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.JobPostActivity.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Post JobActivity request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  