import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchCompaniesById } from "../Services/CompanyService/GetCompanyById";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { PostReviewCompany } from "../Services/ReviewCompany/PostReviewCompany";

type RootStackParamList = {
  Home: undefined;
  SearchResults: { query: string; location?: string };
  CompanyDetail: { idCom: number | undefined };
};

type SearchResultsRouteProp = RouteProp<RootStackParamList, "CompanyDetail">;

interface InteractiveRatingProps {
  initialValue: number;
  max: number;
  onChange: (value: number) => void;
}

const getRatingLabel = (value: number): string => {
  switch (value) {
    case 1:
      return "Terrible";
    case 2:
      return "Needs Improvement";
    case 3:
      return "Good";
    case 4:
      return "Really Good";
    case 5:
      return "Fantastic";
    default:
      return "";
  }
};

const InteractiveRating: React.FC<InteractiveRatingProps> = ({
  initialValue,
  max,
  onChange,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [selectedValue, setSelectedValue] = useState<number>(initialValue);

  const handleMouseEnter = (value: number) => {
    setHoverValue(value);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const handleClick = (value: number) => {
    setSelectedValue(value);
    onChange(value);
  };

  const displayValue = hoverValue !== null ? hoverValue : selectedValue;

  return (
    <View style={styles.ratingContainer}>
      {Array.from({ length: max }, (_, index) => {
        const value = index + 1;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => handleClick(value)}
            style={{ marginHorizontal: 4 }}
          >
            <MaterialIcons
              name={value <= displayValue ? "star" : "star-border"}
              size={32}
              color={value <= displayValue ? "#FFA726" : "#BDBDBD"}
            />
          </TouchableOpacity>
        );
      })}
      <Text style={styles.ratingLabel}>{getRatingLabel(displayValue)}</Text>
    </View>
  );
};

