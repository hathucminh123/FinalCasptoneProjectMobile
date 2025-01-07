import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface Review{
    data: { [key: string]: string|number|boolean|undefined|null };
}

export const PostReviewCompany = async ({ data }: Review) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.ReviewCompany.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Post Review Company request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  