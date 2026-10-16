import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

interface BreathingCircleProps {
  active: boolean;
  size: number;
  inhaleMs?: number;
  exhaleMs?: number;
  minScale?: number;
  maxScale?: number;
}

export function BreathingCircle({
  active,
  size,
  inhaleMs = 4000,
  exhaleMs = 4000,
  minScale = 0.7,
  maxScale = 1,
}: BreathingCircleProps) {
  const scale = useRef(new Animated.Value(minScale)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;
  const visibility = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    if (!active) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: minScale,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(visibility, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.timing(visibility, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: maxScale,
            duration: inhaleMs,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: minScale,
            duration: exhaleMs,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.85,
            duration: inhaleMs,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: exhaleMs,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [active, inhaleMs, exhaleMs, minScale, maxScale, scale, opacity, visibility]);

  const innerSize = size * 0.6;

  return (
    <Animated.View
      style={[
        styles.outerRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: visibility,
          transform: [{ scale }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.innerRing,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            opacity,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerRing: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
});
