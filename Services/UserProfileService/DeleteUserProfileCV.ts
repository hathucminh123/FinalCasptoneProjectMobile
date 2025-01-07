import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface User {
  data: { [key: string]: string | number | null };
}

export const DeleteUserProfileCV = async ({ data }: User) => {
  try {
    const response = await httpClient.delete({
      url: apiLinks.UserSkills.DELETESKILL,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Delete  User SkillSet  request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
