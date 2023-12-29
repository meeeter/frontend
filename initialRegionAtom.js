import { atom } from "jotai";

export const initialRegionAtom = atom({
  latitude: null,
  longitude: null,
  latitudeDelta: null,
  longitudeDelta: null,
});
