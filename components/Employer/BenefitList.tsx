import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
interface Benefits {
  id: number;
  name: string;
  // shorthand: string;
  // description: string;
}

interface props {
  data: Benefits[] |undefined;
}
const BenefitsList = ({ data }: props) => {
  return (
    <>
      <View style={styles.separator}></View>
      <View style={styles.benefit}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Text style={styles.li}>{item.name}</Text>}
          ListEmptyComponent={<Text style={styles.li}>no Benefits Yet</Text>}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  benefit: {
    fontWeight: "500",
    color: "#121212",
    fontSize: 14,
    // boxSizing: 'border-box',
    display: "flex",
  },
  li: {
    marginBottom: 4,
    // boxSizing: 'border-box',
    textAlign: "left",
    color: "#ed1b2f",
    textAlignVertical: "center",
  },
});

export default BenefitsList;
