import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface Email {
  email: { [key: string]: string | number };
}

export const EmailEmployees = async ({ email }: Email) => {
  try {
    const response = await httpClient.post({
      url: apiLinks.auth.EMPLOYEE,
      data: email,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Send email request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
