import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { View, Text, Image, Button, StyleSheet, Alert } from "react-native";

import { userAtom } from "../../../userAtom";
import { getSocket } from "../../../utils/socketConfig";

export default function FriendRequests() {
  const [user] = useAtom(userAtom);
  const [receivedFriendRequests, setReceivedFriendRequests] = useState([]);
  const [sentFriendRequests, setSentFriendRequests] = useState([]);
  const serverURL = process.env.EXPO_PUBLIC_SERVER_URL;

  useEffect(() => {
    const socket = getSocket();

    const loadFriendRequests = async () => {
      try {
        const response = await fetch(
          `${serverURL}/users/${user.id}/friend-requests`,
          { method: "GET" },
        );
        if (response.ok) {
          const friendRequestsData = await response.json();
          const { receivedFriendRequests, sentFriendRequests } =
            friendRequestsData;
          setReceivedFriendRequests(receivedFriendRequests);
          setSentFriendRequests(sentFriendRequests);
        }
      } catch (error) {
        console.error("Error loading friend reqeusts:", error);
      }
    };

    loadFriendRequests();

    socket.on("friendRequestReceived", async (data) => {
      try {
        const userId = data.sender;
        const response = await fetch(`${serverURL}/users/${userId}`, {
          method: "GET",
        });
        if (response.ok) {
          const senderUser = await response.json();
          setReceivedFriendRequests((prevRequests) => [
            ...prevRequests,
            { fromUser: senderUser },
          ]);
        }
      } catch (error) {
        console.error("Error fetching sender user:", error);
      }
    });

    return () => {
      socket.off("friendRequestReceived");
    };
  }, []);

  const acceptFriendRequest = async (senderId, senderUsername) => {
    const userId = user.id;
    try {
      const deleteRecipientRequest = await fetch(
        `${serverURL}/users/${userId}/friend-requests?friendId=${senderId}`,
        { method: "DELETE" },
      );

      const deleteSenderRequest = await fetch(
        `${serverURL}/users/${senderId}/friend-requests?friendId=${userId}`,
        { method: "DELETE" },
      );

      const addRecipientFriend = await fetch(
        `${serverURL}/users/${userId}/friends`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ friendId: senderId }),
        },
      );

      const addSenderFriend = await fetch(
        `${serverURL}/users/${senderId}/friends`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ friendId: userId }),
        },
      );

      if (
        deleteRecipientRequest.ok &&
        deleteSenderRequest.ok &&
        addRecipientFriend.ok &&
        addSenderFriend.ok
      ) {
        setReceivedFriendRequests((prevRequests) =>
          prevRequests.filter((request) => request.fromUser._id !== senderId),
        );
        Alert.alert(`You're now friends with ${senderUsername} 🥳`);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const rejectFriendRequest = async (senderId, senderUsername) => {
    const userId = user.id;
    try {
      const deleteRecipientRequest = await fetch(
        `${serverURL}/users/${userId}/friend-requests?friendId=${senderId}`,
        { method: "DELETE" },
      );

      const deleteSenderRequest = await fetch(
        `${serverURL}/users/${senderId}/friend-requests?friendId=${userId}`,
        { method: "DELETE" },
      );

      if (deleteRecipientRequest.ok && deleteSenderRequest.ok) {
        setReceivedFriendRequests((prevRequests) =>
          prevRequests.filter((request) => request.fromUser._id !== senderId),
        );
        Alert.alert(`You've rejected ${senderUsername}'s friend request 😈`);
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeaderText}>Received</Text>
      </View>
      {receivedFriendRequests.map((request) => (
        <View key={request.fromUser._id} style={styles.profileCard}>
          <Image
            source={{ uri: request.fromUser.photoURL }}
            style={styles.photoURL}
          />
          <View style={styles.userInfo}>
            <Text style={styles.usernameText}>{request.fromUser.username}</Text>
            <Text style={styles.emailText}>{request.fromUser.email}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title="Accept"
              onPress={() =>
                acceptFriendRequest(
                  request.fromUser._id,
                  request.fromUser.username,
                )
              }
            />
            <Button
              title="Reject"
              onPress={() =>
                rejectFriendRequest(
                  request.fromUser._id,
                  request.fromUser.username,
                )
              }
            />
          </View>
        </View>
      ))}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeaderText}>Sent</Text>
      </View>
      {sentFriendRequests.map((request) => (
        <View key={request.toUser._id} style={styles.profileCard}>
          <Image
            source={{ uri: request.toUser.photoURL }}
            style={styles.photoURL}
          />
          <View style={styles.userInfo}>
            <Text style={styles.usernameText}>{request.toUser.username}</Text>
            <Text style={styles.emailText}>{request.toUser.email}</Text>
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
  sectionContainer: {
    alignSelf: "stretch",
    marginBottom: 20,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 25,
    fontWeight: "bold",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  photoURL: {
    width: 40,
    height: 40,
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
    fontSize: 15,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: "row",
  },
});
