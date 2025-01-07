import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

interface GradientCircularProgressProps {
  percentage: number;
}

const GradientCircularProgress: React.FC<GradientCircularProgressProps> = ({
  percentage,
}) => {
  const calculateStrokeDasharray = (percentage: number): string => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    return `${(percentage / 100) * circumference} ${circumference}`;
  };

  const getStrokeColor = (): string => {
    if (percentage >= 80) return "#22c55e"; // Green for 80 and above
    if (percentage >= 50) return "#3b82f6"; // Blue for 50 to 79
    return "#ef4444"; // Red for below 50
  };

  return (
    <View style={styles.main}>
      <Svg width="50" height="50" viewBox="0 0 100 100">
        {/* Background semi-circle */}
        <Circle
          cx="50"
          cy="50"
          r="40"
          stroke="#f3f4f6"
          strokeWidth="10"
          fill="none"
        />

        {/* Progress semi-circle with rotation */}
        <Circle
          cx="50"
          cy="50"
          r="40"
          stroke={getStrokeColor()}
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={calculateStrokeDasharray(percentage)}
          strokeDashoffset="0"
          transform="rotate(-90 50 50)" // Start from the top
        />

        {/* Centered Percentage Text */}
        <SvgText
          x="50"
          y="50"
          textAnchor="middle"
          dy=".3em" // Align text vertically in the center
          fontSize="18"
          fontWeight="bold"
          fill="#333"
        >
          {`${percentage}%`}
        </SvgText>
      </Svg>

      {/* Label below the percentage */}
      <Text style={styles.label}>completed</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 80,
    // overflow: "hidden",
  },
  label: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
});

export default GradientCircularProgress;
