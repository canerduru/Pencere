import React, { useEffect, useState } from 'react';

interface BreathingOrbProps {
  enabled: boolean;
}

export const BreathingOrb: React.FC<BreathingOrbProps> = ({ enabled }) => {
  const [phase, setPhase] = useState<'grow' | 'shrink'>('grow');

  useEffect(() => {
    if (!enabled) return;

    let timeoutId: number;

    const runCycle = () => {
      // 4 seconds grow (inhale / expand)
      setPhase('grow');
      timeoutId = window.setTimeout(() => {
        // 7 seconds shrink (exhale / 'Yavaşça ver')
        setPhase('shrink');
        timeoutId = window.setTimeout(() => {
          runCycle();
        }, 7000);
      }, 4000);
    };

    runCycle();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [enabled]);

  if (!enabled) return null;

  const isGrowing = phase === 'grow';

  return (
    <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 z-25 flex flex-col items-center pointer-events-none select-none">
      {/* Organic glowing breathing light orb resting quietly on the sill */}
      <div className="relative flex items-center justify-center">
        {/* Outer ambient glow halo */}
        <div
          className={`absolute rounded-full bg-amber-200/30 blur-xl transition-all ${
            isGrowing
              ? 'w-24 h-24 duration-[4000ms] ease-out opacity-80'
              : 'w-10 h-10 duration-[7000ms] ease-in-out opacity-30'
          }`}
        />

        {/* Medium soft corona */}
        <div
          className={`absolute rounded-full bg-amber-100/50 blur-md transition-all ${
            isGrowing
              ? 'w-14 h-14 duration-[4000ms] ease-out opacity-90'
              : 'w-6 h-6 duration-[7000ms] ease-in-out opacity-40'
          }`}
        />

        {/* Core warm gentle pearl orb */}
        <div
          className={`relative rounded-full bg-gradient-to-tr from-amber-200 via-amber-100 to-white shadow-sm transition-all ${
            isGrowing
              ? 'w-6 h-6 duration-[4000ms] ease-out scale-110 shadow-amber-200/60'
              : 'w-4 h-4 duration-[7000ms] ease-in-out scale-90 shadow-amber-200/20'
          }`}
        />
      </div>

      {/* Calm text prompt: "Yavaşça ver", never "derin nefes al" */}
      <span
        className={`mt-2.5 text-[11px] tracking-wider font-light text-amber-100/80 transition-opacity duration-1000 ${
          isGrowing ? 'opacity-40' : 'opacity-90'
        }`}
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
      >
        {isGrowing ? 'Yavaşça al' : 'Yavaşça ver'}
      </span>
    </div>
  );
};
