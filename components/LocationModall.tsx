import React from "react";
import {
  View,
  Modal,
  ScrollView,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";

const LocationModall = ({
  modalVisible,
  setModalVisible,
  navigation,
  location = "", 
  setLocation = () => {}, 
}: {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  location?: string;
  setLocation?: (name: string) => void;
  navigation?: any;
}) => {
  const handleSearch = () => {
    setModalVisible(false);
    navigation.navigate("SearchResults", { location: location });
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Advance Filter</Text>

          <ScrollView>
            <View style={styles.form}>
              <ScrollView style={{ width: "100%" }}>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    width: "100%",
                    gap: 5,
                  }}
                >
                  <Text>Location</Text>

                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Enter Location"
                    editable={false} // Vì bạn sử dụng RNPickerSelect nên không cần nhập tay
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 25,
                      right: 0,
                      zIndex: 10,
                      width: 50,
                    }}
                  >
                    <RNPickerSelect
                      onValueChange={(value) => setLocation?.(value)} // Kiểm tra nếu setLocation có giá trị
                      items={[
                        { label: "All cities", value: "All" },
                        { label: "Hồ Chí Minh", value: "HO CHI MINH" },
                        { label: "Hà Nội", value: "HA NOI" },
                        { label: "Đà Nẵng", value: "DA NANG" },
                        { label: "Hải Phòng", value: "HAI PHONG" },
                        { label: "Cần Thơ", value: "CAN THO" },
                        { label: "Nha Trang", value: "NHA TRANG" },
                      ]}
                      placeholder={{ label: "Select Location...", value: null }}
                      style={pickerSelectStyles}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button
              title="SAVE CHANGES"
              onPress={handleSearch}
              color="#FF4500"
            />
            <Button
              title="Reset Filter"
              onPress={() => setModalVisible(false)}
              color="#777"
            />
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
  modalView: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: "scroll",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    position: "relative",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  form: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    height: 250,
    overflow: "scroll",
    gap: 5,
  },
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
  },
});

export default LocationModall;
