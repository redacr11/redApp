import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FontAwesome5, Entypo, AntDesign, Ionicons } from "@expo/vector-icons";
import { DataStore } from "@aws-amplify/datastore";
import { ChatRoom, Message } from "../../src/models";
import Auth from "@aws-amplify/auth";

const MessageInput = ({ chatRoom }) => {
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    console.warn("sending: ", message);
    const user = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        userID: user.attributes.sub,
        chatroomID: chatRoom.id,
      })
    );

    updateLastMessage(newMessage);
    setMessage("");
  };

  const updateLastMessage = async (newMessage) => {
    DataStore.save(
      ChatRoom.copyOf(chatRoom, (updatedChatRoom) => {
        updatedChatRoom.LastMessage = newMessage;
      })
    );
  };

  const onPlusClicked = () => {
    console.warn("on plus clicked");
  };

  const onPress = () => {
    if (message) {
      sendMessage();
    } else {
      onPlusClicked();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.inputContainer}>
        <FontAwesome5 name="smile" size={24} color="grey" style={styles.icon} />
        <TextInput
          style={styles.textInput}
          placeholder="Start typing..."
          value={message}
          onChangeText={setMessage}
        />
        <Entypo name="camera" size={22} color="grey" style={styles.icon} />
        <FontAwesome5
          name="microphone"
          size={22}
          color="grey"
          style={styles.icon}
        />
      </View>
      <Pressable onPress={onPress} style={styles.buttonContainer}>
        {message ? (
          <Ionicons name="send" size={16} color="white" />
        ) : (
          <AntDesign name="plus" size={22} color="white" />
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: "#f2f2f2",
    flex: 1,
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#dedede",
    alignItems: "center",
    flexDirection: "row",
    padding: 4,
  },
  icon: {
    marginHorizontal: 5,
  },
  textInput: {
    flex: 1,
    marginHorizontal: 5,
    fontSize: 14,
  },
  buttonContainer: {
    width: 40,
    height: 40,
    backgroundColor: "rgb(0,195,0)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 35,
  },
});

export default MessageInput;