export const ReviewCompanyModal: React.FC = ({ route ,navigation}: any) => {
  const routeNavigate = useRoute<SearchResultsRouteProp>();
//   const navigation = useNavigation();
  const { idCom } = routeNavigate.params;

  const { id, companyDetail } = route?.params;
  const { data: CompanyData } = useQuery({
    queryKey: ["Company-details", idCom ? idCom : id],
    queryFn: ({ signal }) =>
      fetchCompaniesById({ id: Number(idCom ? idCom : id), signal }),
    enabled: !!Number(idCom ? idCom : id),
  });

  const companyDataa = CompanyData?.Companies;
  const [recommendation, setRecommendation] = useState<boolean | null>(null);
  const [summaryContent, setSummaryContent] = useState<string>("");
  const [reviewContent, setReviewContent] = useState<string>("");
  const [experienceContent, setExperienceContent] = useState<string>("");
  const [sugestionContent, setSugestionContent] = useState<string>("");
  const [salaryRating, setSalaryRating] = useState<number>(0);
  const [trainingRating, setTrainingRating] = useState<number>(0);
  const [careRating, setCareRating] = useState<number>(0);
  const [cultureRating, setCultureRating] = useState<number>(0);
  const [officeRating, setOfficeRating] = useState<number>(0);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: Review } = useMutation({
    mutationFn: PostReviewCompany,
    onSuccess: () => {
      Alert.alert(`Review on ${companyDataa?.companyName} successfully!`);
      navigation.navigate("ReviewSucess", {
        id: idCom ? idCom : id,
        companyDetail: companyDataa,
      })
    },
    onError: () => {
      Alert.alert(`Failed to Review on ${companyDataa?.companyName}.`);
    },
  });

  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    if (!summaryContent.trim()) newErrors.summaryContent = "Summary is required.";
    if (!reviewContent.trim()) newErrors.reviewContent = "Review is required.";
    if (!experienceContent.trim()) newErrors.experienceContent = "Experience is required.";
    if (!sugestionContent.trim()) newErrors.sugestionContent = "Suggestion is required.";
    if (recommendation === null) newErrors.recommendation = "Recommendation is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateFields()) return;

    Review({
      data: {
        salaryRating,
        trainingRating,
        careRating,
        cultureRating,
        officeRating,
        summaryContent,
        reviewContent,
        reasonContent: "",
        experienceContent,
        suggestionContent: sugestionContent,
        recommened: recommendation,
        companyId: companyDataa?.id,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.companyName}>{companyDataa?.companyName}</Text>

      <Text style={styles.label}>Summary</Text>
      <TextInput
        style={[styles.input, errors.summaryContent && styles.inputError]}
        placeholder="Write your summary here..."
        value={summaryContent}
        onChangeText={setSummaryContent}
      />
      {errors.summaryContent && <Text style={styles.errorText}>{errors.summaryContent}</Text>}

      <Text style={styles.label}>Review</Text>
      <TextInput
        style={[styles.input, styles.textarea, errors.reviewContent && styles.inputError]}
        placeholder="Write your review here..."
        value={reviewContent}
        multiline
        onChangeText={setReviewContent}
      />
      {errors.reviewContent && <Text style={styles.errorText}>{errors.reviewContent}</Text>}

      <Text style={styles.label}>What makes you happy working here? *</Text>
      <TextInput
        style={[styles.input, styles.textarea, errors.experienceContent && styles.inputError]}
        placeholder="Write your experience here..."
        value={experienceContent}
        multiline
        onChangeText={setExperienceContent}
      />
      {errors.experienceContent && <Text style={styles.errorText}>{errors.experienceContent}</Text>}

      <Text style={styles.label}>Suggestions for company improvement *</Text>
      <TextInput
        style={[styles.input, styles.textarea, errors.sugestionContent && styles.inputError]}
        placeholder="Write your suggestions here..."
        value={sugestionContent}
        multiline
        onChangeText={setSugestionContent}
      />
      {errors.sugestionContent && <Text style={styles.errorText}>{errors.sugestionContent}</Text>}

      <Text style={styles.label}>Salary & Benefits</Text>
      <InteractiveRating
        initialValue={salaryRating}
        max={5}
        onChange={setSalaryRating}
      />

      {/* Other rating fields omitted for brevity */}
      <Text style={styles.label}>Training & learning</Text>
      <InteractiveRating
        initialValue={trainingRating}
        max={5}
        onChange={setTrainingRating}
      />
        <Text style={styles.label}>Management cares about me</Text>
      <InteractiveRating
        initialValue={careRating}
        max={5}
        onChange={setCareRating}
      />
        <Text style={styles.label}>Culture & fun</Text>
      <InteractiveRating
        initialValue={cultureRating}
        max={5}
        onChange={setCultureRating}
      />
        <Text style={styles.label}>Office & workspace</Text>
      <InteractiveRating
        initialValue={officeRating}
        max={5}
        onChange={setOfficeRating}
      />

      <Text style={styles.label}>
        Do you want to recommend this company to your friends?{" "}
        <Text style={{ color: "red" }}>*</Text>
      </Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity
          style={[
            styles.radioButton,
            recommendation === true && styles.radioSelected,
          ]}
          onPress={() => setRecommendation(true)}
        >
          <View
            style={[
              styles.radioCircle,
              recommendation === true && styles.radioCircleSelected,
            ]}
          />
          <Text style={styles.radioLabel}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.radioButton,
            recommendation === false && styles.radioSelected,
          ]}
          onPress={() => setRecommendation(false)}
        >
          <View
            style={[
              styles.radioCircle,
              recommendation === false && styles.radioCircleSelected,
            ]}
          />
          <Text style={styles.radioLabel}>No</Text>
        </TouchableOpacity>
      </View>
      {errors.recommendation && <Text style={styles.errorText}>{errors.recommendation}</Text>}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    backgroundColor: "#fff",
  },
  textarea: {
    height: 120,
    textAlignVertical: "top",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ratingLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: "#FF4500",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
  },
  radioCircleSelected: {
    backgroundColor: "#ed1b2f",
    borderColor: "#ed1b2f",
  },
  radioLabel: {
    fontSize: 16,
    color: "#333",
  },
  radioSelected: {
    borderColor: "#ed1b2f",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
