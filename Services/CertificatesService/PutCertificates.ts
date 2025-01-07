import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface Certificates {
  data: { [key: string]: string | number |undefined};
}

export const PutCertificates = async ({ data }: Certificates) => {
  try {
    const response = await httpClient.put({
      url: apiLinks.Certificates.PUT,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Put  Certificates  request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
