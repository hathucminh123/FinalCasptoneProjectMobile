import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

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
  jobType: JobType | string | null;
  jobLocationCities:string[];
  jobLocationAddressDetail:string[]
  skillSets: string[];
}

interface JobState {
  item: JobPost[];
}

// Initial state
const initialState: JobState = {
  item: [], 
};

export const searchSlice = createSlice({
  name: "Save",
  initialState,
  reducers: {

    add: (state, action: PayloadAction<JobPost>) => {
      const jobExists = state.item.find((job) => job.id === action.payload.id);
      if (!jobExists) {
        state.item.push(action.payload);
      }
    },

    remove: (state, action: PayloadAction<number>) => {
      state.item = state.item.filter((job) => job.id !== action.payload); 
    },
  },
});

// Export the actions for dispatching
export const { add, remove } = searchSlice.actions;

// Selector to access the job items in the state
export const selectJob = (state: RootState) => state.favorite.item;


export default searchSlice.reducer;
