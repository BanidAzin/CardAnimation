import React, { memo } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  useWindowDimensions,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { snapPoint } from "react-native-redash";

const { width: wWidth, height: wHeight } = Dimensions.get("window");

const CardItem = ({
  card,
  index,
  sharedValues,
  style,
  arrayLength,
  horizontalSwipeHandler,
  swipeUpHandler,
}) => {
  const { height, width } = useWindowDimensions();

  const cardHeight = height * 0.5;
  const xSnapPoints = [-width, 0, width];
  const ySnapPoints = [-height, 0, height];
  //Animating horizontal swiped items to this postion to keep them away from viewport
  const hiddenTranslateX = 1.5 * width;
  const cardItemCenterPosition = -(cardHeight + height * 0.1);
  const dismissedCardTopPosition = -cardHeight * 0.9;

  const panGesture = useAnimatedGestureHandler({
    onStart: (_, context) => {
      //Retrieve the current x and y position values stored in the sharedValues array and assign them to the context's startY and startX values.
      // console.log({index, length: arrayLength - 1});
      context.startY = sharedValues[index].y.value;
      context.startX = sharedValues[index].x.value;
    },
    onActive(event, context) {
      //Activate horizonal pan gesture only on the last item of the bottom card stack
      // console.log({index, length: arrayLength - 1});
      if (index === arrayLength - 1) {
        //Ensuring the center card won't animate on the y axis
        sharedValues[arrayLength - 1].y.value = cardItemCenterPosition;
        sharedValues[arrayLength - 1].x.value =
          event.translationX + context.startX;
        return;
      }

      //Disable the swipeup gesture for the whole bottom card stack except the second last item
      if (index !== arrayLength - 2) return;
      //Animating second last item in the bottom card stack according to the pan gesture
      sharedValues[arrayLength - 2].y.value =
        event.translationY + context.startY;
      //Animating last item in the bottom card stack according to the pan gesture of the second last item of the bottom card stack
      sharedValues[arrayLength - 1].y.value =
        cardItemCenterPosition + event.translationY;
    },
    onEnd: ({ velocityX, velocityY }) => {
      //Activate horizonal pan gesture only on the last item of the bottom card stack
      if (index === arrayLength - 1) {
        const xDest = snapPoint(
          sharedValues[index].x.value,
          velocityX,
          xSnapPoints
        );

        //Cancell horizontal animation if it doesn't have enough velocity
        if (xDest === 0) {
          sharedValues[arrayLength - 1].x.value = withTiming(0);
        } else {
          const onSwipe =
            velocityX > 0 ? "swipeRightHandler" : "swipeLeftHandler";

          sharedValues[arrayLength - 1].x.value = withTiming(
            Math.sign(velocityX) * hiddenTranslateX,
            {},
            () => {
              runOnJS(horizontalSwipeHandler)();
            }
          );
        }

        return;
      }

      //To disable the pan gesture for the whole bottom card stack excpet the second last item
      if (index !== arrayLength - 2) return;

      const yDest = snapPoint(
        sharedValues[index].y.value,
        velocityY,
        ySnapPoints
      );

      if (yDest < 0) {
        //Animating the last item of the card stack to the dismissed card stack position
        sharedValues[arrayLength - 1].y.value = withTiming(
          -(cardHeight + height * 0.68)
        );
        //Animating the second last item of the card stack to the centre postion
        sharedValues[arrayLength - 2].y.value = withTiming(
          cardItemCenterPosition,
          {},
          () => {
            runOnJS(swipeUpHandler)();
          }
        );
      } else {
        //Animating both last cards to it's original position because it didn't meet the required velocity

        sharedValues[arrayLength - 1].y.value = withTiming(
          cardItemCenterPosition
        );
        sharedValues[arrayLength - 2].y.value = withTiming(0, {});
      }
    },
  });

  const rotate = useDerivedValue(
    () =>
      interpolate(sharedValues[index]?.x.value || 0, [0, wWidth], [0, 40]) +
      "deg"
  );

  const cardStyle = useAnimatedStyle(() => {
    const transform = [
      { translateY: sharedValues[index]?.y.value || 0 },
      { translateX: sharedValues[index]?.x.value || 0 },
      { rotate: rotate.value },
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

export default memo(CardItem);
