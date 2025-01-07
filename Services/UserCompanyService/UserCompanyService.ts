import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface CompanyId{
    data: { [key: string]: string|number };
}

export const PostUserCompanyService = async ({ data }: CompanyId) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.UserApply.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Choose Company request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  