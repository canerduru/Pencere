import React, { useEffect, useState } from 'react';

interface BreathingGuideRingProps {
  enabled: boolean;
  isPaused?: boolean;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export const BreathingGuideRing: React.FC<BreathingGuideRingProps> = ({
  enabled,
  isPaused = false,
}) => {
  const [phase, setPhase] = useState<BreathPhase>('inhale');

  useEffect(() => {
    if (!enabled || isPaused) return;

    let timeoutId: number;

    const cycle = () => {
      // 1. Inhale phase: 4 seconds gentle expansion
      setPhase('inhale');
      timeoutId = window.setTimeout(() => {
        // 2. Soft brief rest: 1.5 seconds gentle pause at top of breath
        setPhase('hold');
        timeoutId = window.setTimeout(() => {
          // 3. Exhale phase: 6.5 seconds gentle contraction and release
          setPhase('exhale');
          timeoutId = window.setTimeout(() => {
            cycle();
          }, 6500);
        }, 1500);
      }, 4000);
    };

    cycle();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [enabled, isPaused]);

  if (!enabled) return null;

  // Animation parameters depending on phase
  // Inhale: 4000ms expansion, scale 1.15, opacity 0.75
  // Hold: 1500ms steady soft glow
  // Exhale: 6500ms contraction, scale 0.65, opacity 0.22
  let scaleClass = 'scale-[0.72]';
  let opacityClass = 'opacity-25';
  let durationClass = 'duration-[6500ms] ease-in-out';
  let labelText = 'Yavaşça ver';

  if (phase === 'inhale') {
    scaleClass = 'scale-[1.16]';
    opacityClass = 'opacity-80';
    durationClass = 'duration-[4000ms] ease-out';
    labelText = 'Yavaşça al';
  } else if (phase === 'hold') {
    scaleClass = 'scale-[1.16]';
    opacityClass = 'opacity-85';
    durationClass = 'duration-[1500ms] ease-in-out';
    labelText = 'Dingin kal';
  } else {
    // exhale
    scaleClass = 'scale-[0.72]';
    opacityClass = 'opacity-25';
    durationClass = 'duration-[6500ms] ease-in-out';
    labelText = 'Yavaşça ver';
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none select-none transition-opacity duration-1000">
      <div className="relative flex flex-col items-center justify-center">
        {/* Soft atmospheric radial bloom behind the ring */}
        <div
          className={`absolute rounded-full bg-amber-100/15 blur-3xl transition-all ${durationClass} ${scaleClass} ${
            phase === 'inhale' ? 'w-80 h-80 opacity-60' : 'w-48 h-48 opacity-15'
          }`}
        />

        {/* Outer ethereal faint ripple ring */}
        <div
          className={`absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-amber-200/20 blur-[1px] transition-all ${durationClass} ${scaleClass}`}
        />

        {/* PRIMARY ELEGANT GUIDE RING */}
        <div
          className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-amber-100/60 shadow-[0_0_24px_rgba(254,243,199,0.25)] flex items-center justify-center transition-all ${durationClass} ${scaleClass} ${opacityClass}`}
        >
          {/* Subtle inner concentric filament */}
          <div className="w-[86%] h-[86%] rounded-full border border-white/20" />

          {/* Central delicate pearl point */}
          <div
            className={`w-2.5 h-2.5 rounded-full bg-amber-100 shadow-sm transition-all ${durationClass} ${
              phase === 'inhale' ? 'scale-125 opacity-90' : 'scale-75 opacity-40'
            }`}
          />
        </div>

        {/* Gentle breathing cadence prompt */}
        <div className="absolute top-[calc(100%+24px)] flex flex-col items-center transition-all duration-700">
          <span
            className="text-xs sm:text-sm font-light tracking-[0.2em] font-serif text-amber-100/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            {labelText}
          </span>
          <span className="text-[10px] tracking-wider text-stone-300/60 font-light mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            nefes kılavuzu
          </span>
        </div>
      </div>
    </div>
  );
};
