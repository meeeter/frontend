import { useAtom } from "jotai";
import { useState } from "react";
import { View, Text, Image, Button, StyleSheet, TextInput } from "react-native";

import { userAtom } from "../../../userAtom";
import { getSocket } from "../../../utils/socketConfig";

export default function AddFriend() {
  const [user] = useAtom(userAtom);
  const [searchText, setSearchText] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [searchedSelf, setSearchedSelf] = useState(false);

  const serverURL = process.env.EXPO_PUBLIC_SERVER_URL;
  const socket = getSocket();

  const searchUser = async () => {
    try {
      if (searchText === user.email) {
        setUserNotFound(false);
        setFoundUser(null);
        setFriendRequestSent(false);
        setSearchedSelf(true);
        return;
      }
      const response = await fetch(`${serverURL}/users?email=${searchText}`, {
        method: "GET",
      });

      if (response.ok) {
        const userData = await response.json();
        setFoundUser(userData.existingUser);
        setUserNotFound(false);
        setSearchedSelf(false);
      } else {
        setFoundUser(null);
        setUserNotFound(true);
        setSearchedSelf(false);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const sendFriendRequest = () => {
    socket.emit("sendFriendRequest", {
      sender: user.id,
      recipient: foundUser._id,
      status: "pending",
    });

    setFriendRequestSent(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Text style={styles.searchLabel}>Search user by email:</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter email"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
          onSubmitEditing={searchUser}
        />
      </View>

      {userNotFound && <Text style={styles.errorText}>User Not Found</Text>}
      {searchedSelf && <Text style={styles.errorText}>You cannot send a friend request to yourself.</Text>}
      {foundUser && (
        <View style={styles.profileCard}>
          <Image source={{ uri: foundUser.photoURL }} style={styles.photoURL} />
          <View style={styles.userInfo}>
            <Text style={styles.usernameText}>{foundUser.username}</Text>
            <Text style={styles.emailText}>{foundUser.email}</Text>
          </View>
          <Button
            title={friendRequestSent ? "Sent" : "Send"}
            disabled={friendRequestSent}
            onPress={sendFriendRequest}
          />
        </View>
      )}
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
  searchBox: {
    width: "100%",
    marginBottom: 20,
  },
  searchLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  searchInput: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
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
  errorText: {
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "bold",
  },
});
