import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface CV{
    data: { [key: string]: string |undefined|null};
}

export const PostCVs = async ({ data }: CV) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.CV.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Post CV request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  