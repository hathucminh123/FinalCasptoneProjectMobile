import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './slices/searchSlice'; 
import favoriteJobReducer from './slices/favoriteJob';
import ViewJobRducer from './slices/viewJob';
import  createJobReducer  from './slices/createJobs';
import companyJobReducer from "./slices/companyJobslice";
import searchJobSlice from "./slices/searchJobSlice";

const store = configureStore({
  reducer: {
    search: searchReducer,
    searchJob: searchJobSlice,
    favorite:favoriteJobReducer,
    view:ViewJobRducer,
    create:createJobReducer,
    companyJobs: companyJobReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
