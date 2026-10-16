import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BreathingCircle } from './BreathingCircle';

const RING_SIZE = Dimensions.get('window').width * 0.52;

interface BreathingRingProps {
  enabled: boolean;
  isPaused: boolean;
}

export function BreathingRing({ enabled, isPaused }: BreathingRingProps) {
  if (!enabled) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <BreathingCircle active={!isPaused} size={RING_SIZE} />
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
