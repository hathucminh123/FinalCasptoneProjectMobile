import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface JobType {
  id: number;
  name: string;
  description: string;
}
interface SkillSet {
  id: number;
  name: string;
  shorthand: string;
  description: string;
}
interface Benefits {
  id: number;
  name: string;
  // shorthand: string;
  // description: string;
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

interface JobPost {
  id: number;
  jobTitle: string;
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
  jobLocationAddressDetail:string[];
  skillSets: string[]; // Array of skill sets, có thể là array rỗng
  skillSetObjects?:SkillSet[];
  benefitObjects?:Benefits[];
  minsalary?:number;
  isHot?:boolean;
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

interface signal{
  signal:AbortSignal
  id:number
}

export const GetJobPostById = async ({signal ,id}:signal): Promise<{
  JobPosts: JobPost;
}> => {
  try {
    const response = await httpClient.get({
      url: `${apiLinks.JobPosts.GetJobbyId}/Id/${id}`,
      signal:signal,
      // params:{id}
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
      JobPosts: JobPost.result as JobPost,
    };
  } catch (error) {
    console.error("Fetching JobPost failed", error);
    throw error;
  }
};
