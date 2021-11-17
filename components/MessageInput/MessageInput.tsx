import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { FontAwesome5, Entypo, AntDesign, Ionicons } from "@expo/vector-icons";
import { ChatRoom, Message } from "../../src/models";
import { DataStore, Auth, Storage } from "aws-amplify";
import EmojiSelector from "react-native-emoji-selector";
import * as ImagePicker from "expo-image-picker";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { Audio, AVPlaybackStatus } from "expo-av";
import AudioPlayer from "../AudioPlayer";

const MessageInput = ({ chatRoom }) => {
  const [message, setMessage] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [soundURI, setSoundURI] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const libraryResponse =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraResponse =
          await ImagePicker.requestCameraPermissionsAsync();
        await Audio.requestPermissionsAsync();
        if (
          libraryResponse.status !== "granted" ||
          cameraResponse.status !== "granted"
        ) {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

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

    resetFields();
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
    if (image) {
      sendImage();
    } else if (soundURI) {
      sendAudio();
    } else if (message) {
      sendMessage();
    } else {
      onPlusClicked();
    }
  };

  const resetFields = () => {
    setMessage("");
    setIsEmojiPickerOpen(false);
    setImage(null);
    setProgress(0);
    setSoundURI(null);
  };

  //! Image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  //! Take a picture
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const progressCallback = (progress) => {
    setProgress(progress.loaded / progress.total);
  };

  const sendImage = async () => {
    if (!image) {
      return;
    }

    const blob = await getBlob(image);
    const { key } = await Storage.put(`${uuidv4()}.png`, blob, {
      progressCallback,
    });

    const user = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        image: key,
        userID: user.attributes.sub,
        chatroomID: chatRoom.id,
      })
    );

    updateLastMessage(newMessage);

    resetFields();
  };

  const getBlob = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  //! AUDIO starts here
  async function startRecording() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    if (!recording) {
      return;
    }
    setRecording(null);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    console.log("Recording stopped and stored at", uri);

    if (!uri) {
      return;
    }

    setSoundURI(uri);
  }

  const sendAudio = async () => {
    if (!soundURI) {
      return;
    }

    const uriParts = soundURI.split(".");
    const extension = uriParts[uriParts.length - 1];
    const blob = await getBlob(soundURI);
    const { key } = await Storage.put(`${uuidv4()}.${extension}`, blob, {
      progressCallback,
    });

    const user = await Auth.currentAuthenticatedUser();
    const newMessage = await DataStore.save(
      new Message({
        content: message,
        audio: key,
        userID: user.attributes.sub,
        chatroomID: chatRoom.id,
        status: "SENT",
      })
    );

    updateLastMessage(newMessage);

    resetFields();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { height: isEmojiPickerOpen ? "50%" : "auto" }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      {image && (
        <View style={styles.sendImageContainer}>
          <Image
            source={{ uri: image }}
            style={{ width: 100, height: 100, borderRadius: 10 }}
          />
          <View
            style={{
              flex: 1,
              justifyContent: "flex-start",
              alignSelf: "flex-end",
            }}
          >
            <View
              style={{
                height: 5,
                borderRadius: 5,
                backgroundColor: "rgb(0,195,0)",
                width: `${progress * 100}%`,
              }}
            />
          </View>

          <Pressable onPress={() => setImage(null)}>
            <AntDesign
              name="close"
              size={22}
              color="black"
              style={{ margin: 5 }}
            />
          </Pressable>
        </View>
      )}

      {soundURI && <AudioPlayer soundURI={soundURI} />}

      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Pressable onPress={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}>
            <FontAwesome5
              name="smile"
              size={24}
              color="grey"
              style={styles.icon}
            />
          </Pressable>
          <TextInput
            style={styles.textInput}
            placeholder="Start typing..."
            value={message}
            onChangeText={setMessage}
          />
          <Pressable onPress={pickImage}>
            <Entypo name="image" size={22} color="grey" style={styles.icon} />
          </Pressable>
          <Pressable onPress={takePhoto}>
            <Entypo name="camera" size={22} color="grey" style={styles.icon} />
          </Pressable>
          <Pressable onPressIn={startRecording} onPressOut={stopRecording}>
            <FontAwesome5
              name="microphone"
              size={22}
              color={recording ? "red" : "grey"}
              style={styles.icon}
            />
          </Pressable>
        </View>
        <Pressable onPress={onPress} style={styles.buttonContainer}>
          {message || image || soundURI ? (
            <Ionicons name="send" size={16} color="white" />
          ) : (
            <AntDesign name="plus" size={22} color="white" />
          )}
        </Pressable>
      </View>

      {isEmojiPickerOpen && (
        <EmojiSelector
          onEmojiSelected={(emoji) =>
            setMessage((currentMessage) => currentMessage + emoji)
          }
          columns={16}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    padding: 10,
    marginBottom: 10,
  },
  sendImageContainer: {
    flexDirection: "row",
    marginVertical: 10,
    alignSelf: "stretch",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
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
