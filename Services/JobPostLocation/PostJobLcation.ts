import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface JobLocation{
    data: { [key: string]: string|number };
}

export const PostJobLcation = async ({ data }: JobLocation) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.JobLocation.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Post JobLocation request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  