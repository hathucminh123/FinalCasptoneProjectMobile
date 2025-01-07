import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface JobType {
  id: number;
}

export const DeleteJobType = async ({ id }: JobType) => {
  try {
    const response = await httpClient.delete({
      url: `${apiLinks.JobType.DELETE}?id=${id}`,
      // params: { id },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Delete JobType request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
