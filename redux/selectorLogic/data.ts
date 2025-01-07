import { useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "../../Services/CompanyService/GetCompanies";
import { GetJobPost } from "../../Services/JobsPost/GetJobPosts";
import { setCompanies,setJobPosts } from "../slices/companyJobslice";

import { useEffect } from "react";
import { useAppDispatch } from "../hooks/hooks";

export const useCompanyAndJobData = () => {
    const dispatch=useAppDispatch()
  const {
    data: Company,
    isLoading: isCompanyLoading,
    isError: isCompanyError,
  } = useQuery({
    queryKey: ["Company"],
    queryFn: ({ signal }) => fetchCompanies({ signal: signal }),
    staleTime: 5000,

  });

  const {
    data: JobPosts,
    isLoading: isJobLoading,
    isError: isJobError,
  } = useQuery({
    queryKey: ["JobPosts"],
    queryFn: ({ signal }) => GetJobPost({ signal: signal }),
    staleTime: 5000,
  });

  const Companiesdata = Company?.Companies;
  const JobPostsdata = JobPosts?.JobPosts;
  useEffect(()=>{
  if (Companiesdata || JobPostsdata){
    dispatch(setCompanies(Companiesdata|| []));
    dispatch(setJobPosts(JobPostsdata || []));
  
  }
  },[Companiesdata,JobPostsdata,dispatch])


  
  return {
    Companiesdata,
    JobPostsdata,
    isCompanyLoading,
    isCompanyError,
    isJobLoading,
    isJobError,
  };
};


