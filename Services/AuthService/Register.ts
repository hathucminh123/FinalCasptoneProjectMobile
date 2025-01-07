import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface User {
    user: { [key: string]: string | number };
  }
  
  export const register = async ({ user }: User) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.auth.register,
        data: user,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Login request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  