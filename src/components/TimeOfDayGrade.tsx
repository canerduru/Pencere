import React from 'react';
import { ColorWarmth, TimeOfDay } from '../types';

interface TimeOfDayGradeProps {
  timeOfDay: TimeOfDay;
  colorWarmth?: ColorWarmth;
  brightness: number; // 0.6 to 1.2
}

export const TimeOfDayGrade: React.FC<TimeOfDayGradeProps> = ({
  timeOfDay,
  colorWarmth = 'dogal',
  brightness,
}) => {
  // Determine actual time of day if 'otomatik'
  let resolvedTime: 'sabah' | 'gun' | 'aksam' | 'gece' = 'gun';

  if (timeOfDay === 'otomatik') {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) resolvedTime = 'sabah';
    else if (hour >= 11 && hour < 18) resolvedTime = 'gun';
    else if (hour >= 18 && hour < 21) resolvedTime = 'aksam';
    else resolvedTime = 'gece';
  } else {
    resolvedTime = timeOfDay;
  }

  // 1. Time of Day Style
  let timeOverlayStyle = 'bg-transparent';
  let timeBlendMode = 'normal';

  switch (resolvedTime) {
    case 'sabah':
      timeOverlayStyle = 'bg-gradient-to-tr from-amber-500/10 via-orange-400/8 to-rose-300/10';
      timeBlendMode = 'soft-light';
      break;
    case 'gun':
      timeOverlayStyle = 'bg-gradient-to-b from-sky-400/5 via-transparent to-amber-200/5';
      timeBlendMode = 'normal';
      break;
    case 'aksam':
      timeOverlayStyle = 'bg-gradient-to-t from-amber-600/20 via-orange-500/15 to-purple-900/20';
      timeBlendMode = 'soft-light';
      break;
    case 'gece':
      timeOverlayStyle = 'bg-gradient-to-b from-slate-950/45 via-indigo-950/35 to-slate-900/40';
      timeBlendMode = 'multiply';
      break;
  }

  // 2. Warmth / Temperature Grade Filter & Overlay
  let warmthOverlay = 'bg-transparent';
  let warmthFilter = '';
  let warmthBlendMode = 'normal';

  switch (colorWarmth) {
    case 'sicak':
      // Soft amber golden hour warmth
      warmthOverlay = 'bg-amber-600/15';
      warmthFilter = `sepia(0.28) saturate(1.12) hue-rotate(-5deg)`;
      warmthBlendMode = 'soft-light';
      break;
    case 'serin':
      // Cool refreshing blue-cyan/slate mist
      warmthOverlay = 'bg-sky-950/20';
      warmthFilter = `hue-rotate(8deg) saturate(0.92) contrast(0.98)`;
      warmthBlendMode = 'soft-light';
      break;
    case 'sepya':
      // Nostalgic vintage parchment / antique gouache tone
      warmthOverlay = 'bg-amber-900/22';
      warmthFilter = `sepia(0.62) contrast(0.94) saturate(0.85)`;
      warmthBlendMode = 'multiply';
      break;
    case 'dogal':
    default:
      warmthOverlay = 'bg-transparent';
      warmthFilter = '';
      warmthBlendMode = 'normal';
      break;
  }

  const combinedFilter = `brightness(${brightness}) ${warmthFilter}`.trim();

  return (
    <>
      {/* Time of Day Atmosphere Layer */}
      <div
        className={`absolute inset-0 pointer-events-none z-15 transition-all duration-[2000ms] ease-in-out ${timeOverlayStyle}`}
        style={{
          mixBlendMode: timeBlendMode as any,
          filter: `brightness(${brightness})`,
        }}
      />

      {/* Color Warmth (Sıcaklık: Sıcak / Serin / Sepya) Overlay */}
      {colorWarmth !== 'dogal' && (
        <div
          className={`absolute inset-0 pointer-events-none z-16 transition-all duration-[1500ms] ease-in-out ${warmthOverlay}`}
          style={{
            mixBlendMode: warmthBlendMode as any,
            backdropFilter: combinedFilter,
            WebkitBackdropFilter: combinedFilter,
          }}
        />
      )}
    </>
  );
};
