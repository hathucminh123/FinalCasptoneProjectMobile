import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface CertificatesId{
    id:number
}

export const DeleteCertificates = async ({ id }:CertificatesId) => {
    try {
      const response = await httpClient.delete({
        url: `${apiLinks.Certificates.DELETE}`,
        params: {id},
      });
      return response.data;
    } catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Delete Certificates request failed:", error.message); 
      } else {
        console.error("Unexpected error", error);
      }
      throw error; 
    }
  };
  