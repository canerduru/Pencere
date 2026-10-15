import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import { SceneConfig, AppSettings } from '../types';

interface SceneViewProps {
  scene: SceneConfig;
  settings: AppSettings;
  isPaused: boolean;
}

export function SceneView({ scene, settings, isPaused }: SceneViewProps) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const kenBurnsScale = useRef(new Animated.Value(1.06)).current;
  const kenBurnsX = useRef(new Animated.Value(-0.015 * width)).current;

  useEffect(() => {
    if (isPaused) return;

    kenBurnsScale.setValue(1.06);
    kenBurnsX.setValue(-0.015 * width);

    const anim = Animated.parallel([
      Animated.timing(kenBurnsScale, {
        toValue: 1.0,
        duration: 22000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(kenBurnsX, {
        toValue: 0.015 * width,
        duration: 22000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]);
    anim.start();

    return () => anim.stop();
  }, [scene.id, isPaused, kenBurnsScale, kenBurnsX, width]);

  const animatedTransform = {
    transform: [
      { scale: kenBurnsScale },
      { translateX: kenBurnsX },
    ],
  };

  return (
    <View style={styles.container}>
      {scene.imageAsset ? (
        <Animated.Image
          source={scene.imageAsset}
          style={[
            styles.image,
            { width, height },
            animatedTransform,
          ]}
          resizeMode={isLandscape ? "cover" : "cover"}
        />
      ) : (
        // Gradient fallback when no photo yet
        <Animated.View style={[styles.gradientFallback, { width, height }, animatedTransform]}>
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: scene.palette.skyTop },
            ]}
          />
          {/* Landscape strip */}
          <View
            style={[
              styles.landscapeStrip,
              { backgroundColor: scene.palette.landscapePrimary },
            ]}
          />
          {/* Horizon glow */}
          <View
            style={[
              styles.horizonGlow,
              { backgroundColor: scene.palette.skyBottom },
            ]}
          />
        </Animated.View>
      )}

      {/* Subtle bottom vignette for readability of controls */}
      <View style={styles.bottomVignette} />
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
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradientFallback: {
    position: 'relative',
  },
  landscapeStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    opacity: 0.85,
  },
  horizonGlow: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    height: '15%',
    opacity: 0.5,
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: 'transparent',
  },
});
