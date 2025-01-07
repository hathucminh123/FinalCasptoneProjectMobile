import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface CVId{
    id:number
}

export const DeleteCV = async ({ id }:CVId) => {
    try {
      const response = await httpClient.delete({
        url: `${apiLinks.CV.DELETE}`,
        params: {id},
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Delete CVs request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  