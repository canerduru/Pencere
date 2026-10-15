import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SceneConfig } from '../types';

interface ControlBarProps {
  scene: SceneConfig;
  sceneIndex: number;
  totalScenes: number;
  isPaused: boolean;
  isMuted: boolean;
  breathingEnabled: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleBreathing: () => void;
  onOpenGallery: () => void;
  onOpenSettings: () => void;
}

export function ControlBar({
  scene,
  sceneIndex,
  totalScenes,
  isPaused,
  isMuted,
  breathingEnabled,
  onTogglePause,
  onToggleMute,
  onToggleBreathing,
  onOpenGallery,
  onOpenSettings,
}: ControlBarProps) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  return (
    <View
      style={[
        styles.container,
        isLandscape ? styles.containerLandscape : styles.containerPortrait,
      ]}
    >
      <BlurView intensity={60} tint="dark" style={styles.blur}>
        {/* Scene name row */}
        <TouchableOpacity onPress={onOpenGallery} style={styles.sceneRow}>
          <Text style={styles.sceneName} numberOfLines={1}>
            {scene.name}
          </Text>
          <Text style={styles.sceneCounter}>
            {sceneIndex + 1}/{totalScenes}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Controls row */}
        <View style={styles.controls}>
          {/* Play/Pause */}
          <TouchableOpacity onPress={onTogglePause} style={styles.controlBtn}>
            <Text style={styles.icon}>{isPaused ? '▶' : '⏸'}</Text>
          </TouchableOpacity>

          {/* Mute */}
          <TouchableOpacity onPress={onToggleMute} style={styles.controlBtn}>
            <Text style={styles.icon}>{isMuted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>

          {/* Breathing */}
          <TouchableOpacity
            onPress={onToggleBreathing}
            style={[styles.controlBtn, breathingEnabled && styles.controlBtnActive]}
          >
            <Text style={styles.icon}>🫧</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Gallery */}
          <TouchableOpacity onPress={onOpenGallery} style={styles.controlBtn}>
            <Text style={styles.icon}>🖼</Text>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity onPress={onOpenSettings} style={styles.controlBtn}>
            <Text style={styles.icon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  containerPortrait: {
    bottom: 34,
    left: 20,
    right: 20,
  },
  containerLandscape: {
    bottom: 14,
    left: '50%',
    marginLeft: -220,
    width: 440,
  },
  blur: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sceneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sceneName: {
    color: '#f5efe6',
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 0.5,
    flex: 1,
  },
  sceneCounter: {
    color: 'rgba(245,239,230,0.4)',
    fontSize: 11,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  controlBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  controlBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  icon: {
    fontSize: 20,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 4,
  },
});
