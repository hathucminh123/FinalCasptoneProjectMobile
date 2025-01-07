import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface JobPostActivityComment{
    data: { [key: string]: string|number|null };
}

export const PutJobActivityComment = async ({ data }: JobPostActivityComment) => {
    try {
      const response = await httpClient.put({
        url: apiLinks.JobsComment.PUT,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Update Comment JobActivity request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  