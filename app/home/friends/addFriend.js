import { useAtom } from "jotai";
import { useState } from "react";
import { View, Text, Image, Button, StyleSheet, TextInput } from "react-native";

import { userAtom } from "../../../userAtom";

export default function AddFriend() {
  const [user] = useAtom(userAtom);
  const [searchText, setSearchText] = useState("");
  const [foundUser, setFoundUser] = useState(null);
  const [userNotFound, setUserNotFound] = useState(false);

  const serverURL = process.env.EXPO_PUBLIC_SERVER_URL;

  const searchUser = async () => {
    try {
      const response = await fetch(`${serverURL}/users/${searchText}`, {
        method: "GET",
      });

      if (response.ok) {
        const userData = await response.json();
        setFoundUser(userData.existingUser);
        setUserNotFound(false);
      } else {
        setFoundUser(null);
        setUserNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
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

      {userNotFound && <Text style={styles.noUserText}>User Not Found</Text>}

      {foundUser && (
        <View style={styles.profileCard}>
          <Image source={{ uri: foundUser.photoURL }} style={styles.photoURL} />
          <View style={styles.userInfo}>
            <Text style={styles.usernameText}>{foundUser.username}</Text>
            <Text style={styles.emailText}>{foundUser.email}</Text>
          </View>
          <Button title="Send" />
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
  noUserText: {
    fontSize: 16,
    fontStyle: "italic",
  },
});
