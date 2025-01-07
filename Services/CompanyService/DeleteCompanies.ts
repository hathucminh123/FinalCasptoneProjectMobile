import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface companyId{
    id:number
}

export const DeleteCompanies = async ({ id }:companyId) => {
    try {
      const response = await httpClient.delete({
        url: `${apiLinks.Company.DELETE}?id=${id}`,
        params: {id},
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Delete Companies request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  