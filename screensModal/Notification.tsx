import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Notification() {
  return (
  
    <View style={styles.main}>
      <View style={styles.main1}>
        <Text style={styles.title}>Ứng tuyển ngay chờ chi</Text>
        <Text style={styles.description}>thiên lý oiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii</Text>
        <Text style={styles.date}>12/5</Text>
      </View>
      <View style={styles.main1}>
        <Text style={styles.title}>Ứng tuyển ngay chờ chi</Text>
        <Text style={styles.description}>thiên lý oiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii</Text>
        <Text style={styles.date}>12/5</Text>
      </View>
    </View>
 
  );
}

const styles = StyleSheet.create({
  main: {
    paddingVertical: 10,
    flexDirection: "column",
    justifyContent: "flex-start",
    gap:10,
    backgroundColor: "white",
    height: "100%",
  },

  main1: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 5,
    backgroundColor: "#dedede",
  },
  title:{
    fontSize:15,
    lineHeight:22.5,
    fontWeight:"bold"
  },
  description:{
fontSize:15,
lineHeight:22.5
  },
  date:{
    fontSize:15,
    lineHeight:22.5,
     color:'#A9A9A9'
  }
});
