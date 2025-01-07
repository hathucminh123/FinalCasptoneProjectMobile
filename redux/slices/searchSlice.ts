import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

// Define the interface for the search state
interface SearchState {
  search: {
    location: string | null;
    text: string|null;
    // skill:string|null;
    // company:string|null
  };
}

// Initial state
const initialState: SearchState = {
  search: {
    location: "",
    text: "",
    // skill:"",
    // company:""
  },
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    // Reducer to update the search filters
    filter: (state, action: PayloadAction<{ location: string | null; text: string|null}>) => {
      state.search.location = action.payload.location;
      state.search.text = action.payload.text;
      // state.search.skill = action.payload.skill;
      // state.search.company = action.payload.company;
    },
  },
});

// Export the action for dispatching
export const { filter } = searchSlice.actions;

// Selector to access the search state in the store
export const selectSearch = (state: RootState) => state.search.search;

// Export the reducer to be included in the store
export default searchSlice.reducer;
