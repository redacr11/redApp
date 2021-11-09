import React from "react";
import { View, Text, StyleSheet } from "react-native";

const green = "rgb(0,195,0)";
const orange = "rgb(247,152,98)";

const myID = "u1";

const Message = ({ message }) => {
  const isMe = message.user.id === myID;
  return (
    <View
      style={[
        styles.container,
        isMe ? styles.rightContainer : styles.leftContainer,
      ]}
    >
      <Text style={styles.text}>{message.content}</Text>
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
