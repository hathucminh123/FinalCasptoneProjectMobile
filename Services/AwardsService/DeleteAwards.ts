import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface AwardsId {
  id: number;
}

export const DeleteAwards = async ({ id }: AwardsId) => {
  try {
    const response = await httpClient.delete({
      url: `${apiLinks.Award.DELETE}`,
      params: { id },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Delete Awards request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
