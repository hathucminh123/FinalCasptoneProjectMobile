import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface JobType {
  id: number;
  name: string;
  description: string;
}

// interface JobLocation {
//   id: number;
//   district: string;
//   city: string;
//   postCode: string;
//   state: string;
//   country: string;
//   stressAddress: string;
// }
interface Benefits {
  id: number;
  name: string;
  // shorthand: string;
  // description: string;
}
interface JobPost {
  id: number;
  jobTitle: string;
  isHot?: boolean;
  minsalary: number;
  jobDescription: string;
  salary: number;
  postingDate: string;
  expiryDate: string; 
  experienceRequired: number;
  qualificationRequired: string;
  benefits: string;
  imageURL: string;
  isActive: boolean;
  companyId: number;
  companyName: string;
  websiteCompanyURL: string;
  jobType: JobType; // jobType là đối tượng JobType
  jobLocationCities:string[];
  jobLocationAddressDetail:string[]
  skillSets: string[]; // Array of skill sets, có thể là array rỗng
  benefitObjects:Benefits[]
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

interface signal{
  signal:AbortSignal
}

export const GetJobPost = async ({signal}:signal): Promise<{
  JobPosts: JobPost[];
}> => {
  try {
    const response = await httpClient.get({
      url: apiLinks.JobPosts.GET,
      signal:signal
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching JobPosts"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const JobPost = response.data;
    return {
      JobPosts: JobPost.result as JobPost[],
    };
  } catch (error) {
    console.error("Fetching SkillSet failed", error);
    throw error;
  }
};
