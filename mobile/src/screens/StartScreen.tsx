import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const breatheScale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Subtle breathing pulse on the title
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheScale, {
          toValue: 1.03,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breatheScale, {
          toValue: 1.0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [breatheScale, opacity]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background gradient */}
      <LinearGradient
        colors={['#0d1a14', '#1a2e22', '#0d1a14']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      {/* Soft vignette overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Animated.View style={[styles.content, { opacity }]}>
        {/* App name */}
        <Animated.View style={{ transform: [{ scale: breatheScale }] }}>
          <Text style={styles.appName}>pencere</Text>
        </Animated.View>

        {/* Tagline */}
        <Text style={styles.tagline}>Dışarı bak.{'\n'}Yavaşça nefes ver.</Text>

        {/* Subtle divider */}
        <View style={styles.divider} />

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          14 sakin manzara · Doğa sesleri · Nefes rehberi
        </Text>

        {/* Start button */}
        <TouchableOpacity
          onPress={onStart}
          style={styles.startButton}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>Başla</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom note */}
        <Text style={styles.bottomNote}>
          Rahatlama ve farkındalık alanı
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1a14',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  appName: {
    fontFamily: 'serif',
    fontSize: 52,
    letterSpacing: 8,
    color: '#f5efe6',
    fontWeight: '300',
    marginBottom: 24,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 22,
    color: '#d4c9b8',
    fontWeight: '300',
    letterSpacing: 0.5,
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 36,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(212, 201, 184, 0.6)',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 56,
    lineHeight: 20,
  },
  startButton: {
    marginBottom: 48,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  startButtonGradient: {
    paddingHorizontal: 52,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#f5efe6',
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 3,
  },
  bottomNote: {
    fontSize: 11,
    color: 'rgba(212, 201, 184, 0.35)',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
