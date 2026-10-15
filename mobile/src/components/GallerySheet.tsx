import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SceneConfig } from '../types';

interface GallerySheetProps {
  scenes: SceneConfig[];
  currentSceneId: string;
  onSelectScene: (scene: SceneConfig) => void;
  onClose: () => void;
}

export function GallerySheet({
  scenes,
  currentSceneId,
  onSelectScene,
  onClose,
}: GallerySheetProps) {
  const { width, height } = useWindowDimensions();
  const thumbSize = (width - 48) / 2;
  const sheetHeight = Math.min(height * 0.72, height - 40);

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

      <BlurView intensity={80} tint="dark" style={[styles.sheet, { height: sheetHeight }]}>
        {/* Handle */}
        <View style={styles.handle} />

        <Text style={styles.title}>Manzaralar</Text>
        <Text style={styles.subtitle}>{scenes.length} farklı pencere</Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {scenes.map((scene) => {
            const isActive = scene.id === currentSceneId;
            return (
              <TouchableOpacity
                key={scene.id}
                style={[styles.thumb, { width: thumbSize }, isActive && styles.thumbActive]}
                onPress={() => {
                  onSelectScene(scene);
                  onClose();
                }}
                activeOpacity={0.75}
              >
                {/* Gradient placeholder (replaced by photo when available) */}
                <View
                  style={[
                    styles.thumbImage,
                    {
                      height: thumbSize * 0.65,
                      backgroundColor: scene.palette.skyBottom,
                    },
                  ]}
                >
                  {scene.imageAsset ? (
                    <Image
                      source={scene.imageAsset}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: scene.palette.landscapePrimary, opacity: 0.5, top: '50%' },
                      ]}
                    />
                  )}

                  {isActive && (
                    <View style={styles.activeOverlay}>
                      <View style={styles.activeDot} />
                    </View>
                  )}
                </View>

                <View style={styles.thumbInfo}>
                  <Text style={styles.thumbName} numberOfLines={1}>
                    {scene.name}
                  </Text>
                  <Text style={styles.thumbCountry} numberOfLines={1}>
                    {scene.country}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#f5efe6',
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(245,239,230,0.5)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 40,
  },
  thumb: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  thumbActive: {
    borderColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1.5,
  },
  thumbImage: {
    overflow: 'hidden',
  },
  activeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  thumbInfo: {
    padding: 10,
  },
  thumbName: {
    color: '#f5efe6',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  thumbCountry: {
    color: 'rgba(245,239,230,0.45)',
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
