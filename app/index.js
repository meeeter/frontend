import "react-native-gesture-handler";
import * as Google from "expo-auth-session/providers/google";
import { Link, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from "firebase/auth";
import { useAtom } from "jotai";
import { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

import { auth } from "../firebaseConfig";
import { userAtom } from "../userAtom";
import { initializeSocket } from "../utils/socketConfig";

import * as Location from "expo-location";
import { initialRegionAtom } from "../initialRegionAtom";
import { locationAtom } from "../locationAtom";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [, setUser] = useAtom(userAtom);
  const [, setInitialRegion] = useAtom(initialRegionAtom);
  const [, setLocation] = useAtom(locationAtom);
  const [errorMsg, setErrorMsg] = useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
  });
  const serverURL = process.env.EXPO_PUBLIC_SERVER_URL;

  useEffect(() => {
    const getInitialLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      const initialLocation = await Location.getCurrentPositionAsync({});
      setInitialRegion({
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

      setLocation(initialLocation);
    }

    getInitialLocation();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { email } = user;
        try {
          const existingUserResponse = await fetch(
            `${serverURL}/users?email=${email}`,
            {
              method: "GET",
            },
          );

          const existingUserData = await existingUserResponse.json();

          if (existingUserResponse.ok) {
            setUser({
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              id: existingUserData.existingUser._id,
            });
            console.log("User already exists");
            initializeSocket(existingUserData.existingUser._id);
          } else {
            const newUser = await fetch(`${serverURL}/users`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ user }),
            });

            const newUserData = await newUser.json();

            if (newUser.ok) {
              setUser({
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                id: newUserData.newUser._id,
              });
              console.log("User registered successfully");
              initializeSocket(newUserData.newUser._id);
            } else {
              console.error("User registration failed");
            }
          }
          router.push("/home/settings");
        } catch (error) {
          console.error(error);
        }
      } else {
        console.log("User is not authenticated");
      }
    });

    return () => unsubscribe();
  }, [setUser]);


  return (
    <View style={styles.container}>
      <Image source={require("../assets/splash.png")} style={styles.logo} />
      <TouchableOpacity style={styles.button} onPress={() => promptAsync()}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "medium",
  },
});
