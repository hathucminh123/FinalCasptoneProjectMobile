import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface Benefits{
    data: { [key: string]: string };
}

export const PostBenefits = async ({ data }: Benefits) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.Benefits.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Post Benefits request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  