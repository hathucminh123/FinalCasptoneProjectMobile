import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface FollowCompanyId{
    id:number
}

export const DeleteJobActivityComment = async ({ id }:FollowCompanyId) => {
    try {
      const response = await httpClient.delete({
        url: `${apiLinks.JobsComment.DELETE}`,
        params: {id},
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Delete comment request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  