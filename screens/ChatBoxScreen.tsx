import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";

import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

const ChatBox: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const generateBotResponse = (newMessage: ChatMessage) => {
    setIsLoading(true);
    setChatHistory((prev) => [
      ...prev,
      { role: "bot", text: "Bot is typing..." },
    ]);

    fetch(
      "https://566f-2404-e801-2007-a3e-e561-2024-4d0b-d404.ngrok-free.app/invoke",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            messages: [
              {
                type: newMessage.role === "user" ? "human" : "bot",
                content: newMessage.text,
              },
            ],
          },
        }),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setChatHistory((prev) =>
          prev.filter((msg) => msg.text !== "Bot is typing...")
        );
        setChatHistory((prev) => [
          ...prev,
          { role: "bot", text: data.output || "I am here to help!" },
        ]);
      })
      .catch(() => {
        setChatHistory((prev) =>
          prev.filter((msg) => msg.text !== "Bot is typing...")
        );
        setChatHistory((prev) => [
          ...prev,
          { role: "bot", text: "Sorry, something went wrong!" },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const newMessage: ChatMessage = { role: "user", text: message.trim() };
    setChatHistory((prev) => [...prev, newMessage]);
    setMessage("");
    generateBotResponse(newMessage);
  };

  

  const handleUploadCV = async (): Promise<void> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
  
      if (result.canceled) {
        Alert.alert("File selection cancelled");
        return;
      }
  
      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name;
      const mimeType = "application/pdf";
  
      // Convert file URI to Blob
      const response = await fetch(fileUri);
      const fileBlob = await response.blob();
  
      // Create FormData and append the file Blob
      const formData = new FormData();
      formData.append("file", fileBlob, fileName);
  
      setChatHistory((prev) => [
        ...prev,
        { role: "user", text: `Uploaded file: ${fileName}` },
        { role: "bot", text: "Bot is processing your CV..." },
      ]);
  
      // Send the file to the API
      const uploadResponse = await axios.post(
        "https://fb32-112-197-86-203.ngrok-free.app/upload_and_process",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  

      console.log("testok chua",uploadResponse.data);
      const { data, file_info, parser_used, message } = uploadResponse.data;
  
      const compareCVPayload = {
        status: "success",
        data,
        file_info,
        parser_used,
        message,
      };
  
      const compareResponse = await axios.post(
        "https://566f-2404-e801-2007-a3e-e561-2024-4d0b-d404.ngrok-free.app/compare-cv",
        compareCVPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      const jobMatches = compareResponse.data.matches || [];
      const botMessage =
        jobMatches.length > 0
          ? `Found ${jobMatches.length} matching job(s).`
          : "No matching jobs found.";
  
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Bot is processing your CV..."),
        { role: "bot", text: botMessage },
      ]);
    } catch (error) {
      console.error("Error uploading CV:", error);
      Alert.alert("Error uploading CV. Please try again.");
      setChatHistory((prev) =>
        prev.filter((msg) => msg.text !== "Bot is processing your CV...")
      );
    }
  };
  
  
  

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [chatHistory]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={chatHistory}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.role === "user" ? styles.userMessage : styles.botMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
        />
      </View>
      <View style={styles.inputContainer}>
        {/* <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUploadCV}
          disabled={isLoading}
        >
          <Text style={styles.uploadButtonText}>Upload CV</Text>
        </TouchableOpacity> */}
        <TextInput
          style={styles.textInput}
          placeholder="Send a message..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={isLoading}
        >
          <Text style={styles.sendButtonText}>
            {isLoading ? "..." : "Send"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: "70%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#FF4500",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#a9a9a9",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  uploadButton: {
    backgroundColor: "#3cbc8c",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#FF4500",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ChatBox;
