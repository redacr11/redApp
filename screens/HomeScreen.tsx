import React from "react";
import { StyleSheet, View, FlatList, Text, Pressable } from "react-native";
import { Auth } from "aws-amplify";
import ChatRoomItem from "../components/ChatRoomItem";

import chatRoomsData from "../assets/dummy-data/ChatRooms";

export default function TabOneScreen() {
  const logOut = () => {
    Auth.signOut();
  };

  return (
    <View style={styles.page}>
      <FlatList
        data={chatRoomsData}
        renderItem={({ item }) => <ChatRoomItem chatRoom={item} />}
        showsVerticalScrollIndicator={false}
      />
      {/* <Pressable
        onPress={logOut}
        style={{
          backgroundColor: "yellow",
          height: 50,
          margin: 10,
          borderRadius: 50,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>Logout</Text>
      </Pressable> */}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});
