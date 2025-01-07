import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Notification {
    id: number;
    title: string;
    description: string;
    receiverId: number;
    isRead: boolean;
    jobPostActivityId: number;
    jobPostActivity: any;
    userAccount: any;
    createdDate: string;
    modifiedDate: any;
    createdBy: any;
    modifiedBy: any;
    isDeleted: boolean;
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
    jobType: JobType;
    jobLocationCities: string[];
    jobLocationAddressDetail: string[];
    skillSets: string[];
  }
  

interface AppContextType {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  jobSearch:JobPost[];
  setJobSearch: React.Dispatch<React.SetStateAction<JobPost[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [jobSearch, setJobSearch] = useState<JobPost[]>([]);

  return (
    <AppContext.Provider value={{ notifications, setNotifications,jobSearch,setJobSearch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
