import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet, View, Button, Text, TextInput } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function Map() {
  const [location, setLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
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

  return (
    <View style={styles.container}>
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
});
