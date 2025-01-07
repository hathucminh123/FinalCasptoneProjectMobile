import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Define the interface for the search state
interface SearchState {
  search: {
    keyword: string | null;
    companyNames: string[] | null;
    jobTitles: string[] | null;
    skillSets: string[] | null;
    minSalary: number | null ;
    maxSalary: number | null;
    locations: string[] | null;
    cities: string[] | null;
    experience: number | null |undefined;
    jobTypes: string[] | null;
    pageIndex: number | null;
    pageSize: number | null;
  };
}

// Initial state
const initialState: SearchState = {
  search: {
    keyword: "",
    companyNames: [],
    jobTitles: null,
    skillSets: [],
    minSalary: null,
    maxSalary: null,
    locations: null,
    cities: [],
    experience: null,
    jobTypes:  [],
    pageIndex: 1,
    pageSize: 9,
  },
};

export const searchJobSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setKeyword: (state, action: PayloadAction<string>) => {
      state.search.keyword = action.payload;
    },
    setCompanyNames: (state, action: PayloadAction<string>) => {
      state.search.companyNames = state.search.companyNames
        ? state.search.companyNames.includes(action.payload)
          ? state.search.companyNames.filter(name => name !== action.payload)
          : [...state.search.companyNames, action.payload]
        : [action.payload];
    },
    setJobTitles: (state, action: PayloadAction<string>) => {
      state.search.jobTitles = state.search.jobTitles
        ? state.search.jobTitles.includes(action.payload)
          ? state.search.jobTitles.filter(title => title !== action.payload)
          : [...state.search.jobTitles, action.payload]
        : [action.payload];
    },
    setSkillSets: (state, action: PayloadAction<string>) => {
      state.search.skillSets = state.search.skillSets
        ? state.search.skillSets.includes(action.payload)
          ? state.search.skillSets.filter(skill => skill !== action.payload)
          : [...state.search.skillSets, action.payload]
        : [action.payload];
    },
    setMinSalary: (state, action: PayloadAction<number>) => {
      state.search.minSalary = action.payload;
    },
    setMaxSalary: (state, action: PayloadAction<number>) => {
      state.search.maxSalary = action.payload;
    },
    setLocations: (state, action: PayloadAction<string>) => {
      state.search.locations = state.search.locations
        ? state.search.locations.includes(action.payload)
          ? state.search.locations.filter(location => location !== action.payload)
          : [...state.search.locations, action.payload]
        : [action.payload];
    },
    setCities: (state, action: PayloadAction<string>) => {
      state.search.cities = state.search.cities
        ? state.search.cities.includes(action.payload)
          ? state.search.cities.filter(city => city !== action.payload)
          : [...state.search.cities, action.payload]
        : [action.payload];
    },
    setExperience: (state, action: PayloadAction<number>) => {
      state.search.experience = state.search.experience === action.payload ? null : action.payload;
    },
    setJobTypes: (state, action: PayloadAction<string>) => {
      state.search.jobTypes = state.search.jobTypes
        ? state.search.jobTypes.includes(action.payload)
          ? state.search.jobTypes.filter(type => type !== action.payload)
          : [...state.search.jobTypes, action.payload]
        : [action.payload];
    },
    setPageIndex: (state, action: PayloadAction<number>) => {
      state.search.pageIndex = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.search.pageSize = action.payload;
    },
    reset: (state)=> {
      state.search = {
        ...state.search,
        cities: [],
        companyNames: [],
        skillSets:[],
        jobTypes:[],
        experience:null,
      }
    }
  },
});

// Export the actions for dispatching
export const {
  setKeyword,
  setCompanyNames,
  setJobTitles,
  setSkillSets,
  setMinSalary,
  setMaxSalary,
  setLocations,
  setCities,
  setExperience,
  setJobTypes,
  setPageIndex,
  setPageSize,
  reset
} = searchJobSlice.actions;

// Selector to access the search state in the store
export const selectSearchJob = (state: RootState) => state.search.search;

// Export the reducer to be included in the store
export default searchJobSlice.reducer;
