interface Company {
    id: number;
    name: string;
    overview: {
      title: string;
      description: string;
    };
    jobs: Job[];
    location: string;
    jobOpeningsCount: number;
    image: string; 
  }