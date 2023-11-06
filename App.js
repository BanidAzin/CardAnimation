import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CardSwiper } from "./src/CardSwiper";
import cardData from "./src/cardData";

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar />
      <CardSwiper data={cardData.data} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
