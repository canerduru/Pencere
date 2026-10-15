import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  useWindowDimensions,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { AppSettings } from '../types';

const AUTO_CYCLE_OPTIONS = [2, 3, 5, 10];

interface SettingsSheetProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onClose: () => void;
}

function VolumeSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const trackWidth = useRef(0);
  const startX = useRef(0);

  const update = (x: number) => {
    if (trackWidth.current <= 0) return;
    onChange(Math.max(0, Math.min(1, x / trackWidth.current)));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        startX.current = e.nativeEvent.locationX;
        update(startX.current);
      },
      onPanResponderMove: (_e: GestureResponderEvent, g: PanResponderGestureState) => {
        update(startX.current + g.dx);
      },
    })
  ).current;

  return (
    <View
      style={styles.sliderTrack}
      onLayout={(e) => {
        trackWidth.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
    >
      <View style={styles.sliderRail} />
      <View style={[styles.sliderFill, { width: `${value * 100}%` }]} />
      <View style={[styles.sliderThumb, { left: `${value * 100}%` }]} />
    </View>
  );
}

function Toggle({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={[styles.toggleTrack, value && styles.toggleTrackOn]}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </TouchableOpacity>
  );
}

function Row({
  title,
  subtitle,
  accessory,
}: {
  title: string;
  subtitle?: string;
  accessory: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {accessory}
    </View>
  );
}

export function SettingsSheet({
  settings,
  onUpdateSettings,
  onClose,
}: SettingsSheetProps) {
  const { height } = useWindowDimensions();
  const sheetHeight = Math.min(height * 0.72, height - 40);

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

      <BlurView intensity={80} tint="dark" style={[styles.sheet, { height: sheetHeight }]}>
        <View style={styles.handle} />

        <Text style={styles.title}>Ayarlar</Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Volume */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ses Düzeyi</Text>
              <Text style={styles.sectionValue}>
                {Math.round(settings.masterVolume * 100)}%
              </Text>
            </View>
            <View style={styles.sliderWrapper}>
              <VolumeSlider
                value={settings.masterVolume}
                onChange={(v) => onUpdateSettings({ masterVolume: v })}
              />
            </View>
            <Row
              title="Doğa sesleri"
              subtitle="Rüzgar, dalga, kuş ve yağmur"
              accessory={
                <Toggle
                  value={settings.natureSoundEnabled}
                  onToggle={() =>
                    onUpdateSettings({ natureSoundEnabled: !settings.natureSoundEnabled })
                  }
                />
              }
            />
            <Row
              title="Dingin akorlar"
              subtitle="Yumuşak arka plan tonları"
              accessory={
                <Toggle
                  value={settings.musicEnabled}
                  onToggle={() => onUpdateSettings({ musicEnabled: !settings.musicEnabled })}
                />
              }
            />
          </View>

          {/* Breathing */}
          <View style={styles.section}>
            <Row
              title="Nefes Egzersizi"
              subtitle="Ekran ortasında nefes kılavuz halkası"
              accessory={
                <Toggle
                  value={settings.breathingExerciseEnabled}
                  onToggle={() =>
                    onUpdateSettings({
                      breathingExerciseEnabled: !settings.breathingExerciseEnabled,
                    })
                  }
                />
              }
            />
          </View>

          {/* Auto cycle */}
          <View style={styles.section}>
            <Row
              title="Sürekli Gezdir"
              subtitle="Manzarayı usulca otomatik değiştirir"
              accessory={
                <Toggle
                  value={settings.autoCycleScenes}
                  onToggle={() => onUpdateSettings({ autoCycleScenes: !settings.autoCycleScenes })}
                />
              }
            />
            {settings.autoCycleScenes && (
              <View style={styles.chips}>
                {AUTO_CYCLE_OPTIONS.map((minutes) => {
                  const isActive = settings.autoCycleIntervalMinutes === minutes;
                  return (
                    <TouchableOpacity
                      key={minutes}
                      onPress={() => onUpdateSettings({ autoCycleIntervalMinutes: minutes })}
                      style={[styles.chip, isActive && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {minutes} dk
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Watch mode */}
          <View style={styles.section}>
            <Row
              title="Sadece İzleme Modu"
              subtitle="Tüm düğmeleri gizler, ekrana dokunarak çıkılır"
              accessory={
                <TouchableOpacity
                  onPress={() => {
                    onUpdateSettings({ onlyWatchMode: true });
                    onClose();
                  }}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>Başlat</Text>
                </TouchableOpacity>
              }
            />
          </View>

          <Text style={styles.footer}>
            Bu uygulama bir rahatlama ve farkındalık aracıdır. Tıbbi tedavinin ya da profesyonel
            destek yerini almaz.
          </Text>
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
    paddingTop: 10,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#f5efe6',
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 14,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#d4c9b8',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  sectionValue: {
    color: 'rgba(212,201,184,0.6)',
    fontSize: 12,
  },
  sliderWrapper: {
    paddingVertical: 4,
  },
  sliderTrack: {
    height: 24,
    justifyContent: 'center',
  },
  sliderRail: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 10.5,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 10.5,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#d9a05b',
  },
  sliderThumb: {
    position: 'absolute',
    top: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    backgroundColor: '#f5efe6',
    borderWidth: 2,
    borderColor: '#d9a05b',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    color: '#f5efe6',
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 0.3,
  },
  rowSubtitle: {
    color: 'rgba(245,239,230,0.45)',
    fontSize: 11,
    marginTop: 2,
  },
  toggleTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 3,
    justifyContent: 'center',
  },
  toggleTrackOn: {
    backgroundColor: 'rgba(217,160,91,0.75)',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f5efe6',
  },
  toggleThumbOn: {
    transform: [{ translateX: 20 }],
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActive: {
    backgroundColor: 'rgba(217,160,91,0.25)',
    borderColor: 'rgba(217,160,91,0.6)',
  },
  chipText: {
    color: 'rgba(245,239,230,0.6)',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#f5efe6',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonText: {
    color: '#f5efe6',
    fontSize: 12,
    fontWeight: '400',
  },
  footer: {
    color: 'rgba(245,239,230,0.35)',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 4,
  },
});
