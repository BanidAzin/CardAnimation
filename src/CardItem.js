import React, { memo } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  interpolate,
} from "react-native-reanimated";
import CardRenderHtml from "./CardRenderHtml";

const { width: wWidth, height: wHeight } = Dimensions.get("window");

const CardItem = ({
  card,
  gesture,
  sharedValues,
  index,
  dismissed = false,
  arrayLength,
  style,
}) => {
  const rotate = useDerivedValue(
    () => interpolate(sharedValues.x?.value || 0, [0, wWidth], [0, 40]) + "deg"
  );

  const cardStyle = useAnimatedStyle(() => {
    const transform = [
      { translateY: sharedValues.y.value },
      { translateX: sharedValues.x?.value || 0 },
      { rotate: rotate.value },
      { perspective: 1000 },
    ];

    return {
      transform: transform,
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gesture}>
      <Animated.View style={[styles.card, style, cardStyle]}>
        <Animated.View style={[styles.childrenContainer]}>
          {/* <ScrollView scrollEnabled={index === arrayLength - 1 || dismissed}> */}
          <CardRenderHtml source={card.source} />
          {/* </ScrollView> */}
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 30,
    width: wWidth * 0.9,
    height: wHeight * 0.5,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderColor: "#dfdfdf",
    borderWidth: 2,
    pointerEvents: "box-none",
  },
  childrenContainer: {
    borderRadius: 40,
    position: "absolute",
    alignItems: "center",
    width: "100%",
    height: "100%",
    padding: "10%",
  },
});

export default memo(CardItem);
