import React, { useEffect, useState, useRef } from 'react';
import { AppSettings, SceneConfig } from '../types';
import { AtmosphereCanvas } from './AtmosphereCanvas';
import { CurtainOverlay } from './CurtainOverlay';
import { TimeOfDayGrade } from './TimeOfDayGrade';
import { BreathingOrb } from './BreathingOrb';
import { FallbackArtwork } from './FallbackArtwork';

interface SceneViewProps {
  currentScene: SceneConfig;
  settings: AppSettings;
  isPaused: boolean;
  customImages?: Record<string, string>; // sceneId -> dataUrl/blob
  onTapScene?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const SceneView: React.FC<SceneViewProps> = ({
  currentScene,
  settings,
  isPaused,
  customImages,
  onTapScene,
}) => {
  const [activeScene, setActiveScene] = useState<SceneConfig>(currentScene);
  const [prevScene, setPrevScene] = useState<SceneConfig | null>(null);
  const [isCrossFading, setIsCrossFading] = useState<boolean>(false);

  // 3D Parallax tilt state (-1 to +1)
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentScene.id !== activeScene.id) {
      setPrevScene(activeScene);
      setActiveScene(currentScene);
      setIsCrossFading(true);

      const timer = setTimeout(() => {
        setIsCrossFading(false);
        setPrevScene(null);
      }, 3000); // 3-second crossfade

      return () => clearTimeout(timer);
    }
  }, [currentScene, activeScene]);

  // Subtle 3D parallax on mouse move / device tilt
  useEffect(() => {
    if (settings.motionIntensity === 'dusuk') {
      setTilt({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setTilt({ x: x * 0.8, y: y * 0.8 });
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // gamma: left-to-right (-90 to 90), beta: front-to-back (-180 to 180)
        const x = Math.max(-1, Math.min(1, e.gamma / 30));
        const y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
        setTilt({ x: x * 0.6, y: y * 0.6 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [settings.motionIntensity]);

  // 3D Rotation angles (very gentle: max 1.2 degrees)
  const rotateY = tilt.x * 1.2;
  const rotateX = -tilt.y * 1.2;
  const translateX = tilt.x * 4;
  const translateY = tilt.y * 4;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none bg-stone-900 touch-none"
      style={{ perspective: '1400px' }}
    >
      {/* 3D PARALLAX CONTAINER */}
      <div
        className="relative w-full h-full transition-transform duration-700 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 0)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* PREVIOUS SCENE LAYER (Fading out over 3s) */}
        {prevScene && isCrossFading && (
          <div className="absolute inset-0 z-0 transition-opacity duration-[3000ms] opacity-0 ease-in-out">
            <SceneLayer
              scene={prevScene}
              settings={settings}
              isPaused={isPaused}
              customImage={customImages?.[prevScene.id]}
              tilt={tilt}
            />
          </div>
        )}

        {/* ACTIVE SCENE LAYER */}
        <div className="absolute inset-0 z-10 transition-opacity duration-[3000ms] ease-in-out opacity-100">
          <SceneLayer
            scene={activeScene}
            settings={settings}
            isPaused={isPaused}
            customImage={customImages?.[activeScene.id]}
            tilt={tilt}
            onTapScene={onTapScene}
          />
        </div>
      </div>
    </div>
  );
};

interface SceneLayerProps {
  scene: SceneConfig;
  settings: AppSettings;
  isPaused: boolean;
  customImage?: string;
  tilt: { x: number; y: number };
  onTapScene?: (e: React.MouseEvent | React.TouchEvent) => void;
}

const SceneLayer: React.FC<SceneLayerProps> = ({
  scene,
  settings,
  isPaused,
  customImage,
  tilt,
  onTapScene,
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const isLowMotion = settings.motionIntensity === 'dusuk' || isPaused;
  const animClasses = isLowMotion ? '' : 'ken-burns-drift breathing-3d';

  // Warmth filter style (Sıcaklık: Doğal / Sıcak / Serin / Sepya)
  let warmthFilterStyle = '';
  if (settings.colorWarmth === 'sicak') {
    warmthFilterStyle = 'sepia(0.24) saturate(1.14) hue-rotate(-6deg)';
  } else if (settings.colorWarmth === 'serin') {
    warmthFilterStyle = 'hue-rotate(9deg) saturate(0.92) contrast(0.98)';
  } else if (settings.colorWarmth === 'sepya') {
    warmthFilterStyle = 'sepia(0.65) contrast(0.94) saturate(0.85)';
  }

  const imageSrc = customImage || scene.imagePath;

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [imageSrc]);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
      {/* BASE IMAGE / USER'S PHOTO */}
      <div
        className={`absolute inset-0 w-full h-full ${animClasses}`}
        style={{
          filter: warmthFilterStyle || undefined,
          transition: 'filter 1500ms ease-in-out',
        }}
      >
        {!imgError ? (
          <>
            <img
              src={imageSrc}
              alt={scene.name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-opacity duration-1000 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {!imgLoaded && <FallbackArtwork scene={scene} />}
          </>
        ) : (
          <FallbackArtwork scene={scene} />
        )}
      </div>

      {/* 3D WINDOW GLASS SPECULAR SHEEN */}
      <div
        className="absolute inset-0 pointer-events-none z-14 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at ${50 + tilt.x * 20}% ${40 + tilt.y * 20}%, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.0) 70%)`,
        }}
      />

      {/* TIME OF DAY & COLOR WARMTH GRADE */}
      <TimeOfDayGrade
        timeOfDay={settings.timeOfDay}
        colorWarmth={settings.colorWarmth}
        brightness={settings.brightness}
      />

      {/* CURTAINS */}
      <CurtainOverlay
        regions={scene.curtainRegions}
        motionIntensity={settings.motionIntensity}
        isPaused={isPaused}
      />

      {/* ATMOSPHERE PARTICLES, STEAM, DUST, LIGHT, TAP REACTIONS */}
      <AtmosphereCanvas
        scene={scene}
        motionIntensity={settings.motionIntensity}
        isPaused={isPaused}
        onTapScene={onTapScene}
      />

      {/* 3D BREATHING LIGHT ORB */}
      <BreathingOrb enabled={settings.breathingLightEnabled} />
    </div>
  );
};
