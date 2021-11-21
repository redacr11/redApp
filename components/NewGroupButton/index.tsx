import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";

import { FontAwesome } from "@expo/vector-icons";

const NewGroupButton = ({ onPress }) => {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.group}>
        <FontAwesome name={"group"} size={24} color="#4f4f4f" />
        <Text style={styles.groupText}>New Group</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  group: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#e3e3e3",
  },
  groupText: {
    marginLeft: 10,
    fontWeight: "bold",
  },
});

export default NewGroupButton;
