import { Stack } from "expo-router";

export default () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Friends", headerShown: false }}
      />
      <Stack.Screen name="friendList" options={{ title: "Friend List" }} />
      <Stack.Screen name="addFriend" options={{ title: "Add Friend" }} />
      <Stack.Screen
        name="friendRequests"
        options={{ title: "Friend Requests" }}
      />
    </Stack>
  );
};
