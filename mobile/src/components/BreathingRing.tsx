import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';

const { width } = Dimensions.get('window');
const RING_SIZE = width * 0.52;

interface BreathingRingProps {
  enabled: boolean;
  isPaused: boolean;
}

export function BreathingRing({ enabled, isPaused }: BreathingRingProps) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled || isPaused) {
      Animated.timing(ringOpacity, { toValue: 0, duration: 600, useNativeDriver: true }).start();
      Animated.timing(scale, { toValue: 0.7, duration: 600, useNativeDriver: true }).start();
      return;
    }

    Animated.timing(ringOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();

    // 4s inhale, 4s exhale
    const breathLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.0,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.7,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    breathLoop.start();

    return () => breathLoop.stop();
  }, [enabled, isPaused, scale, opacity, ringOpacity]);

  if (!enabled) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.outerRing,
          {
            opacity: ringOpacity,
            transform: [{ scale }],
          },
        ]}
      >
        <Animated.View style={[styles.innerRing, { opacity }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: RING_SIZE * 0.6,
    height: RING_SIZE * 0.6,
    borderRadius: (RING_SIZE * 0.6) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
});
