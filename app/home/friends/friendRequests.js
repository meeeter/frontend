import { useEffect, useState } from "react";
import { View, Text, Image, Button, StyleSheet } from "react-native";

import { getSocket } from "../../../utils/socketConfig";

export default function FriendRequests() {
  const [friendRequests, setFriendRequests] = useState([]);
  const serverURL = process.env.EXPO_PUBLIC_SERVER_URL;

  useEffect(() => {
    const socket = getSocket();

    socket.on("friendRequestReceived", async (data) => {
      try {
        const userId = data.sender;
        const response = await fetch(`${serverURL}/users/${userId}`);
        if (response.ok) {
          const senderUser = await response.json();
          setFriendRequests((prevRequests) => [...prevRequests, senderUser]);
        }
      } catch (error) {
        console.error("Error fetching sender user:", error);
      }
    });

    return () => {
      socket.off("friendRequestReceived");
    };
  }, []);

  const acceptFriendRequest = (senderId) => {};
  const rejectFriendRequest = (senderId) => {};

  return (
    <View style={styles.container}>
      {friendRequests.map((sender) => (
        <View key={sender._id} style={styles.profileCard}>
          <Image source={{ uri: sender.photoURL }} style={styles.photoURL} />
          <View style={styles.userInfo}>
            <Text style={styles.usernameText}>{sender.username}</Text>
            <Text style={styles.emailText}>{sender.email}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Accept" onPress={() => acceptFriendRequest(sender._id)} />
            <Button title="Reject" onPress={() => rejectFriendRequest(sender._id)} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  photoURL: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  usernameText: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "bold",
  },
  emailText: {
    fontSize: 16,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
  },
});
