import { FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native";

export default () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "black",
        }}
      >
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen
          name="friends"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="user-friends" size={24} color={color} />
            ),
            title: "Friends",
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="map-marked-alt" size={24} color={color} />
            ),
            title: "Map",
          }}
        />
        <Tabs.Screen
          name="emergency"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome5
                name="exclamation-triangle"
                size={24}
                color={color}
              />
            ),
            title: "Emergency",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="user-cog" size={24} color={color} />
            ),
            title: "Settings",
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};
