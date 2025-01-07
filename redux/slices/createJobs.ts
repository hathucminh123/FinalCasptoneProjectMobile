import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
interface JobType {
  id: number;
  name: string;
  description: string;
}

interface JobLocation {
  id: number;
  district: string;
  city: string;
  postCode: string;
  state: string;
  country: string;
  stressAddress: string;
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
  jobLocation: JobLocation; // jobLocation là đối tượng JobLocation
  skillSets: string[]; // Array of skill sets, có thể là array rỗng
}



interface Job {
    item: JobPost[];
  }
  


  const initialState: Job = {
    item: [], 
  };


  
export const createJobSlice = createSlice({
    name: "Create",
    initialState,
    reducers: {
  
      add: (state, action: PayloadAction<JobPost>) => {
        const jobExists = state.item.find((job) => job.id === action.payload.id);
        if (!jobExists) {
          state.item.push(action.payload);
        }
      },
  
      remove: (state, action: PayloadAction<string>) => {
        state.item = state.item.filter((job) => job.id !== Number(action.payload)); 
      },
    },
  });
  
  // Export the actions for dispatching
  export const { add, remove } = createJobSlice.actions;
  
  // Selector to access the job items in the state
  export const selectJob = (state: RootState) => state.create.item;
  
  
  export default createJobSlice.reducer;
  

