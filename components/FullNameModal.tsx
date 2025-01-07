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

const FullNameModal = ({
  modalVisible,
  setModalVisible,
  fullName,
  setFullName,
  address,
  setCoverletter,
  setAddress,
  phoneNumber,
  coverLetter,
  setPhoneNumber,
  setFirstName,
  firstName,
  setLastName,
  lastName,
  Onclick
}: {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  setCoverletter?: (name: string) => void;
  fullName?: string;
  coverLetter?:string;
  setFullName?: (name: string) => void;
  address?:string |null,
  setAddress?:  (name: string) => void;
  phoneNumber?:string,
  setPhoneNumber?:(name: string) => void;
  setFirstName?:(name:string)=> void;
  firstName?:string;
  setLastName?:(name:string)=>void;
  lastName?:string
  Onclick?:()=>void
}) => {
  return ( 
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Your Full Name</Text>
          <Text style={{ marginBottom: 10 }}>
            Help companies identify you easily by inputting your full name
            below.
          </Text>
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
                  <Text>Your First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Your First Name"
                 
                  />
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    width: "100%",
                    gap: 5,
                  }}
                >
                  <Text>Your Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Your Last Name"
                  />
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    width: "100%",
                    gap: 5,
                  }}
                >
                  <Text>Your Email</Text>
                  <TextInput
                    style={styles.input1}
                    value={address || ""}
                    onChangeText={setAddress}
                    placeholder="Your Email"
                    editable={false}

                  />
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    width: "100%",
                    gap: 5,
                  }}
                >
                  <Text>Your Phone number</Text>
                  <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Your Phone Number"
                  />
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    width: "100%",
                    gap: 5,
                  }}
                >
                  <Text>Your Cover letter</Text>
                  <TextInput
                    style={styles.input}
                    value={coverLetter}
                    onChangeText={setCoverletter}
                    placeholder="Your Cover Letter"
                  />
                </View>
              </ScrollView>
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <Button
              title="SAVE CHANGES"
              onPress={Onclick}
              color="#FF4500"
            />
            <Button
              title="CANCEL"
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
  },
  input1: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: "#f0f0f0", // Màu nền xám
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

export default FullNameModal;
