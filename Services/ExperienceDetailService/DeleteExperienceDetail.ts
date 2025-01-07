import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface ExperienceId{
    id:number
}

export const DeleteExperienceDetail = async ({ id }:ExperienceId) => {
    try {
      const response = await httpClient.delete({
        url: `${apiLinks.ExperienceDetail.DELETE}`,
        params: {id},
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Delete Experience Details request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  