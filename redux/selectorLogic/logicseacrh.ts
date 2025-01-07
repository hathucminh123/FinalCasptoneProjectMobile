import { createSelector } from "reselect";
import { RootState } from "../store";

// Helper function to remove accents and normalize strings
const removeAccents = (str: string | null | string[]) => {
  if (typeof str !== "string") {
    return "";
  }
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
};

// Selectors
const selectSearch = (state: RootState) => state.search.search;
const selectJobData = (state: RootState) => state.companyJobs.jobPosts;
const selectCompanyData = (state: RootState) => state.companyJobs.companies;

// Updated TodoListSelector
export const TodoListSelector = createSelector(
  [selectJobData, selectSearch, selectCompanyData],
  (jobs, search, companies) => {
    return jobs?.filter((job) => {
      const searchText = removeAccents(search.text || "");

      const matchesText = searchText
        ? removeAccents(job?.jobTitle).includes(searchText)
        : true;

      const company = companies?.find((item) => item.id === job.companyId);

      const matchCompanyName = company
        ? removeAccents(company?.companyName).includes(searchText)
        : false;

      const matchSkill = searchText
        ? job.skillSets.some((skill) => removeAccents(skill).includes(searchText))
        : false;

      // Join jobLocationCities and jobLocationAddressDetail into a single string for location comparison
      const jobLocations = [
        ...(job.jobLocationCities || []),
        ...(job.jobLocationAddressDetail || []),
      ]
        .map(removeAccents)
        .join(" ");

      const matchesLocation = search.location
        ? jobLocations.includes(removeAccents(search.location))
        : true;

      return (matchesText || matchCompanyName || matchSkill) && matchesLocation;
    });
  }
);
