import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface JobLocation {
  id: number;
}

export const DeleteJobPostLocation = async ({ id }: JobLocation) => {
  try {
    const response = await httpClient.delete({
      url: `${apiLinks.JobLocation.DELETE}?id=${id}`,
      params: { id },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Delete JobPostLocation request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
