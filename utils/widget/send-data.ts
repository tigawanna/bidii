import * as ExpoWidgetsModule from "@bittingz/expo-widgets";
import Constants from "expo-constants";
import { Platform } from "react-native";

export function sendWidgetData() {
  const androidPackage = Constants.expoConfig?.android?.package;

  if (Platform.OS === "ios") {
    const json = JSON.stringify({ message: "Hello from app!" });
    ExpoWidgetsModule.setWidgetData(json);
  } else if (androidPackage) {
    const json = JSON.stringify({ message: "Hello from app!" });
    ExpoWidgetsModule.setWidgetData(json, androidPackage);
  }
}
