import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface Auth {
    user: { [key: string]: string|number };
  }
  
  export const AuthService = async ({ user }: Auth) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.auth.AUTH,
        data: user,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Code Verification request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  