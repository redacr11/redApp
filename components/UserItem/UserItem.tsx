import React from "react";
import { Text, View, Image, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "./styles";
import { DataStore, Auth } from "aws-amplify";
import { ChatRoom, User, ChatRoomUser } from "../../src/models";

export default function UserItem({ user }) {
  const navigation = useNavigation();

  const onPress = async () => {
    //TODO if there is already a chatroom between these 2 users then redirect to the existing chatroom, otherwise, create a new chatroom

    // Create a chatroom with the person
    const newChatRoom = await DataStore.save(new ChatRoom({ newMessages: 0 }));

    // Connect authenticated user with the chat room
    const authUser = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, authUser.attributes.sub);
    await DataStore.save(
      new ChatRoomUser({
        user: dbUser,
        chatroom: newChatRoom,
      })
    );

    // Connect clicked user with the chatroom
    await DataStore.save(
      new ChatRoomUser({
        user,
        chatroom: newChatRoom,
      })
    );

    navigation.navigate("ChatRoom", { id: newChatRoom.id });
  };
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image
        source={{
          uri: user.imageUri,
        }}
        style={styles.image}
      />

      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
        </View>
      </View>
    </Pressable>
  );
}
