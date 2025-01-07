import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface Review{
    data: { [key: string]: string|number|boolean|undefined };
    // id:number
}

export const ApprovedCompany = async ({ data  }: Review) => {
    try {
      const response = await httpClient.put({
        url: `${apiLinks.ReviewCompany.PUTAprroved}?Id=${data.id}`,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Approved Review Company request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  