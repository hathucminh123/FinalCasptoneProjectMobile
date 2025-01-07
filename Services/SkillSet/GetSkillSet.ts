import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface SkillSet {
  id: number;
  name: string;
  shorthand: string;
  description: string;
}
interface signal{
  signal:AbortSignal
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

export const GetSkillSets = async ({signal}:signal): Promise<{
  SkillSets: SkillSet[];
}> => {
  try {
    const response = await httpClient.get({
      url: apiLinks.SkillSet.GET,
      signal:signal
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching SkillSet"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const SkillSet = response.data;
    return {
      SkillSets: SkillSet.result as SkillSet[],
    };
  } catch (error) {
    console.error("Fetching SkillSet failed", error);
    throw error;
  }
};
