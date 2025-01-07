import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
  
interface PercentileChartProps {
  overallMatch?: number;
  skillMatch?: number;
  experienceMatch?: number;
  contentSimilarity?: number;
  profileResult?: SeekersByJobPost | null;
}

const PercentileChart = ({ overallMatch, skillMatch, experienceMatch, contentSimilarity }: PercentileChartProps) => {
  const metrics = [
    { label: 'Overall Match', value: overallMatch },
    { label: 'Skill Match', value: skillMatch },
    { label: 'Experience Match', value: experienceMatch },
    { label: 'Content Similarity', value: contentSimilarity },
  ];

  return (
    <View style={styles.chartContainer}>
      {metrics.map((metric, index) => (
        <View key={index} style={styles.metricContainer}>
          <View
            style={[
              styles.bar,
              {
                height: `${metric.value ?? 0}%`,
                backgroundColor:
                  // metric.value !== undefined
                  //   ? metric.value >= 80
                  //     ? '#22c55e'
                      // : metric.value >= 50
                      // ? 
                      '#3b82f6'
                      // : '#d1d5db'
                    // : '#d1d5db',
              },
            ]}
          />
          <Text style={styles.label}>{metric.label}</Text>
          <Text style={styles.value}>{metric.value !== undefined ? `${metric.value}%` : 'N/A'}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'flex-end', 
   paddingRight:20,
    paddingBottom:50
  },
  metricContainer: {
    alignItems: 'center',
    marginHorizontal: 8, 
    height: 150, 
  },
  bar: {
    width: 40,
    borderRadius: 4,
    marginBottom: 8, // Ensure there's space for text below the bar
  },
  label: {
    fontSize: 10,
    color: '#717584',
    textAlign: 'center',
    marginTop: 4, // Adjust the spacing between the bar and label
  },
  value: {
    fontSize: 12,
    color: '#717584',
    textAlign: 'center',
    marginTop: 2, // Adjust the spacing between the label and value
  },
});

export default PercentileChart;
