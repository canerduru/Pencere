import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SceneConfig, AppSettings } from '../types';
import { SCENES } from '../config/scenes';
import { SceneView } from '../components/SceneView';
import { BreathingRing } from '../components/BreathingRing';
import { ControlBar } from '../components/ControlBar';
import { GallerySheet } from '../components/GallerySheet';
import { SettingsSheet } from '../components/SettingsSheet';
import { AudioBridge } from '../components/AudioBridge';
import { CalmSessionOverlay } from '../components/CalmSessionOverlay';
import { CALM_SESSION } from '../config/calmSession';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../utils/settings';

const SWIPE_THRESHOLD = 60;

interface MainScreenProps {
  onGoBack?: () => void;
}

export function MainScreen({ onGoBack }: MainScreenProps) {
  const [scenes] = useState<SceneConfig[]>(SCENES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCalmOpen, setIsCalmOpen] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(true);
  const [showWatchExit, setShowWatchExit] = useState(false);

  const currentScene = scenes[currentIndex];

  // Persisted settings
  useEffect(() => {
    loadSettings().then((saved) => {
      setSettings(saved);
      setSettingsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (settingsLoaded) saveSettings(settings);
  }, [settings, settingsLoaded]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  // Auto cycle scenes
  useEffect(() => {
    if (!settings.autoCycleScenes || isCalmOpen) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % SCENES.length);
    }, settings.autoCycleIntervalMinutes * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [settings.autoCycleScenes, settings.autoCycleIntervalMinutes, isCalmOpen]);

  // Swipe gesture to change scene + tap to toggle controls
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const onlyWatchModeRef = useRef(settings.onlyWatchMode);
  useEffect(() => {
    onlyWatchModeRef.current = settings.onlyWatchMode;
  }, [settings.onlyWatchMode]);

  // When a sheet is open, its ScrollView must receive touches
  const sheetOpenRef = useRef(false);
  useEffect(() => {
    sheetOpenRef.current = isGalleryOpen || isSettingsOpen || isCalmOpen;
  }, [isGalleryOpen, isSettingsOpen, isCalmOpen]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !sheetOpenRef.current,
      onMoveShouldSetPanResponder: (_, gs) =>
        !sheetOpenRef.current &&
        Math.abs(gs.dx) > 10 &&
        Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderGrant: (e) => {
        touchStartX.current = e.nativeEvent.pageX;
        touchStartY.current = e.nativeEvent.pageY;
      },
      onPanResponderRelease: (e, gs) => {
        // Simple tap -> toggle UI controls (or watch-mode exit)
        if (Math.abs(gs.dx) < 10 && Math.abs(gs.dy) < 10) {
          if (onlyWatchModeRef.current) {
            setShowWatchExit((v) => !v);
          } else {
            setAreControlsVisible((v) => !v);
          }
          return;
        }

        if (Math.abs(gs.dx) < SWIPE_THRESHOLD) return;
        if (gs.dx < 0) {
          // Swipe left → next
          setCurrentIndex((i) => (i + 1) % SCENES.length);
        } else {
          // Swipe right → prev
          setCurrentIndex((i) => (i - 1 + SCENES.length) % SCENES.length);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
    })
  ).current;

  const handleSelectScene = useCallback((scene: SceneConfig) => {
    const idx = scenes.findIndex((s) => s.id === scene.id);
    if (idx !== -1) {
      setCurrentIndex(idx);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [scenes]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar
        barStyle="light-content"
        hidden={!areControlsVisible}
        translucent
        backgroundColor="transparent"
      />

      {/* Full-bleed scene */}
      <SceneView
        scene={currentScene}
        settings={settings}
        isPaused={isPaused}
      />

      {/* Procedural ambient nature & chord synthesizer */}
      <AudioBridge
        soundProfile={currentScene.soundProfile}
        isPaused={isPaused}
        isMuted={isMuted}
        volume={settings.masterVolume}
        natureEnabled={settings.natureSoundEnabled}
        musicEnabled={settings.musicEnabled}
      />

      {/* Breathing ring overlay */}
      <BreathingRing
        enabled={settings.breathingExerciseEnabled && !isCalmOpen}
        isPaused={isPaused}
      />

      {/* Gallery sheet */}
      {isGalleryOpen && (
        <GallerySheet
          scenes={scenes}
          currentSceneId={currentScene.id}
          onSelectScene={handleSelectScene}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}

      {/* Settings sheet */}
      {isSettingsOpen && (
        <SettingsSheet
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Control bar */}
      {!isGalleryOpen && !isSettingsOpen && !isCalmOpen && !settings.onlyWatchMode && areControlsVisible && (
        <ControlBar
          scene={currentScene}
          sceneIndex={currentIndex}
          totalScenes={scenes.length}
          isPaused={isPaused}
          isMuted={isMuted}
          breathingEnabled={settings.breathingExerciseEnabled}
          onTogglePause={() => setIsPaused((p) => !p)}
          onToggleMute={() => setIsMuted((m) => !m)}
          onToggleBreathing={() =>
            setSettings((s) => ({
              ...s,
              breathingExerciseEnabled: !s.breathingExerciseEnabled,
            }))
          }
          onOpenGallery={() => setIsGalleryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onStartCalm={() => setIsCalmOpen(true)}
        />
      )}

      {/* Watch-mode exit button */}
      {settings.onlyWatchMode && showWatchExit && (
        <TouchableOpacity
          style={styles.watchExit}
          activeOpacity={0.8}
          onPress={() => {
            updateSettings({ onlyWatchMode: false });
            setShowWatchExit(false);
          }}
        >
          <Text style={styles.watchExitText}>İzleme Modundan Çık</Text>
        </TouchableOpacity>
      )}

      {/* Rehberli sakinleşme seansı */}
      {isCalmOpen && (
        <CalmSessionOverlay
          session={CALM_SESSION}
          onClose={() => setIsCalmOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1a14',
  },
  watchExit: {
    position: 'absolute',
    top: 56,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(20,30,24,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  watchExitText: {
    color: '#f5efe6',
    fontSize: 12,
    fontWeight: '300',
    letterSpacing: 0.4,
  },
});
