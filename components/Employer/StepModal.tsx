import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { Accelerometer, AccelerometerMeasurement } from "expo-sensors";
import Icon from "react-native-vector-icons/MaterialIcons";
import { PutJobPostActivityStatus } from "../../Services/JobsPostActivity/PutJobPostActivityStatus";
import { queryClient } from "../../Services/mainService";
import { useMutation } from "@tanstack/react-query";
import DropDownPicker from "react-native-dropdown-picker";

type StepModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onFinish: (status: string, comment: string, rating: number, id: number | null) => void;
  id: number | null;
};

const StepModal: React.FC<StepModalProps> = ({
  isVisible,
  onClose,
  onFinish,
  id,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [status, setStatus] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [data, setData] = useState<AccelerometerMeasurement>({
    x: 0,
    y: 0,
    z: 0,
    timestamp: Date.now(),
  });
  const [open, setOpen] = useState(false); // For DropDownPicker state

  const SHAKE_THRESHOLD = 1.5;

  const statusOptions = [
    { label: "Rejected", value: "2" },
    { label: "Passed", value: "3" },
    { label: "CV Screening Passed", value: "4" },
    { label: "Interview Stage", value: "5" },
  ];

  useEffect(() => {
    Accelerometer.setUpdateInterval(400);
    const subscription = Accelerometer.addListener(
      (accelerometerData: AccelerometerMeasurement) => {
        setData(accelerometerData);
        if (isShake(accelerometerData)) {
          setCurrentStep(1); // Reset step to 1
        }
      }
    );
    return () => subscription && subscription.remove();
  }, []);

  const isShake = ({ x, y, z }: AccelerometerMeasurement): boolean => {
    return (
      Math.abs(x) > SHAKE_THRESHOLD ||
      Math.abs(y) > SHAKE_THRESHOLD ||
      Math.abs(z) > SHAKE_THRESHOLD
    );
  };

  const { mutate: PutStatus } = useMutation({
    mutationFn: PutJobPostActivityStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["SeekerApply"],
        refetchType: "active",
      });
      Alert.alert("Status updated successfully!");
    },
    onError: () => {
      Alert.alert("Failed to update status.");
    },
  });

  const handleNext = () => {
    if (currentStep === 1 && !status) {
      Alert.alert("Please select a status.");
    } else {
      PutStatus({
        data: {
          jobPostActivityId: id,
          status: Number(status),
        },
      });
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) setCurrentStep(1);
  };

  const handleFinish = () => {
    onFinish(status || "", comment, rating, id);
    onClose();
    resetState();
  };

  const resetState = () => {
    setCurrentStep(1);
    setStatus(null);
    setComment("");
    setRating(0);
  };

  const renderStars = () => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Icon
            name="star"
            size={24}
            color={i <= rating ? "#ffd700" : "#ccc"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.stepHeader}>
            <Text style={[styles.step, currentStep === 1 && styles.activeStep]}>
              {currentStep === 1 ? "1" : "✓"} Select Status
            </Text>
            <Text style={styles.stepDivider}>───</Text>
            <Text style={[styles.step, currentStep === 2 && styles.activeStep]}>
              2 Input Comment
            </Text>
          </View>

          {currentStep === 1 && (
            <>
              <Text style={styles.title}>Update Status</Text>
              <DropDownPicker
                open={open}
                value={status}
                items={statusOptions}
                setOpen={setOpen}
                setValue={setStatus}
                placeholder="Select Status"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </>
          )}

          {currentStep === 2 && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Comment"
                value={comment}
                onChangeText={setComment}
              />
              {renderStars()}
            </>
          )}

          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity onPress={handleBack}>
                <Text style={styles.buttonText}>BACK</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={currentStep === 1 ? handleNext : handleFinish}
            >
              <Text style={styles.buttonText}>
                {currentStep === 1 ? "NEXT" : "FINISH"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  step: {
    fontSize: 16,
    color: "#999",
  },
  activeStep: {
    color: "#007bff",
    fontWeight: "bold",
  },
  stepDivider: {
    marginHorizontal: 8,
    color: "#999",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  buttonText: {
    color: "#007bff",
    fontWeight: "bold",
    fontSize: 16,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 5,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#007bff",
  },
});

export default StepModal;
