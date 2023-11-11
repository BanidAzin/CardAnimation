import React, { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import CardItem from "./CardItem";
import SwiperDismissedCard from "./DismissedCardItem";

//The number of visible cards in the bottom stack
const VISIBILITY_INDEX = 3;
//The number of cards rendering in the dismissed cards stack
const DISMISSED_VISIBILITY_INDEX = 2;

/*
  To animate each card, we utilize the useAnimatedGestureHandler hook, which is provided by React Native Reanimated. To maintain a consistent number of hooks across all renderings, we create an array with a length equal to VISIBILITY_INDEX. This is essential because it ensures that we have the precise number of gesture handlers corresponding to the cards to be displayed. The same principle applies when dealing with dismissed cards
*/
const VISIBLE_ITEMS_ARRAY = Array(VISIBILITY_INDEX).fill(1);
const DISIMISSED_ITEMS_ARRAY = Array(DISMISSED_VISIBILITY_INDEX).fill(1);

export const CardSwiper = ({ data = [] }) => {
  const { height, width } = useWindowDimensions();
  /*
    Slice the data array based on VISIBILITY_INDEX because we want to display only a limited number of items.
    Specifically, we select the last items from the data array and set it on cardData on the initial rendering which is the bottom card stack.
  */
  const [cardData, setCardData] = useState(data.slice(-VISIBILITY_INDEX));
  //Dismissed cards stack which rendered on top part of the screen
  const [dismissedCards, setDismissedCards] = useState([]);
  /* 
    This is employed to monitor the position of the last element in cardData within the data array and on the initial rendering, it will be the last item's index of the data array.
    This tracking is useful for determining whether we reached the end of the data array that is zero. if it's zero, then we will only remove the last item from the array. If it's greater than or equal to zero, then we should add another item to cardData from data array.
    We should do this to limit the number of cards rendered at a time, otherwise it can affect the performance.
  */
  const [currentIndex, setCurrentIndex] = useState(data.length - 1);
  // const [callOnSwipeEnd, setCallOnSwipeEnd] = useState(false);

  const cardHeight = height * 0.5;
  const xSnapPoints = [-width, 0, width];
  const ySnapPoints = [-height, 0, height];
  //Animating horizontal swiped items to this postion to keep them away from viewport
  const hiddenTranslateX = 1.5 * width;

  const cardItemCenterPosition = -(cardHeight + height * 0.1);
  const dismissedCardTopPosition = -cardHeight * 0.9;

  //Array with the length of VISIBILITY_INDEX to keep animation values of each cardData item
  const sharedValues = VISIBLE_ITEMS_ARRAY.map((elem, index) => {
    return {
      y: useSharedValue(
        // Defining cardData item position to center of the screen if it's the last item of cardData
        index === cardData.length - 1 ? cardItemCenterPosition : 0
      ),
      x: useSharedValue(0),
    };
  });

  //Array with the length of DISMISSED_VISIBILITY_INDEX to keep animation values of dismissedCards item
  const dismissedSharedValues = DISIMISSED_ITEMS_ARRAY.map((elem, index) => {
    return {
      y: useSharedValue(dismissedCardTopPosition),
    };
  });

  const resetDismissedCardsAnimationValues = () => {
    dismissedSharedValues.forEach((elem) => {
      elem.y.value = dismissedCardTopPosition;
    });
  };

  /*
    Function to reset card animation values
    @param position: number = cardData.length - 1
      It is used to set cardItemCenterPosition at a specific index of sharedValues array. It's crucial when the length of cardData is less than VISIBILITY_INDEX because we are showing the last item of cardData in the center of the screen.
      When dealing with a scenario where there are only 2 cards in the cardData, it's crucial to note that the sharedValues array will always have 3 items. If you use the resetCardDataAnimationValues function without specifying the position parameter, it will result in both card data items being stacked at the bottom. This occurs because the function attempts to set the 3rd item (which is not present in the cardData) to the center position based on the sharedValues array, which still has 3 items. This situation underscores the significance of using the position parameter to correctly adjust the animation values, ensuring that the existing card items are displayed as intended.
  */
  const resetCardDataAnimationValues = (position = cardData.length - 1) => {
    sharedValues.forEach((elem, index) => {
      elem.y.value = index === position ? cardItemCenterPosition : 0;
      elem.x.value = 0;
    });
  };

  const swipeUpHandler = () => {
    resetDismissedCardsAnimationValues();
    //Getting the last item from cardData
    let slicedItem = cardData[cardData.length - 1];
    //Checking if there are more items in data array that can be added to cardData
    if (currentIndex - VISIBILITY_INDEX >= 0) {
      resetCardDataAnimationValues();
      //Adding the next item from data array and removing the last item from cardData
      setCardData([
        data[currentIndex - VISIBILITY_INDEX],
        ...cardData.slice(0, -1),
      ]);
    } else {
      /*
        When swiped up and there are no more items to add from the data array, the length of cardData becomes less than VISIBILITY_INDEX. If you reset the card animation values without taking this into account, it would result in all items being stacked at the bottom. This happens because the function tries to set the last item (which is not present in the cardData) to the center position, based on the fixed length of the sharedValues array, which is always set to VISIBILITY_INDEX.

        To address this issue, it's important to pass the position parameter to the resetCardDataAnimationValues function. This ensures that the existing card items are displayed as intended.

        Additionally, it's worth noting that when a swipe-up action occurs, it removes one item from cardData. Therefore, you should subtract one more index from the last index of cardData, which will be cardData.length - 2, to ensure the correct animation behavior because we are calling resetCardDataAnimationValues before state updates.
      */
      resetCardDataAnimationValues(cardData.length - 2);
      setCardData(cardData.slice(0, -1));
    }
    setCurrentIndex(currentIndex - 1);
    setDismissedCards([...dismissedCards, slicedItem]);
  };

  const swipeDownHandler = () => {
    resetDismissedCardsAnimationValues();
    //Getting the last item from dismissedCards
    let slicedItem = dismissedCards[dismissedCards.length - 1];
    //Checking whether we want to remove the first item from cardData in order to maintain the desired number of visible cards, which is VISIBILITY_INDEX.
    if (cardData.length === VISIBILITY_INDEX) {
      resetCardDataAnimationValues();
      setCardData([...cardData.slice(1), slicedItem]);
    } else {
      /*
        When a swipe-down action occurs, it adds one item to cardData. Therefore, you should add one more index from the last index of cardData, which will be cardData.length, to ensure the correct animation behavior because we are calling resetCardDataAnimationValues before state updates.
      */
      resetCardDataAnimationValues(cardData.length);
      setCardData([...cardData, slicedItem]);
    }
    setDismissedCards(dismissedCards.slice(0, -1));
    setCurrentIndex(currentIndex + 1);
  };

  const horizontalSwipeHandler = () => {
    //Checking if there are more items in data array that can be added to cardData
    if (currentIndex - VISIBILITY_INDEX >= 0) {
      resetCardDataAnimationValues();
      //Adding the next item from data array and removing the last item
      setCardData([
        data[currentIndex - VISIBILITY_INDEX],
        ...cardData.slice(0, -1),
      ]);
    } else {
      /*
        When a swipe-left or swipe-right action occurs, it removes one item from cardData. Therefore, you should subtract one more index from the last index of cardData, which will be cardData.length - 2, to ensure the correct animation behavior because we are calling resetCardDataAnimationValues before state updates.
      */
      resetCardDataAnimationValues(cardData.length - 2);
      setCardData(cardData.slice(0, -1));
    }
    setCurrentIndex(currentIndex - 1);
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          alignItems: "center",
        }}
      >
        {dismissedCards
          .slice(-DISMISSED_VISIBILITY_INDEX)
          .map((item, index) => {
            return (
              <SwiperDismissedCard
                key={item.id}
                card={item}
                index={index}
                dismissedSharedValues={dismissedSharedValues}
                arrayLength={
                  dismissedCards.slice(-DISMISSED_VISIBILITY_INDEX).length
                }
                sharedValues={sharedValues}
                lastIndexOfCardData={cardData.length - 1}
                style={{ height: cardHeight }}
                horizontalSwipeHandler={horizontalSwipeHandler}
                swipeDownHandler={swipeDownHandler}
              />
            );
          })}
      </View>
      <View
        style={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: cardHeight + height * 0.48,
          backgroundColor: "red",
        }}
      >
        {cardData.map((item, index) => {
          return (
            <CardItem
              key={item.id}
              card={item}
              index={index}
              sharedValues={sharedValues}
              arrayLength={cardData.length}
              style={{ height: cardHeight }}
              horizontalSwipeHandler={horizontalSwipeHandler}
              swipeUpHandler={swipeUpHandler}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});
