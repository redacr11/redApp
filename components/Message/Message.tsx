import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { DataStore, Auth, Storage } from "aws-amplify";
import { User } from "../../src/models";
import { S3Image } from "aws-amplify-react-native";
import AudioPlayer from "../AudioPlayer";

const green = "rgb(0,195,0)";
const orange = "rgb(247,152,98)";

const Message = ({ message }) => {
  const [user, setUser] = useState<User | undefined>();
  const [isMe, setIsMe] = useState<boolean>(false);
  const [soundURI, setSoundURI] = useState<any>(null);

  const { width } = useWindowDimensions();

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    if (message.audio) {
      Storage.get(message.audio).then(setSoundURI);
    }
  }, [message]);

  useEffect(() => {
    const checkIfMe = async () => {
      if (!user) {
        return;
      }
      const authUser = await Auth.currentAuthenticatedUser();
      setIsMe(user.id === authUser.attributes.sub);
    };
    checkIfMe();
  }, [user]);

  if (!user) {
    return <ActivityIndicator />;
  }

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.rightContainer : styles.leftContainer,
        { width: soundURI ? "60%" : "auto" },
      ]}
    >
      {message.image && (
        <View style={{ marginBottom: message.content ? 5 : 0 }}>
          <S3Image
            imgKey={message.image}
            style={{ width: width * 0.5, aspectRatio: 4 / 3 }}
            resizeMode="contain"
          />
        </View>
      )}
      {soundURI && <AudioPlayer soundURI={soundURI} />}
      {!!message.content && <Text style={styles.text}>{message.content}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    maxWidth: "60%",
  },
  text: {
    color: "white",
  },
  leftContainer: {
    backgroundColor: orange,
    marginLeft: 10,
    marginRight: "auto",
  },
  rightContainer: {
    backgroundColor: green,
    marginLeft: "auto",
    marginRight: 10,
  },
});

export default Message;
