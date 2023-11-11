import React, { memo } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  useWindowDimensions,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { snapPoint } from "react-native-redash";

const { width: wWidth, height: wHeight } = Dimensions.get("window");

const DismissedCardItem = ({
  card,
  index,
  gesture,
  dismissedSharedValues,
  style,
  arrayLength,
  sharedValues,
  lastIndexOfCardData,
  swipeDownHandler,
}) => {
  const { height, width } = useWindowDimensions();

  const cardHeight = height * 0.5;
  const ySnapPoints = [-height, 0, height];
  //Animating horizontal swiped items to this postion to keep them away from viewport
  const cardItemCenterPosition = -(cardHeight + height * 0.1);
  const dismissedCardTopPosition = -cardHeight * 0.9;

  const panGesture = useAnimatedGestureHandler({
    onStart: (_, context) => {
      // return if the card is not the last element of dismissedCards
      if (index !== arrayLength - 1) return;
      // Y position of the card on top of the dismissed cards stack
      context.dismissedStartY = dismissedSharedValues[arrayLength - 1].y.value;
      // Y position of the card on top of the cards stack in the bottom
      context.startY = cardItemCenterPosition;
    },
    onActive(event, context) {
      if (index !== arrayLength - 1) return;

      dismissedSharedValues[arrayLength - 1].y.value =
        event.translationY + context.dismissedStartY;
      sharedValues[lastIndexOfCardData].y.value =
        event.translationY + context.startY;
    },
    onEnd: ({ velocityY }, context) => {
      if (index !== arrayLength - 1) return;

      const yDest = snapPoint(
        dismissedSharedValues[arrayLength - 1].y.value,
        velocityY,
        [-cardHeight * 0.1, 0, cardHeight * 0.9]
      );

      if (yDest >= 0) {
        dismissedSharedValues[index].y.value = withTiming(cardHeight * 0.26);
        sharedValues[lastIndexOfCardData].y.value = withTiming(0, {}, () => {
          runOnJS(swipeDownHandler)();
        });
      } else {
        dismissedSharedValues[arrayLength - 1].y.value = withTiming(
          dismissedCardTopPosition
        );
        sharedValues[lastIndexOfCardData].y.value = withTiming(
          cardItemCenterPosition
        );
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const transform = [
      { translateY: dismissedSharedValues[index]?.y.value || 0 },
      { perspective: 1000 },
    ];

    return {
      transform: transform,
    };
  });

  return (
    <PanGestureHandler onGestureEvent={panGesture}>
      <Animated.View style={[styles.card, style, cardStyle]}>
        <Animated.View style={[styles.childrenContainer]}>
          {/* <CardRenderHtml source={card.source} /> */}
          <Text>{card.source}</Text>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
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
    // justifyContent: "center",
    width: "100%",
    height: "100%",
  },
});

export default memo(DismissedCardItem);
