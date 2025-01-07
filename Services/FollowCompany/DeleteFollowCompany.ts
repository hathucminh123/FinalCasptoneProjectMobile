import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface FollowCompanyId{
    id:number
}

export const DeleteFollowCompany = async ({ id }:FollowCompanyId) => {
    try {
      const response = await httpClient.delete({
        url: `${apiLinks.CompanyFollow.DELETE}`,
        params: {id},
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Unfollow Company request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  