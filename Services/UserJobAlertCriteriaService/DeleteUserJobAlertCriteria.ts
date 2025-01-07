import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface Criteria {
  id: number;
}

export const DeleteUserJobAlertCriteria = async ({ id }: Criteria) => {
  try {
    const response = await httpClient.delete({
      url: `${apiLinks.UserJobAlertCriteria.DELETE}/${id}`,
      //   params: { id },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        "Delete UserJobAlertCriteria request failed:",
        error.message
      );
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
