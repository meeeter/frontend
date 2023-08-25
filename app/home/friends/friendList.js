import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

import { userAtom } from "../../../userAtom";

export default function FriendList() {
  const [user] = useAtom(userAtom);
  const serverURL = process.env.EXPO_PUBLIC_SERVER_URL;
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const getFriends = async () => {
      try {
        const response = await fetch(`${serverURL}/users/${user.id}/friends`, {
          method: "GET",
        });

        if (response.ok) {
          const friendsData = await response.json();
          setFriends(friendsData.friends);
        }
      } catch (error) {
        console.error("Error fetching friends: ", error);
      }
    };

    getFriends();
  }, []);

  return (
    <View style={styles.container}>
      {friends.map((friend) => (
        <View key={friend._id} style={styles.profileCard}>
          <Image source={{ uri: friend.photoURL }} style={styles.photoURL} />
          <View style={styles.userInfo}>
            <Text style={styles.usernameText}>{friend.username}</Text>
            <Text style={styles.emailText}>{friend.email}</Text>
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
});
