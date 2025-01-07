import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface EducationDetails{
    data: { [key: string]: string|number };
}

export const PostEducationDetails = async ({ data }: EducationDetails) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.EducationDetails.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Post EducationDetails request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  