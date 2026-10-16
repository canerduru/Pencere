import React, { useEffect, useRef } from 'react';
import {
  AppState,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CalmSession } from '../config/calmSession';
import { useCalmSession } from '../hooks/useCalmSession';
import { BreathingCircle } from './BreathingCircle';

interface CalmSessionOverlayProps {
  session: CalmSession;
  onClose: () => void;
}

export function CalmSessionOverlay({ session, onClose }: CalmSessionOverlayProps) {
  const { stepIndex, step, stepProgress, isPaused, isFinished, next, togglePause, setPaused } =
    useCalmSession(session);

  // Arka plana alınınca duraklat, dönünce sadece otomatik duraklamayı devam ettir
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  });
  const autoPausedRef = useRef(false);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        if (!isPausedRef.current) {
          autoPausedRef.current = true;
          setPaused(true);
        }
      } else if (autoPausedRef.current) {
        autoPausedRef.current = false;
        setPaused(false);
      }
    });
    return () => sub.remove();
  }, [setPaused]);

  // Seans bitince nazikçe kapat
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (isFinished) {
      const id = setTimeout(() => onCloseRef.current(), 1200);
      return () => clearTimeout(id);
    }
  }, [isFinished]);

  return (
    <Pressable style={styles.root} onPress={next}>
      <View style={styles.scrim} />

      {/* Sol: nefes halkası */}
      <View style={styles.left}>
        <BreathingCircle active={!isPaused && !isFinished} size={150} inhaleMs={4000} exhaleMs={6000} />
      </View>

      {/* Sağ: metin + ilerleme */}
      <View style={styles.right}>
        {step.label ? <Text style={styles.label}>{step.label}</Text> : null}
        <Text style={styles.stepText}>{step.text}</Text>

        <View style={styles.dots}>
          {session.steps.map((s, i) => (
            <View
              key={s.id}
              style={[styles.dot, i <= stepIndex ? styles.dotActive : null]}
            />
          ))}
        </View>
      </View>

      {/* Üst sağ: kapat */}
      <TouchableOpacity
        style={styles.close}
        onPress={onClose}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Kapat"
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Alt: duraklat */}
      <TouchableOpacity
        style={styles.pause}
        onPress={togglePause}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={isPaused ? 'Devam et' : 'Duraklat'}
      >
        <Text style={styles.pauseText}>{isPaused ? '▶  Devam' : '⏸  Duraklat'}</Text>
      </TouchableOpacity>

      {/* Adım içi ilerleme çizgisi */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(stepProgress * 100)}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 12, 9, 0.55)',
  },
  left: {
    width: '42%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    width: '58%',
    paddingRight: 48,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  label: {
    color: '#d9b98a',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  stepText: {
    color: '#f0e9dc',
    fontSize: 24,
    lineHeight: 34,
    fontWeight: '300',
  },
  dots: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 22,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    backgroundColor: 'rgba(254,243,199,0.95)',
  },
  close: {
    position: 'absolute',
    top: 18,
    right: 22,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: 'rgba(245,239,230,0.6)',
    fontSize: 20,
  },
  pause: {
    position: 'absolute',
    bottom: 22,
    left: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(13,20,16,0.5)',
  },
  pauseText: {
    color: 'rgba(245,239,230,0.8)',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressFill: {
    height: 2,
    backgroundColor: 'rgba(217,185,138,0.9)',
  },
});
