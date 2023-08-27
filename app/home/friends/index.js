import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Friends() {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("home/friends/friendList")}
      >
        <MaterialCommunityIcons
          name="account-box-multiple"
          size={60}
          color="black"
        />
        <View style={styles.cardText}>
          <Text style={styles.title}>FRIEND LIST</Text>
          <Text style={styles.description}>See all your friends</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("home/friends/addFriend")}
      >
        <MaterialCommunityIcons name="account-search" size={60} color="black" />
        <View style={styles.cardText}>
          <Text style={styles.title}>ADD FRIEND</Text>
          <Text style={styles.description}>Search and add your friend</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("home/friends/friendRequests")}
      >
        <MaterialCommunityIcons name="account-heart" size={60} color="black" />
        <View style={styles.cardText}>
          <Text style={styles.title}>FRIEND REQUESTS</Text>
          <Text style={styles.description}>See received and sent requests</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
  },
  cardText: {
    marginLeft: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  description: {
    marginTop: 5,
    fontSize: 16,
  },
});
