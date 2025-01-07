import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface EducationId{
    id:number
}

export const DeleteEducationDetails = async ({ id }:EducationId) => {
    try {
      const response = await httpClient.delete({
        url: `${apiLinks.EducationDetails.DELETE}`,
        params: {id},
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Delete Education request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  