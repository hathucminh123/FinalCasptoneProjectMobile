import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface BenefitsID {
  id: number;
}

export const DeleteBenefits = async ({ id }: BenefitsID) => {
  try {
    const response = await httpClient.delete({
      url: `${apiLinks.Benefits.DELETE}/${id}`,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Delete  User Benefits  request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
