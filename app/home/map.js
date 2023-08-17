import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet, View, Text, TextInput } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Map() {
  const [location, setLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [searchPredictions, setSearchPredictions] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

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
        (newLocation) => {
          setLocation(newLocation);
        },
      );
    };

    getLocation();
  }, []);

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

  return (
    <View style={styles.container}>
      <TextInput
        style={{ height: 40, borderColor: "gray", borderWidth: 3, margin: 10 }}
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
        onChange={handleSearch}
        placeholder="Search"
      />
      {searchPredictions && (
        <View style={styles.searchPredictions}>
          <Text>
            {searchPredictions.map((prediction, index) => (
              <Text key={index}>
                {prediction.structured_formatting.main_text}{" "}
                {prediction.structured_formatting.secondary_text}
                {"\n"}
              </Text>
            ))}
          </Text>
        </View>
      )}
      {initialRegion && (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          mapType="mutedStandard"
          showsUserLocation
          userLocationPriority="balanced"
        >
          {location && (
            <Marker coordinate={location.coords} title="My Location" />
          )}
          {searchedLocation && (
            <Marker
              coordinate={searchedLocation}
              pinColor="green"
              title={searchPredictions[0].structured_formatting.main_text}
            />
          )}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  searchPredictions: {
    position: "absolute",
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 10,
    zIndex: 1,
    elevation: 2,
  },
});
