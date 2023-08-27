import {
  MaterialCommunityIcons,
  Entypo,
  SimpleLineIcons,
} from "@expo/vector-icons";
import * as Location from "expo-location";
import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import KakaoShareLink from "react-native-kakao-share-link";
import MapView, { Marker } from "react-native-maps";

import { userAtom } from "../../userAtom";
import { getSocket } from "../../utils/socketConfig";

export const locationAtom = atom(null);
export const friendLocationsAtom = atom([]);

export default function Map() {
  const [user] = useAtom(userAtom);
  const [location, setLocation] = useAtom(locationAtom);
  const [friendLocations, setFriendLocations] = useAtom(friendLocationsAtom);
  const [initialRegion, setInitialRegion] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [placeholderText, setPlaceholderText] = useState("Search");
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [searchPredictions, setSearchPredictions] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isW3wMode, setIsW3wMode] = useState(false);

  const socket = getSocket();

  useEffect(() => {
    const getLocation = async () => {
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

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 10,
        },
        async (newLocation) => {
          const address = await Location.reverseGeocodeAsync(
            newLocation.coords,
          );
          const w3wAPIKey = process.env.EXPO_PUBLIC_W3W_API_KEY;
          const w3wData = await fetch(
            `https://api.what3words.com/v3/convert-to-3wa?key=${w3wAPIKey}&coordinates=${newLocation.coords.latitude},${newLocation.coords.longitude}&language=ko&format=json`,
            {
              method: "GET",
            },
          );
          const w3w = await w3wData.json();

          setLocation({
            coords: newLocation.coords,
            address: address[0],
            w3w,
          });

          socket.emit("updateLocation", {
            id: user.id,
            username: user.displayName,
            location: newLocation.coords,
          });
        },
      );
    };

    getLocation();
  }, []);

  useEffect(() => {
    const updatePlaceholder = async () => {
      setPlaceholderText(
        isW3wMode ? location.w3w.words : location.address.name,
      );
    };

    if (location) updatePlaceholder();
  }, [location, isW3wMode]);

  useEffect(() => {
    socket.on("friendLocationUpdate", (data) => {
      setFriendLocations((prevLocations) => {
        const updatedLocations = prevLocations.filter(
          (location) => location.id !== data.id,
        );

        updatedLocations.push({
          id: data.id,
          username: data.username,
          location: data.location,
        });

        return updatedLocations;
      });
    });

    return () => {
      socket.off("friendLocationUpdate");
    };
  }, []);

  const handleSearchTextChange = (text) => {
    setSearchText(text);
  };

  const handleSearch = async () => {
    if (!searchText) return;

    try {
      const mapAPIKey = process.env.EXPO_PUBLIC_MAP_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${mapAPIKey}&input=${searchText}`,
      );
      const data = await response.json();

      if (data.status === "OK" && data.predictions.length > 0) {
        setSearchPredictions(data.predictions);
        const placeId = data.predictions[0].place_id;
        const placeDetailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?key=${mapAPIKey}&place_id=${placeId}`,
        );
        const placeDetails = await placeDetailsResponse.json();

        if (
          placeDetails.status === "OK" &&
          placeDetails.result.geometry &&
          placeDetails.result.geometry.location
        ) {
          const location = placeDetails.result.geometry.location;
          setSearchedLocation({
            latitude: location.lat,
            longitude: location.lng,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching autocomplete data:", error);
    }
  };

  const renderFriendMarkers = () => {
    return friendLocations.map((friendLocation) => (
      <Marker
        key={friendLocation.id}
        coordinate={friendLocation.location}
        title={friendLocation.username}
      >
        <MaterialCommunityIcons name="penguin" size={40} color="blue" />
      </Marker>
    ));
  };

  const renderSearchPredictions = () => {
    if (searchText && searchPredictions.length > 0) {
      return (
        <View style={styles.searchPredictions}>
          {searchPredictions.map((prediction, index) => (
            <Text key={index}>
              {prediction.structured_formatting.main_text}{" "}
              {prediction.structured_formatting.secondary_text}
              {"\n"}
            </Text>
          ))}
        </View>
      );
    }
    return null;
  };

  const handleW3wButtonPress = () => {
    setIsW3wMode((prevIsW3wMode) => !prevIsW3wMode);
    // setPlaceholderText(isW3wMode ? location.w3w.words : location.address.name);
  };

  const handleShareButtonPress = async () => {
    try {
      const response = await KakaoShareLink.sendLocation({
        address: `///${location.w3w.words}`,
        addressTitle: "현재 내 위치 📍",
        content: {
          title: `현재 내 위치 📍 ///${location.w3w.words}`,
          imageUrl: "https://i.postimg.cc/vZgSdbWC/meeeter.png",
          link: {
            mobileWebUrl: `http://map.kakao.com/link/search////${location.w3w.words}`,
          },
          description: "카카오맵에서 현재 내 위치를 확인하세요.",
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const w3wButtonColor = isW3wMode ? "#E11F26" : "white";
  const w3wButtonTextColor = isW3wMode ? "white" : "#E11F26";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      position: "relative",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 10,
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 2,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
      margin: 10,
      zIndex: 2,
    },
    searchInput: {
      flex: 1,
      height: 50,
      fontSize: 20,
      paddingLeft: 10,
    },
    w3wButton: {
      backgroundColor: w3wButtonColor,
      borderRadius: 50,
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    w3wButtonText: {
      color: w3wButtonTextColor,
      fontSize: 20,
      fontWeight: "bold",
    },
    map: {
      flex: 1,
      zIndex: -1,
    },
    searchPredictions: {
      position: "relative",
      left: 10,
      right: 10,
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      padding: 10,
      zIndex: 1,
      elevation: 2,
    },
    shareButton: {
      backgroundColor: "#FFFFFF",
      borderRadius: 50,
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      bottom: 20,
      right: 20,
      zIndex: 2,
      elevation: 2,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchText}
          onChangeText={handleSearchTextChange}
          onChange={handleSearch}
          placeholder={placeholderText}
        />
        <TouchableOpacity
          onPress={handleShareButtonPress}
          style={{ paddingRight: 10 }}
        >
          <SimpleLineIcons name="share-alt" size={24} color="black" />
        </TouchableOpacity>
      </View>
      {renderSearchPredictions()}
      {initialRegion && (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          mapType="mutedStandard"
          // showsUserLocation
          followsUserLocation
          userLocationPriority="balanced"
          zIndex={-1}
        >
          {location && (
            <Marker coordinate={location.coords} title="My Location">
              <MaterialCommunityIcons
                name="penguin"
                size={40}
                color="#E11F26"
              />
            </Marker>
          )}
          {renderFriendMarkers()}
          {searchedLocation && (
            <Marker
              coordinate={searchedLocation}
              pinColor="green"
              title={searchPredictions[0].structured_formatting.main_text}
            >
              <Entypo name="location-pin" size={40} color="green" />
            </Marker>
          )}
        </MapView>
      )}
      <TouchableOpacity
        style={{
          ...styles.w3wButton,
          position: "absolute",
          bottom: 20,
          right: 20,
        }}
        onPress={handleW3wButtonPress}
      >
        <Text style={styles.w3wButtonText}>///</Text>
      </TouchableOpacity>
    </View>
  );
}
