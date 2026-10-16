# Pencere Mobil — Rehberli "Sakinleşme" Seansı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mobil uygulamaya, mevcut manzara ve ambiyans sesi üzerine gelen, yazılı adımlarla yönlendiren tek bir "Sakinleşme" seansı eklemek.

**Architecture:** Seans içeriği saf veri (`calmSession.ts`); adım ilerleme mantığı UI'dan bağımsız bir hook (`useCalmSession`); görsel katman tam ekran bir overlay (`CalmSessionOverlay`). Nefes halkası animasyonu yeniden kullanılabilir bir çekirdeğe (`BreathingCircle`) çıkarılır. Yeni çalışma-zamanı bağımlılığı yok.

**Tech Stack:** Expo SDK 57, React Native 0.86, TypeScript, `react-native` `Animated`. Test: `jest-expo` + `@testing-library/react-native`.

**Not:** Tüm komutlar `mobile/` dizininde çalıştırılır. Bu iş boyunca **push yapılmaz**; mobilde cihazda doğrulanmadan hiçbir şey push edilmez.

---

## Dosya Yapısı

**Yeni dosyalar**
- `mobile/src/config/calmSession.ts` — seans ve adım verisi (saf veri).
- `mobile/src/hooks/useCalmSession.ts` — adım ilerleme mantığı (UI'sız, test edilebilir).
- `mobile/src/components/BreathingCircle.tsx` — yeniden kullanılabilir animasyonlu nefes halkası çekirdeği.
- `mobile/src/components/CalmSessionOverlay.tsx` — tam ekran rehberli seans arayüzü.
- `mobile/src/config/__tests__/calmSession-test.ts` — veri testi.
- `mobile/src/hooks/__tests__/useCalmSession-test.ts` — hook testleri.

**Değişecek dosyalar**
- `mobile/package.json` — jest preset'i, test script'i, devDependencies.
- `mobile/tsconfig.json` — jest tipleri.
- `mobile/src/components/BreathingRing.tsx` — çekirdeği `BreathingCircle`'a taşır.
- `mobile/src/components/ControlBar.tsx` — "Sakinleş" butonu + `onStartCalm` prop'u.
- `mobile/src/screens/MainScreen.tsx` — overlay state'i, jestlerin pasifleşmesi, otomatik döngünün durması.

---

## Task 1: Jest test altyapısı

**Files:**
- Modify: `mobile/package.json`
- Modify: `mobile/tsconfig.json`
- Create: `mobile/src/config/__tests__/smoke-test.ts`

- [ ] **Step 1: Test bağımlılıklarını kur**

Run ( `mobile/` içinde):
```bash
npx expo install jest-expo jest @types/jest --dev
npx expo install @testing-library/react-native --dev
```
Expected: `package.json` devDependencies'e uyumlu sürümler eklenir (jest-expo ~57, jest 29).

- [ ] **Step 2: `package.json`'a test script'i ve jest preset'i ekle**

`scripts` bölümüne ekle:
```json
"test": "jest"
```
Kök seviyeye (dosyanın en dışına) ekle:
```json
"jest": {
  "preset": "jest-expo",
  "transformIgnorePatterns": [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)"
  ]
}
```

- [ ] **Step 3: `tsconfig.json`'a jest tiplerini ekle**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "types": ["jest"]
  }
}
```

- [ ] **Step 4: Smoke testi yaz**

`mobile/src/config/__tests__/smoke-test.ts`:
```ts
describe('jest kurulumu', () => {
  it('çalışır', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Testleri çalıştır, geçtiğini doğrula**

Run: `npx jest`
Expected: `PASS` — 1 test geçer.

- [ ] **Step 6: Commit**

```bash
git add mobile/package.json mobile/package-lock.json mobile/tsconfig.json mobile/src/config/__tests__/smoke-test.ts
git commit -m "test(mobile): jest-expo test altyapısını kur"
```

---

## Task 2: Seans verisi (`calmSession.ts`)

**Files:**
- Create: `mobile/src/config/calmSession.ts`
- Test: `mobile/src/config/__tests__/calmSession-test.ts`

- [ ] **Step 1: Başarısız testi yaz**

`mobile/src/config/__tests__/calmSession-test.ts`:
```ts
import { CALM_SESSION } from '../calmSession';

describe('CALM_SESSION', () => {
  it('7 adım içerir', () => {
    expect(CALM_SESSION.steps).toHaveLength(7);
  });

  it('her adımın pozitif süresi ve boş olmayan metni vardır', () => {
    for (const step of CALM_SESSION.steps) {
      expect(step.durationMs).toBeGreaterThan(0);
      expect(step.text.trim().length).toBeGreaterThan(0);
      expect(step.id.trim().length).toBeGreaterThan(0);
    }
  });

  it('adım kimlikleri benzersizdir', () => {
    const ids = CALM_SESSION.steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('beklenen sıraya sahiptir', () => {
    expect(CALM_SESSION.steps.map((s) => s.kind)).toEqual([
      'settle',
      'notice',
      'senses',
      'senses',
      'senses',
      'breath',
      'closing',
    ]);
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx jest src/config/__tests__/calmSession-test.ts`
Expected: FAIL — `Cannot find module '../calmSession'`.

- [ ] **Step 3: `calmSession.ts`'ı yaz**

`mobile/src/config/calmSession.ts`:
```ts
export type CalmStepKind = 'settle' | 'notice' | 'senses' | 'breath' | 'closing';

export interface CalmStep {
  id: string;
  kind: CalmStepKind;
  label?: string;
  text: string;
  durationMs: number;
}

export interface CalmSession {
  id: string;
  title: string;
  steps: CalmStep[];
}

export const CALM_SESSION: CalmSession = {
  id: 'sakinlesme',
  title: 'Sakinleşme',
  steps: [
    {
      id: 'settle',
      kind: 'settle',
      text: 'Rahat bir duruş bul. Ayağını yere bas. Omuzlarını yavaşça indir.',
      durationMs: 20000,
    },
    {
      id: 'notice',
      kind: 'notice',
      text: 'Şimdi sadece nefesini izle. Değiştirmene gerek yok.',
      durationMs: 40000,
    },
    {
      id: 'see',
      kind: 'senses',
      label: 'Topraklama · gör',
      text: 'Gördüğün 3 şeyi fark et.',
      durationMs: 30000,
    },
    {
      id: 'hear',
      kind: 'senses',
      label: 'Topraklama · duy',
      text: 'Duyduğun 2 sesi fark et.',
      durationMs: 30000,
    },
    {
      id: 'touch',
      kind: 'senses',
      label: 'Topraklama · dokun',
      text: 'Dokunabildiğin 1 şeyi fark et. Sıcaklığını hisset.',
      durationMs: 30000,
    },
    {
      id: 'breathe',
      kind: 'breath',
      label: 'Yavaş verişler',
      text: 'Yavaşça al… ve bırak.',
      durationMs: 50000,
    },
    {
      id: 'close',
      kind: 'closing',
      text: 'İyi geldin. Bu dinginliği yanında taşı.',
      durationMs: 20000,
    },
  ],
};
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx jest src/config/__tests__/calmSession-test.ts`
Expected: PASS — 4 test geçer.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/config/calmSession.ts mobile/src/config/__tests__/calmSession-test.ts
git commit -m "feat(mobile): sakinleşme seansı verisini ekle"
```

---

## Task 3: `useCalmSession` hook'u (TDD)

**Files:**
- Create: `mobile/src/hooks/useCalmSession.ts`
- Test: `mobile/src/hooks/__tests__/useCalmSession-test.ts`

- [ ] **Step 1: Başarısız testi yaz**

`mobile/src/hooks/__tests__/useCalmSession-test.ts`:
```ts
import { act, renderHook } from '@testing-library/react-native';
import { CalmSession } from '../../config/calmSession';
import { useCalmSession } from '../useCalmSession';

const SESSION: CalmSession = {
  id: 'test',
  title: 'Test',
  steps: [
    { id: 'a', kind: 'settle', text: 'A', durationMs: 10000 },
    { id: 'b', kind: 'closing', text: 'B', durationMs: 5000 },
  ],
};

describe('useCalmSession', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ilk adımla başlar', () => {
    const { result } = renderHook(() => useCalmSession(SESSION));
    expect(result.current.stepIndex).toBe(0);
    expect(result.current.step.id).toBe('a');
    expect(result.current.isFinished).toBe(false);
  });

  it('süre dolunca otomatik ilerler', () => {
    const { result } = renderHook(() => useCalmSession(SESSION));
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(result.current.stepIndex).toBe(1);
    expect(result.current.step.id).toBe('b');
  });

  it('son adım bitince isFinished olur ve onFinish çağrılır', () => {
    const onFinish = jest.fn();
    const { result } = renderHook(() => useCalmSession(SESSION, { onFinish }));
    act(() => {
      jest.advanceTimersByTime(15000);
    });
    expect(result.current.isFinished).toBe(true);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('next() ile hemen ilerler', () => {
    const { result } = renderHook(() => useCalmSession(SESSION));
    act(() => {
      result.current.next();
    });
    expect(result.current.stepIndex).toBe(1);
    expect(result.current.stepProgress).toBe(0);
  });

  it('duraklatılınca ilerlemez', () => {
    const { result } = renderHook(() => useCalmSession(SESSION));
    act(() => {
      result.current.togglePause();
    });
    expect(result.current.isPaused).toBe(true);
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(result.current.stepIndex).toBe(0);
  });

  it('devam ettirilince oto-akış sürer', () => {
    const { result } = renderHook(() => useCalmSession(SESSION));
    act(() => {
      result.current.togglePause();
    });
    act(() => {
      jest.advanceTimersByTime(20000);
    });
    expect(result.current.stepIndex).toBe(0);
    act(() => {
      result.current.togglePause();
    });
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(result.current.stepIndex).toBe(1);
  });

  it("unmount'ta interval temizlenir", () => {
    const clearSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => useCalmSession(SESSION));
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu doğrula**

Run: `npx jest src/hooks/__tests__/useCalmSession-test.ts`
Expected: FAIL — `Cannot find module '../useCalmSession'`.

- [ ] **Step 3: Hook'u yaz**

`mobile/src/hooks/useCalmSession.ts`:
```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { CalmSession, CalmStep } from '../config/calmSession';

const TICK_MS = 100;

interface UseCalmSessionOptions {
  onFinish?: () => void;
}

export interface CalmSessionApi {
  stepIndex: number;
  step: CalmStep;
  stepProgress: number;
  isPaused: boolean;
  isFinished: boolean;
  next: () => void;
  togglePause: () => void;
  setPaused: (value: boolean) => void;
}

export function useCalmSession(
  session: CalmSession,
  options: UseCalmSessionOptions = {}
): CalmSessionApi {
  const total = session.steps.length;

  const [stepIndex, setStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const stepIndexRef = useRef(0);
  const pausedRef = useRef(false);
  const finishedRef = useRef(false);
  const elapsedRef = useRef(0);

  const onFinishRef = useRef(options.onFinish);
  useEffect(() => {
    onFinishRef.current = options.onFinish;
  });

  const setPaused = useCallback((value: boolean) => {
    if (finishedRef.current) return;
    pausedRef.current = value;
    setIsPaused(value);
  }, []);

  const togglePause = useCallback(() => {
    setPaused(!pausedRef.current);
  }, [setPaused]);

  const next = useCallback(() => {
    if (finishedRef.current) return;
    if (stepIndexRef.current >= total - 1) {
      finishedRef.current = true;
      setIsFinished(true);
      onFinishRef.current?.();
      return;
    }
    const nextIndex = stepIndexRef.current + 1;
    stepIndexRef.current = nextIndex;
    elapsedRef.current = 0;
    setStepProgress(0);
    setStepIndex(nextIndex);
  }, [total]);

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current || finishedRef.current) return;
      const duration = session.steps[stepIndexRef.current].durationMs;
      elapsedRef.current += TICK_MS;
      if (elapsedRef.current >= duration) {
        next();
      } else {
        setStepProgress(elapsedRef.current / duration);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [session, next]);

  return {
    stepIndex,
    step: session.steps[stepIndex],
    stepProgress,
    isPaused,
    isFinished,
    next,
    togglePause,
    setPaused,
  };
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npx jest src/hooks/__tests__/useCalmSession-test.ts`
Expected: PASS — 7 test geçer.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/hooks/useCalmSession.ts mobile/src/hooks/__tests__/useCalmSession-test.ts
git commit -m "feat(mobile): seans ilerleme mantığını (useCalmSession) ekle"
```

---

## Task 4: `BreathingCircle` çekirdeğini çıkar

**Files:**
- Create: `mobile/src/components/BreathingCircle.tsx`
- Modify: `mobile/src/components/BreathingRing.tsx`

- [ ] **Step 1: `BreathingCircle.tsx`'i yaz**

`mobile/src/components/BreathingCircle.tsx`:
```tsx
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
  const opacity = useRef(new Animated.Value(0.3)).current;

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
      ]).start();
      return;
    }

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
  }, [active, inhaleMs, exhaleMs, minScale, maxScale, scale, opacity]);

  const innerSize = size * 0.6;

  return (
    <Animated.View
      style={[
        styles.outerRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
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
```

- [ ] **Step 2: `BreathingRing.tsx`'i çekirdeği kullanacak şekilde sadeleştir**

`mobile/src/components/BreathingRing.tsx` dosyasının tamamını şununla değiştir:
```tsx
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
```

Not: Önceki sürüm `Dimensions`'tan genişliğe bağlı boyut kullanıyordu; yeni sürüm sabit `220` kullanır (landscape ekranda ölçek farkı ihmal edilebilir). Mevcut görsel davranış (4 sn al / 4 sn ver) korunur.

- [ ] **Step 3: Tip kontrolü ve lint**

Run: `npx tsc --noEmit`
Expected: hatasız.

Run: `npm run lint`
Expected: hatasız.

- [ ] **Step 4: Commit**

```bash
git add mobile/src/components/BreathingCircle.tsx mobile/src/components/BreathingRing.tsx
git commit -m "refactor(mobile): nefes halkasını BreathingCircle çekirdeğine ayır"
```

---

## Task 5: `CalmSessionOverlay` bileşeni

**Files:**
- Create: `mobile/src/components/CalmSessionOverlay.tsx`

- [ ] **Step 1: Bileşeni yaz**

`mobile/src/components/CalmSessionOverlay.tsx`:
```tsx
import React, { useEffect, useRef } from 'react';
import {
  AppState,
  AppStateStatus,
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

  // Arka plana alınınca duraklat, dönünce devam ettir
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        setPaused(true);
      } else if (appStateRef.current !== 'active') {
        setPaused(false);
      }
      appStateRef.current = state;
    });
    return () => sub.remove();
  }, [setPaused]);

  // Seans bitince nazikçe kapat
  useEffect(() => {
    if (isFinished) {
      const id = setTimeout(onClose, 1200);
      return () => clearTimeout(id);
    }
  }, [isFinished, onClose]);

  const total = session.steps.length;

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
      <TouchableOpacity style={styles.close} onPress={onClose} hitSlop={12}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Alt: duraklat */}
      <TouchableOpacity style={styles.pause} onPress={togglePause} hitSlop={12}>
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
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
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
```

- [ ] **Step 2: Tip kontrolü ve lint**

Run: `npx tsc --noEmit`
Expected: hatasız.

Run: `npm run lint`
Expected: hatasız.

- [ ] **Step 3: Commit**

```bash
git add mobile/src/components/CalmSessionOverlay.tsx
git commit -m "feat(mobile): rehberli seans overlay'ini ekle"
```

---

## Task 6: ControlBar ve MainScreen entegrasyonu

**Files:**
- Modify: `mobile/src/components/ControlBar.tsx`
- Modify: `mobile/src/screens/MainScreen.tsx`

- [ ] **Step 1: `ControlBar.tsx` — prop ekle**

`ControlBarProps` arayüzüne ekle (mevcut `onOpenSettings` satırının yanına):
```ts
  onStartCalm: () => void;
