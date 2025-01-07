import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface SkillId{
    id:number
}

export const DeleteSkillSet = async ({ id }:SkillId) => {
    try {
      const response = await httpClient.delete({
        url: `${apiLinks.SkillSet.DELETE}/${id}`,
        // params: {id},
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Delete SkillSet request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  