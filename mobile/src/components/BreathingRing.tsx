import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BreathingCircle } from './BreathingCircle';

interface BreathingRingProps {
  enabled: boolean;
  isPaused: boolean;
}

export function BreathingRing({ enabled, isPaused }: BreathingRingProps) {
  if (!enabled) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <BreathingCircle active={!isPaused} size={220} />
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
});
