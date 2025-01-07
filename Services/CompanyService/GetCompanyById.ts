import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface BusinessStream {
  id: number;
  businessStreamName: string;
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
  jobType: string | null;
  jobLocation: string | null;
  skillSets: string[];
}

interface Location {
  id: number;
  stressAddressDetail: string;
  city: string;
  locationId: number;
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
  imageUrl: string;
  evidence?: string;
  taxCode?: string;
  companyStatus?: number;
  companyLocations: Location[]; // Thêm thuộc tính này
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}
interface companyId {
  id: number;
  signal: AbortSignal;
}

export const fetchCompaniesById = async ({
  id,
  signal,
}: companyId): Promise<{ Companies: Company }> => {
  try {
    const response = await httpClient.get({
      url: `${apiLinks.Company.GetCompaniesbyId}/${id}`,
      params: { id },
      signal: signal,
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
      Companies: Companies.result,
    };
  } catch (error) {
    console.error("Fetching companies failed", error);
    throw error;
  }
};
