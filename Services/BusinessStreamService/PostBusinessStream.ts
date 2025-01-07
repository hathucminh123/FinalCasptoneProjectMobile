import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface PostBusinessStream{
    data: { [key: string]: string | number};
}

export const PostBusinessStream = async ({ data }: PostBusinessStream) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.BusinessStream.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Post PostBusinessStream request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  