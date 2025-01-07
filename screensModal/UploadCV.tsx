import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase/config";
import { PostCVs } from "../Services/CVService/PostCV";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../Services/mainService";

interface FileResponse {
  uri: string;
  name: string | null;
  mimeType: string | null;
  size: number | null;
}

const UploadCVScreen = ({ navigation }: any) => {
  const [selectedFile, setSelectedFile] = useState<FileResponse | null>(null);

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        Alert.alert("File selection was cancelled.");
        return;
      }

      const selectedAsset = result.assets ? result.assets[0] : result;

      if (!selectedAsset.uri) {
        Alert.alert("Error", "No file was selected.");
        return;
      }

      const response = await fetch(selectedAsset.uri);
      const blob = await response.blob(); // Create blob once here

      setSelectedFile({
        uri: selectedAsset.uri,
        name: selectedAsset.name ?? "Unknown",
        mimeType: selectedAsset.mimeType ?? "Unknown",
        size: selectedAsset.size ?? 0,
      });
    } catch (error) {
      console.error("Error picking or uploading file: ", error);
      Alert.alert(
        "Error",
        "There was an error while selecting or uploading the file."
      );
    }
  }
  const { mutate,isPending } = useMutation({
    mutationFn: PostCVs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["CVs"] });
      navigation.navigate("Account");
      Alert.alert("Post CV successfully");
    },
    onError: () => {
      Alert.alert("Failed to Upload CV");
    },
  });

  console.log();

  const handleSaveCV = async () => {
    if (selectedFile) {
      const fileRef = ref(storage, `${selectedFile.name}`);

      // Convert file URI to blob for upload
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();
      await uploadBytes(fileRef, blob); // Use the blob directly from state

      const fileUrl = await getDownloadURL(fileRef);
      mutate({
        data: {
          url: fileUrl,
          name: selectedFile.name,
        },
      });
      console.log("File to upload:", selectedFile);
    } else {
      console.log("No file selected");
      Alert.alert("Please select a file to upload.");
    }
  };
  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.uploadSection}>
        <Text style={styles.uploadTitle}>Upload CV</Text>
        {!selectedFile ? (
          <TouchableOpacity style={styles.uploadButton} onPress={pickFile}>
            <Text style={styles.uploadButtonText}>UPLOAD YOUR CV</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileInfoContainer}>
            {/* <Image
              style={styles.fileIcon}
              source={selectedFile.mimeType?.includes('pdf')
                ? require('../assets/pdf-icon.png') 
                : require('../assets/doc-icon.png')} 
            /> */}
            <Text style={styles.fileName}>{selectedFile.name}</Text>
            <TouchableOpacity onPress={removeFile}>
              <Text style={styles.removeFileText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: selectedFile ? "#FF4500" : undefined },
          ]}
          disabled={!selectedFile}
          onPress={handleSaveCV}
        >
          <Text
            style={[
              styles.confirmButtonText,
              { color: selectedFile ? "white" : undefined },
            ]}
          >
            {isPending ? `Wait a seconds` : `CONFIRM UPLOAD YOUR CV` }
           
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  uploadSection: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#888",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  uploadButtonText: {
    fontSize: 16,
    color: "#888",
  },
  fileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  fileIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  fileName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  removeFileText: {
    fontSize: 18,
    color: "#f00",
    marginLeft: 10,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  confirmButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#888",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#888",
  },
});

export default UploadCVScreen;
