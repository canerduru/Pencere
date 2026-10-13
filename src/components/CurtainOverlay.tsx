import React, { useState } from 'react';
import { CurtainRegions, MotionIntensity } from '../types';

interface CurtainOverlayProps {
  regions: CurtainRegions;
  motionIntensity: MotionIntensity;
  isPaused: boolean;
}

export const CurtainOverlay: React.FC<CurtainOverlayProps> = ({
  regions,
  motionIntensity,
  isPaused,
}) => {
  const [leftFlutter, setLeftFlutter] = useState(false);
  const [rightFlutter, setRightFlutter] = useState(false);

  const speedClass =
    motionIntensity === 'dusuk'
      ? 'duration-[12000ms]'
      : motionIntensity === 'orta'
      ? 'duration-[8000ms]'
      : 'duration-[6000ms]';

  const handleLeftTap = () => {
    setLeftFlutter(true);
    setTimeout(() => setLeftFlutter(false), 2400);
  };

  const handleRightTap = () => {
    setRightFlutter(true);
    setTimeout(() => setRightFlutter(false), 2400);
  };

  return (
    <>
      {/* Left Curtain Subtle Breath */}
      <div
        onClick={handleLeftTap}
        className={`absolute top-0 bottom-0 left-0 pointer-events-auto z-12 cursor-pointer transition-transform ${speedClass} ease-in-out ${
          isPaused ? '' : 'curtain-sway-left'
        } ${leftFlutter ? 'curtain-flutter' : ''}`}
        style={{
          width: `${regions.left.maxX}%`,
        }}
        title="Tül perde (dokunarak hafifçe dalgalandır)"
      >
        {/* Soft highlight/shadow shimmer layer on the fabric */}
        <div className="w-full h-full opacity-15 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      </div>

      {/* Right Curtain Subtle Breath */}
      <div
        onClick={handleRightTap}
        className={`absolute top-0 bottom-0 right-0 pointer-events-auto z-12 cursor-pointer transition-transform ${speedClass} ease-in-out ${
          isPaused ? '' : 'curtain-sway-right'
        } ${rightFlutter ? 'curtain-flutter' : ''}`}
        style={{
          width: `${100 - regions.right.minX}%`,
        }}
        title="Tül perde (dokunarak hafifçe dalgalandır)"
      >
        <div className="w-full h-full opacity-15 bg-gradient-to-l from-transparent via-white/20 to-transparent pointer-events-none" />
      </div>
    </>
  );
};
