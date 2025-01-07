import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";


interface Payment{
    data: { [key: string]: string|number|undefined|null };
}

export const Payment = async ({ data }: Payment) => {
    try {
      const response = await httpClient.post({
        url: apiLinks.payment.POST,
        data: data,
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Payment request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  