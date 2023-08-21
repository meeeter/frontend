import { AntDesign } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Friends() {
  const [pressedCard, setPressedCard] = useState(null);

  const handlePressIn = (card) => {
    setPressedCard(card);
  };

  const handlePressOut = () => {
    setPressedCard(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.card,
          pressedCard === "friendList" && styles.pressedCard,
        ]}
        onPressIn={() => handlePressIn("friendList")}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Link style={styles.link} href="home/friends/friendList">
          <Text
            style={[
              styles.cardTitle,
              pressedCard === "friendList" && styles.pressedText,
            ]}
          >
            Friend List
          </Text>
        </Link>
        <AntDesign
          name="arrowright"
          size={24}
          color={pressedCard === "friendList" ? "#fff" : "#f16523"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, pressedCard === "addFriend" && styles.pressedCard]}
        onPressIn={() => handlePressIn("addFriend")}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Link style={styles.link} href="home/friends/addFriend">
          <Text
            style={[
              styles.cardTitle,
              pressedCard === "addFriend" && styles.pressedText,
            ]}
          >
            Add Friend
          </Text>
        </Link>
        <AntDesign
          name="arrowright"
          size={24}
          color={pressedCard === "newFriend" ? "#fff" : "#f16523"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          pressedCard === "friendRequests" && styles.pressedCard,
        ]}
        onPressIn={() => handlePressIn("friendRequests")}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Link style={styles.link} href="home/friends/friendRequests">
          <Text
            style={[
              styles.cardTitle,
              pressedCard === "friendRequests" && styles.pressedText,
            ]}
          >
            Friend Requests
          </Text>
        </Link>
        <AntDesign
          name="arrowright"
          size={24}
          color={pressedCard === "friendRequests" ? "#fff" : "#f16523"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: "#f8f8f8",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10,
  },
  pressedCard: {
    backgroundColor: "#f16523",
  },
  link: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#231f20",
  },
  pressedText: {
    color: "#fff",
  },
});
