import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface Awards{
    data: { [key: string]: string|number };
}

export const PostAwards = async ({ data }: Awards) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.Award.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Post Awards request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  