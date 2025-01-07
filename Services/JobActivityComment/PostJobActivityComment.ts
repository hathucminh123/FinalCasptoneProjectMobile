import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface Comment {
  data: { [key: string]:  number|string|null };
}

export const PostJobActivityComment = async ({ data }: Comment) => {
  try {
    const response = await httpClient.post({
      url: apiLinks.JobsComment.POST,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Comment request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
