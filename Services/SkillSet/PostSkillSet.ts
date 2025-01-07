import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface SkillSet{
    data: { [key: string]: string };
}

export const PostSkillSets = async ({ data }: SkillSet) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.SkillSet.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Post SkillSet request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  