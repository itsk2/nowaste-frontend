import { Link, Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { runOnJS } from 'react-native-reanimated';
import Constants from 'expo-constants';
import { GestureHandlerRootView, GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut, SlideOutLeft, SlideInRight } from 'react-native-reanimated';
import { useSelector } from 'react-redux';

// Onboarding steps with updated content
const onboardingSteps = [
  {
    icon: 'leaf',
    title: 'Welcome to Nowaste!',
    description: 'Turn market waste into valuable farm resources. Join us in reducing waste efficiently! 🌱🐖',
  },
  {
    icon: 'handshake',
    title: 'Connecting Markets & Farmers',
    description: 'Easily link vegetable stalls with pig farmers and composters for optimized waste collection.',
  },
  {
    icon: 'recycle',
    title: 'Be Part of the Solution',
    description: 'Help reduce waste by ensuring vegetable scraps are efficiently collected and used.',
  },
];

export default function OnboardingScreen() {
  const [screenIndex, setScreenIndex] = useState(0);
  const { user } = useSelector((state) => state.auth);
  const data = onboardingSteps[screenIndex];

  const onContinue = () => {
    if (screenIndex === onboardingSteps.length - 1) {
      endOnboarding();
    } else {
      setScreenIndex(screenIndex + 1);
    }
  };

  const onBack = () => {
    if (screenIndex === 0) {
      endOnboarding();
    } else {
      setScreenIndex(screenIndex - 1);
    }
  };

  const endOnboarding = () => {
    setScreenIndex(0);
    router.replace('/auth/login');
  };

  const swipes = Gesture.Simultaneous(
    Gesture.Fling()
      .direction(Directions.LEFT)
      .onEnd(() => runOnJS(onContinue)()),

    Gesture.Fling()
      .direction(Directions.RIGHT)
      .onEnd(() => runOnJS(onBack)())
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.page}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar style="light" />

        {/* Step Indicator */}
        <View style={styles.stepIndicatorContainer}>
          {onboardingSteps.map((_, index) => (
            <View key={index} style={[styles.stepIndicator, { backgroundColor: index === screenIndex ? '#CEF202' : 'grey' }]} />
          ))}
        </View>

        {/* Swipe Gesture Handler */}
        <GestureDetector gesture={swipes}>
          <View style={styles.pageContent} key={screenIndex}>
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <FontAwesome5 style={styles.image} name={data.icon} size={150} color="#CEF202" />
            </Animated.View>

            {/* Onboarding Text */}
            <View style={styles.footer}>
              <Animated.Text entering={SlideInRight} exiting={SlideOutLeft} style={styles.title}>
                {data.title}
              </Animated.Text>
              <Animated.Text entering={SlideInRight.delay(50)} exiting={SlideOutLeft} style={styles.description}>
                {data.description}
              </Animated.Text>

              {/* Buttons */}
              <View style={styles.buttonsRow}>
                <Text onPress={endOnboarding} style={styles.buttonText}>
                  Skip
                </Text>
                <Pressable onPress={onContinue} style={styles.button}>
                  <Text style={styles.buttonText}>Continue</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </GestureDetector>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#15141A',
  },
  pageContent: {
    padding: 20,
    flex: 1,
  },
  image: {
    alignSelf: 'center',
    margin: 20,
    marginTop: 70,
  },
  title: {
    color: '#FDFDFD',
    fontSize: 50,
    fontFamily: 'InterBlack',
    letterSpacing: 1.3,
    marginVertical: 10,
  },
  description: {
    color: 'gray',
    fontSize: 20,
    fontFamily: 'Inter',
    lineHeight: 28,
  },
  footer: {
    marginTop: 'auto',
  },
  buttonsRow: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: '#302E38',
    borderRadius: 50,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#FDFDFD',
    fontFamily: 'InterSemi',
    fontSize: 16,
    padding: 15,
    paddingHorizontal: 25,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 15,
  },
  stepIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: 'gray',
    borderRadius: 10,
  },
});