```
Fonksiyon imzasındaki destructure listesine ekle:
```ts
  onStartCalm,
```

- [ ] **Step 2: `ControlBar.tsx` — "Sakinleş" butonunu ekle**

`{/* Breathing */}` bloğundan hemen sonra, `{/* Gallery */}`'den önce ekle:
```tsx
          {/* Sakinleş */}
          <TouchableOpacity onPress={onStartCalm} style={styles.controlBtn}>
            <Text style={styles.icon}>🌿</Text>
          </TouchableOpacity>
```

- [ ] **Step 3: `MainScreen.tsx` — import ve state**

Dosyanın importlarına ekle:
```ts
import { CalmSessionOverlay } from '../components/CalmSessionOverlay';
import { CALM_SESSION } from '../config/calmSession';
```
State tanımlarına ekle (mevcut `isSettingsOpen` state'inin yanına):
```ts
  const [isCalmOpen, setIsCalmOpen] = useState(false);
```

- [ ] **Step 4: `MainScreen.tsx` — jestleri ve otomatik döngüyü seansa duyarlı yap**

`sheetOpenRef` güncelleme effect'ini şu şekilde değiştir:
```ts
  useEffect(() => {
    sheetOpenRef.current = isGalleryOpen || isSettingsOpen || isCalmOpen;
  }, [isGalleryOpen, isSettingsOpen, isCalmOpen]);
