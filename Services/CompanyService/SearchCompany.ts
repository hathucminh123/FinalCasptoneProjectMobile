import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface BusinessStream {
    id: number;
    businessStreamName: string;
    description: string;
  }
  interface JobType {
    id: number;
    name: string;
    description: string;
  }
  
  
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
    jobLocationAddressDetail:string[]
    skillSets: string[]; // Array of skill sets, có thể là array rỗng
  }
  interface Company {
    id: number;
    companyName: string;
    companyDescription: string;
    websiteURL: string;
    establishedYear: number;
    country: string;
    city: string;
    address: string;
    numberOfEmployees: number;
    businessStream: BusinessStream;
    jobPosts: JobPost[];
    imageUrl:string
  }
  


interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

interface signal{
  signal?:AbortSignal
  name:string
}

export const SearchCompany = async ({signal,name}:signal): Promise<{ Companies: Company }> => {
  try {
    const response = await httpClient.get({
      url: `${apiLinks.Company.GetSearch}?companyName=${name}`,
      signal:signal
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching Companies"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const Companies = response.data;
    return {
      Companies: Companies.result as Company, 
    };
  } catch (error) {
    console.error("Fetching companies failed", error);
    throw error;
  }
};
