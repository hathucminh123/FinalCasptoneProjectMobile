import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface ExperienceDetail{
    data: { [key: string]: string };
}

export const PostExperienceDetails = async ({ data }: ExperienceDetail) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.ExperienceDetail.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Post ExperienceDetail request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  