```

Otomatik döngü effect'ine seans koşulunu ekle:
```ts
  useEffect(() => {
    if (!settings.autoCycleScenes || isCalmOpen) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % SCENES.length);
    }, settings.autoCycleIntervalMinutes * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [settings.autoCycleScenes, settings.autoCycleIntervalMinutes, isCalmOpen]);
```

- [ ] **Step 5: `MainScreen.tsx` — overlay'i render et ve ControlBar'a prop ver**

`{/* Control bar */}` bloğunun koşulunu şu şekilde güncelle:
```tsx
      {!isGalleryOpen && !isSettingsOpen && !isCalmOpen && !settings.onlyWatchMode && areControlsVisible && (
```
Bu bloğun içindeki `<ControlBar ... />`'a prop ekle:
```tsx
          onStartCalm={() => setIsCalmOpen(true)}
```
`{/* Watch-mode exit button */}` bloğundan sonra, `</View>` kapanışından önce ekle:
```tsx
      {/* Rehberli sakinleşme seansı */}
      {isCalmOpen && (
        <CalmSessionOverlay
          session={CALM_SESSION}
          onClose={() => setIsCalmOpen(false)}
        />
      )}
```

- [ ] **Step 6: Tip kontrolü ve lint**

Run: `npx tsc --noEmit`
Expected: hatasız.

Run: `npm run lint`
Expected: hatasız.

- [ ] **Step 7: Commit**

```bash
git add mobile/src/components/ControlBar.tsx mobile/src/screens/MainScreen.tsx
git commit -m "feat(mobile): sakinleşme seansını uygulamaya bağla"
```

---

## Task 7: Bütünsel doğrulama

**Files:** yok (yalnızca doğrulama)

- [ ] **Step 1: Tüm testleri çalıştır**

Run ( `mobile/` içinde): `npx jest`
Expected: PASS — tüm testler geçer.

- [ ] **Step 2: Tip kontrolü**

Run: `npx tsc --noEmit`
Expected: hatasız.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: hatasız.

- [ ] **Step 4: Cihazda manuel doğrulama (kullanıcı)**

Simülatör/cihazda `npx expo start` ile aç ve şunları doğrula:
- Kontrol çubuğundaki 🌿 "Sakinleş" butonu seansı başlatıyor.
- Adımlar sırayla akıyor; metin ve ilerleme noktaları doğru.
- Ekrana dokunma sonraki adıma geçiriyor; "Duraklat/Devam" çalışıyor.
- ✕ ile her an çıkılıyor; seans bitince otomatik kapanıyor.
- Uygulamayı arka plana alıp dönünce seans duraklıyor/devam ediyor.
- Ambiyans sesi ve manzara seans boyunca bozulmuyor.
- Yatay yönelimde yerleşim bozulmuyor.

- [ ] **Step 5: Push yok**

Mobilde cihazda doğrulanmadan push yapılmaz. Kullanıcı onayından sonra push değerlendirilir.

---

## Öz-İnceleme Notları (plan yazarı)

- **Spec kapsamı:** Tüm spec maddeleri karşılandı — giriş butonu (Task 6), düzen C (Task 5), hibrit tempo ve duraklat (Task 3 + 5), ✕ çıkış ve otomatik kapanış (Task 5), sahne jestlerinin pasifleşmesi ve otomatik döngünün durması (Task 6), AppState duraklatma (Task 5), timer temizliği (Task 3 testi), test altyapısı (Task 1).
- **Tip tutarlılığı:** `CALM_SESSION` → `CalmSession`; `useCalmSession` dönüşü `CalmSessionApi`; overlay bu API'yi kullanır. `BreathingCircle` propları hem `BreathingRing` hem overlay'de aynı.
- **Placeholder yok:** her adımda tam kod verildi.
- **Bilinen küçük sapma:** Spec'te `BreathingRing` boyutu `Dimensions`'tan geliyordu; refactor'da sabit `220` kullanıldı (Task 4 notu). Görsel fark ihmal edilebilir; cihaz doğrulamasında kontrol edilecek.
