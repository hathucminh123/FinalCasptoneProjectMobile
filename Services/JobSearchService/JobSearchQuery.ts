import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";
interface SearchData {
    query:string
}

interface JobSearch{
    // data: { [key: string]: string|number|undefined };
    data:SearchData
}

export const JobSearchQuery = async ({ data }: JobSearch) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.SearchQuery.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Post JobActivity request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  