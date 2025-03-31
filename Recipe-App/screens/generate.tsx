import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import Animated, { interpolate, SharedValue, useSharedValue, useAnimatedStyle } from 'react-native-reanimated'; 
import { PanGesture, GestureDetector, Gesture } from 'react-native-gesture-handler';

const recipes = [
  {
    id: 1,
    image: '../assets/home.png',
    name: 'Recipe 1'
  },
  {
    id: 2,
    image: '../assets/home.png',
    name: 'Recipe 2'
  },
  {
    id: 3,
    image: '../assets/home.png',
    name: 'Recipe 3'
  },
  {
    id: 4,
    image: '../assets/home.png',
    name: 'Recipe 4'
  },
  {
    id: 5,
    image: '../assets/home.png',
    name: 'Recipe 5'
  },
];

// Define a type for the recipe object
type Recipe = {
  id: number;
  image: string;
  name: string;
};

// Replace this with info from API
const RecipeCard = ({ recipe, numOfRecipes, curIndex, activeIndex, index, translationX }: { recipe: Recipe, numOfRecipes: number, curIndex: number, activeIndex: SharedValue<number>, index: number, translationX: SharedValue<number>}) => {
  
  
  const animatedCard = useAnimatedStyle(() => ({
    opacity: interpolate(
      activeIndex.value, [index-1, index, index+1], [1-1/5, 1, 1]
    ),
    transform: [{
      scale: interpolate(
        activeIndex.value, 
        [index-1, index, index+1], 
        [0.95, 1, 1]
      ),
    },
    {
      translateY: interpolate(
        activeIndex.value,
        [index-1, index, index+1],
        [-30, 0, 0]
      )
    },
    {
      translateX: activeIndex.value === index ? translationX.value : 0,
    }
  ],

  }));
  return (
    <Animated.View 
      style={[
        styles.card, 
        animatedCard,
            { 
              zIndex: numOfRecipes - curIndex, 
              opacity: 1 - curIndex * 0.1,
              transform: [
                {scale: 1 - curIndex * 0.05}, 
                {translateY: -curIndex * 30},
              ],
            },
          ]}>
        <View style={styles.top}>
          <Image
            source={require('../assets/home.png')}
            style={styles.cardImage}
          />
        </View>
        <View style={styles.bottom}>
          <Text style={styles.headerText}>{recipe.name}</Text>
          <Text style={styles.normalText}>Ingredients: yumyumyumyumyum</Text>
        </View>
    </Animated.View>
  );
};

const GeneratePage = () => {
  const activeIndex = useSharedValue(0);
  const translationX = useSharedValue(0);

  const gesture = Gesture.Pan()
  .onBegin((event) => console.log("on begin"))
  .onFinalize((event) => console.log("on finalize"))
  .onChange((event) => {
    translationX.value = event.translationX;

  })
  .onEnd((event) => {
    translationX.value = 0;
  });
  
  return (
    <GestureDetector gesture={gesture}> 
      <View style={styles.mainContainer}>
        {recipes.map((recipe, index) => (
          <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          numOfRecipes={recipes.length} 
          curIndex={index}
          activeIndex={activeIndex}
          index={index}
          translationX={translationX}
          />
        ))}
      </View>
    </GestureDetector>
    );
  };

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFEFB6',
    },
    scrollViewContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    top: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: '75%',
      width: '100%',
    },
    bottom: {
      height: '25%',
      width: '100%',
      paddingLeft: 15,
    },
    card: {
      backgroundColor: '#C4A381',
      borderRadius: 23,
      padding: 10,
      width: 364,
      height: 472,
      alignItems: 'center',
      marginHorizontal: 10,
      
      position: 'absolute',
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#644536',
    },
    normalText: {
      fontSize: 12,
      color: '#644536',
    },
    cardImage: {
      width: 318,
      height: 318,
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 23,
    },
});

export default GeneratePage;

