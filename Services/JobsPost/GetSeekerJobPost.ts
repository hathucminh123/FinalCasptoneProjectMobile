import httpClient from "../../httpClient/httpClient";
import { apiLinks } from "../mainService";

interface SeekersByJobPost {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string; // Số điện thoại lưu dưới dạng chuỗi
  cvId: number;
  cvPath: string;
  jobPostActivityId: number;
  status: string;
  jobPostActivityComments: Comment[];
  extractedCVInfo: ExtractedCVInfo; // Thêm extractedCVInfo
  analyzedResult: AnalyzedResult;
}

interface Comment {
  id: number;
  commentText: string;
  commentDate: string;
  rating: number;
}

interface ExtractedCVInfo {
  success: boolean;
  data: ExtractedData[];
}

interface ExtractedData {
  personal: PersonalInfo;
  professional: ProfessionalInfo;
}

interface PersonalInfo {
  contact: string[];
  email: string[];
  github: string[];
  linkedin: string[];
  location: string[];
  name: string[];
}

interface ProfessionalInfo {
  education: Education[];
  experience: Experience[];
  technical_skills: string[];
  non_technical_skills: string[];
  tools: string[];
}

interface Education {
  qualification: string | null;
  university: string[];
}

interface Experience {
  company: string[];
  role: string[];
  years: string[];
  project_experience: string[];
}

interface AnalyzedResult {
  success: boolean;
  processingTime: number;
  deviceUsed: string;
  matchDetails: MatchDetails;
}

interface MatchDetails {
  jobId: number;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  scores: Scores;
  skillAnalysis: SkillAnalysis;
  experienceAnalysis: ExperienceAnalysis;
  recommendation: Recommendation;
}

interface Scores {
  overallMatch: number;
  skillMatch: number;
  experienceMatch: number;
  contentSimilarity: number;
}

interface SkillAnalysis {
  matchingSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
}

interface ExperienceAnalysis {
  requiredYears: number;
  candidateYears: number;
  meetsRequirement: boolean;
}

interface Recommendation {
  category: string;
  action: string;
}

interface Signal {
  signal?: AbortSignal;
  id: number;
}

interface FetchError extends Error {
  code?: number;
  info?: Record<string, unknown>;
}

export const GetSeekerJobPost = async ({
  id,
  signal,
}: Signal): Promise<{
  GetSeekers: SeekersByJobPost[];
}> => {
  try {
    const response = await httpClient.get({
      url: `${apiLinks.JobPosts.GetSeekerByJobPosts}/${id}/Seekers`,
      signal: signal,
    });

    if (response.status !== 200) {
      const error: FetchError = new Error(
        "An error occurred while fetching Seekers Apply by JobPost"
      );
      error.code = response.status;
      error.info = response.data as Record<string, unknown>;
      throw error;
    }

    const seeker = response.data;
    return {
      GetSeekers: seeker.result as SeekersByJobPost[],
    };
  } catch (error) {
    console.error("Fetching Seekers by JobPost failed", error);
    throw error;
  }
};
