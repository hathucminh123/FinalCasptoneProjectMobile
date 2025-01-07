import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface Certificates{
    data: { [key: string]: string|number };
}

export const PostCertificates = async ({ data }: Certificates) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.Certificates.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Post Certificates request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  