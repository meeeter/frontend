import {
  Entypo,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as SMS from "expo-sms";
import { useAtom } from "jotai";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { locationAtom } from "./map";

export default function Emergency() {
  const [location] = useAtom(locationAtom);
  const { coords, address, w3w } = location;

  const handlePoliceButtonPress = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const { result } = await SMS.sendSMSAsync(
        ["112"],
        `112 긴급신고\n\n[위도] ${coords.latitude}\n[경도] ${coords.longitude}\n[w3w] ${w3w.words}\n[주소] ${address.city} ${address.district} ${address.name}`,
      );
      console.log(result);
    }
  };

  const handleFireButtonPress = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const { result } = await SMS.sendSMSAsync(
        ["119"],
        `119 긴급신고\n\n[위도] ${coords.latitude}\n[경도] ${coords.longitude}\n[w3w] ${w3w.words}\n[주소] ${address.city} ${address.district} ${address.name}`,
      );
      console.log(result);
    }
  };

  const handleAlertFriendsButtonPress = () => {
    console.log("Broadcasting to all friends");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleAlertFriendsButtonPress}
      >
        <Entypo name="megaphone" size={100} color="black" />
        <Text style={styles.label}>ALERT FRIENDS</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handlePoliceButtonPress}>
        <MaterialCommunityIcons name="police-badge" size={100} color="black" />
        <Text style={styles.label}>POLICE</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleFireButtonPress}>
        <MaterialIcons name="local-fire-department" size={100} color="black" />
        <Text style={styles.label}>FIRE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: 20,
  },
});
