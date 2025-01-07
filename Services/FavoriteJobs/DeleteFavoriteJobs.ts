import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface FollowJobId{
    id:number
}

export const DeleteFavoriteJobs = async ({ id }:FollowJobId) => {
    try {
      const response = await httpClient.delete({
        url: `${apiLinks.FavoriteJobs.DELETE}`,
        params: {id},
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Unfollow Job request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  