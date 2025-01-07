import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface Password {
    user: { [key: string]: string };
  }
  
  export const ChangePasswordUser = async ({ user }: Password) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.auth.password,
        data: user,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("change password request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  