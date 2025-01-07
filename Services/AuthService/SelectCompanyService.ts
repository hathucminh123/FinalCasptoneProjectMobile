import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface Data {
  data: { [key: string]: string | number };
}

export const SelectCompany = async ({ data }: Data) => {
  try {
    const response = await httpClient.post({
      url: apiLinks.auth.Verifi,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Select company request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
