import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface JobPostsSkillSet {
  data: { [key: string]:  number };
}

export const PostJobPostsSkillSet = async ({ data }: JobPostsSkillSet) => {
  try {
    const response = await httpClient.post({
      url: apiLinks.JobPosts.PostJobPostsSkillset,
      data: data,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Post SkillSet to JobPost request failed:", error.message);
    } else {
      console.error("Unexpected error", error);
    }
    throw error;
  }
};
