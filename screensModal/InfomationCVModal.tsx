import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
export default function InfomationCVModal({ navigation }: any) {
  return (
    <View style={styles.main}>
      <View style={styles.main1}>
        <Text style={{ fontSize: 20, lineHeight: 30, fontWeight: "bold" }}>
          General Information
        </Text>
        {/* <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate("General Information")}
        >
          <View style={styles.icon}>
            <Icon name="person" size={30} color="black" />
          </View>
          <Text style={{ fontSize: 15, lineHeight: 22.5, fontWeight: "bold" }}>
            Profile Information
          </Text>
          <View style={{ marginLeft: "auto", flex: 1 }}>
            <Icon
              name="chevron-right"
              size={24}
              color="gray"
              style={{ marginLeft: "auto" }}
            />
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate("General Information", {
              scrollToSection: "WorkingExperience",
            })
          }
        >
          <View style={styles.icon}>
            <Icon name="star-border" size={30} color="black" />
          </View>
          <Text style={{ fontSize: 15, lineHeight: 22.5, fontWeight: "bold" }}>
            Working Experience
          </Text>
          <View style={{ marginLeft: "auto", flex: 1 }}>
            <Icon
              name="chevron-right"
              size={24}
              color="gray"
              style={{ marginLeft: "auto" }}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate("General Information", {
              scrollToSection: "Skills",
            })
          }
        >
          <View style={styles.icon}>
            <Icon name="tune" size={30} color="black" />
          </View>
          <Text style={{ fontSize: 15, lineHeight: 22.5, fontWeight: "bold" }}>
            Technical Skill
          </Text>
          <View style={{ marginLeft: "auto", flex: 1 }}>
            <Icon
              name="chevron-right"
              size={24}
              color="gray"
              style={{ marginLeft: "auto" }}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate("General Information", {
              scrollToSection: "Education",
            })
          }
        >
          <View style={styles.icon}>
            <Icon name="school" size={30} color="black" />
          </View>
          <Text style={{ fontSize: 15, lineHeight: 22.5, fontWeight: "bold" }}>
            Education
          </Text>
          <View style={{ marginLeft: "auto", flex: 1 }}>
            <Icon
              name="chevron-right"
              size={24}
              color="gray"
              style={{ marginLeft: "auto" }}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate("General Information", {
              scrollToSection: "Benefits",
            })
          }
        >
          <View style={styles.icon}>
            <Icon name="work" size={30} color="black" />
          </View>
          <Text style={{ fontSize: 15, lineHeight: 22.5, fontWeight: "bold" }}>
            Benefits
          </Text>
          <View style={{ marginLeft: "auto", flex: 1 }}>
            <Icon
              name="chevron-right"
              size={24}
              color="gray"
              style={{ marginLeft: "auto" }}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate("General Information", {
              scrollToSection: "Certificates",
            })
          }
        >
          <View style={styles.icon}>
          <Icon name="verified" size={30} color="black" />
          </View>
          <Text style={{ fontSize: 15, lineHeight: 22.5, fontWeight: "bold" }}>
          Certificates
          </Text>
          <View style={{ marginLeft: "auto", flex: 1 }}>
            <Icon
              name="chevron-right"
              size={24}
              color="gray"
              style={{ marginLeft: "auto" }}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            navigation.navigate("General Information", {
              scrollToSection: "Awards",
            })
          }
        >
          <View style={styles.icon}>
          <Icon name="star" size={30} color="black" />
          </View>
          <Text style={{ fontSize: 15, lineHeight: 22.5, fontWeight: "bold" }}>
          Awards
          </Text>
          <View style={{ marginLeft: "auto", flex: 1 }}>
            <Icon
              name="chevron-right"
              size={24}
              color="gray"
              style={{ marginLeft: "auto" }}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 10,
    gap: 10,
  },
  main1: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "white",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 15,
    width: "100%",
    height: "100%",
  },
  item: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 40,
  },
  icon: {
    borderRadius: 50,
    backgroundColor: "#dedede",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
