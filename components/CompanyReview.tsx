import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Review {
  id: number;
  summaryContent: string;
  salaryRating: number;
  trainingRating: number;
  careRating: number;
  cultureRating: number;
  officeRating: number;
  reviewContent: string;
  experienceContent: string;
  suggestionContent: string;
  recommened: boolean;
}

interface CompanyReviewProps {
  data: Review[] | null | undefined;
}

const CompanyReview: React.FC<CompanyReviewProps> = ({ data }) => {
  const [hoveredReview, setHoveredReview] = useState<number | null>(null);

  const handleSelectReview = (id: number) => {
    setHoveredReview(id);
  };

  const handleCloseModal = () => {
    setHoveredReview(null);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starContainer}>
        {[...Array(5)].map((_, index) => (
          <Icon
            key={index}
            name={index < rating ? "star" : "star-border"}
            size={20}
            color={index < rating ? "#FFCC00" : "#CCC"}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.reviewHeader}>
        <Text style={styles.headerTitle}>Reviews</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Write Review</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.overview}>
        <Text style={styles.sectionTitle}>{data?.length || 0} Reviews</Text>

        {data?.map((item) => {
          const averageRating = Math.round(
            (item.salaryRating +
              item.trainingRating +
              item.careRating +
              item.cultureRating +
              item.officeRating) /
              5
          );

          return (
            <View key={item.id} style={styles.comment}>
              <Text style={styles.commentTitle}>{item.summaryContent}</Text>
              <View style={styles.ratingContainer}>
                {renderStars(averageRating)}
                <TouchableOpacity
                  style={styles.expandIcon}
                  onPress={() => handleSelectReview(item.id)}
                >
                  <Text style={styles.expandText}>View More</Text>
                </TouchableOpacity>
                {item.recommened && (
                  <Text style={styles.recommendation}>Recommended</Text>
                )}
              </View>

              <Modal
                visible={hoveredReview === item.id}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseModal}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Detailed Ratings</Text>
                    <View style={styles.modalItem}>
                      <Text>Salary & Benefits:</Text>
                      {renderStars(item.salaryRating)}
                    </View>
                    <View style={styles.modalItem}>
                      <Text>Training & Learning:</Text>
                      {renderStars(item.trainingRating)}
                    </View>
                    <View style={styles.modalItem}>
                      <Text>Management Cares:</Text>
                      {renderStars(item.careRating)}
                    </View>
                    <View style={styles.modalItem}>
                      <Text>Culture & Fun:</Text>
                      {renderStars(item.cultureRating)}
                    </View>
                    <View style={styles.modalItem}>
                      <Text>Office & Workspace:</Text>
                      {renderStars(item.officeRating)}
                    </View>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={handleCloseModal}
                    >
                      <Text style={styles.modalCloseText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Text style={styles.commentLabel}>What I Liked:</Text>
              <Text style={styles.commentContent}>{item.reviewContent}</Text>

              <Text style={styles.commentLabel}>Your Experience:</Text>
              <Text style={styles.commentContent}>
                {item.experienceContent}
              </Text>

              <Text style={styles.commentLabel}>Suggestions for Improvement:</Text>
              <Text style={styles.commentContent}>
                {item.suggestionContent}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default CompanyReview;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#121212",
  },
  button: {
    backgroundColor: "#FF4500",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  overview: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#121212",
  },
  comment: {
    borderBottomWidth: 1,
    borderBottomColor: "#dedede",
    paddingBottom: 16,
    marginBottom: 16,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#121212",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: "row",
  },
  expandIcon: {
    padding: 4,
  },
  expandText: {
    fontSize: 14,
    color: "#FF4500",
  },
  recommendation: {
    fontSize: 14,
    color: "#0ab305",
    marginLeft: 16,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  commentContent: {
    fontSize: 14,
    color: "#121212",
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "90%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#121212",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalCloseButton: {
    backgroundColor: "#FF4500",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  modalCloseText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
});
