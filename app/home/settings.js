import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useAtom } from "jotai";
import { View, Text, Image, Button, StyleSheet } from "react-native";

import { auth } from "../../firebaseConfig";
import { userAtom } from "../../userAtom";

export default function Settings() {
  const [user] = useAtom(userAtom);

  return (
    <View style={styles.container}>
      {user && (
        <>
          <Image source={{ uri: user.photoURL }} style={styles.userImage} />
          <Text style={styles.greetingText}>Hello, {user.displayName} 👋</Text>
          <Text>{user.email}</Text>
        </>
      )}
      <Button
        title="Sign out"
        onPress={async () => {
          await signOut(auth);
          router.replace("/");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  userImage: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: "medium",
  },
});
