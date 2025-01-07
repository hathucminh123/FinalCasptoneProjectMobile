import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface JobPostActivity{
    data: { [key: string]: string|number |null};
}

export const PutJobPostActivityStatus = async ({ data }: JobPostActivity) => {
    try {
      const response = await httpClient.put({
        url: apiLinks.JobPostActivity.PUT,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Update status JobActivity request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  