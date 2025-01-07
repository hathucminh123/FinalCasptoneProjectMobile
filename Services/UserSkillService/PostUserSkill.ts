import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface User {
  data: { [key: string]: string | number|null };
}

export const PostUserSkill = async ({ data }: User) => {
  try {
    const response = await httpClient.post({
      url: apiLinks.UserSkills.POST,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Save User  Skill request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
