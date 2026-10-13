import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Image as ImageIcon, Settings as SettingsIcon, EyeOff, Upload, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { SCENES } from './config/scenes';
import { AppSettings, SceneConfig, SoundMixerSettings } from './types';
import { ambientAudio } from './audio/ambientAudio';
import { SceneView } from './components/SceneView';
import { StartScreen } from './components/StartScreen';
import { SettingsModal } from './components/SettingsModal';
import { SceneGallery } from './components/SceneGallery';
import { GroundingPrompt } from './components/GroundingPrompt';
import { BreathingGuideRing } from './components/BreathingGuideRing';
import { SoundMixerModal } from './components/SoundMixerModal';
import { fileToDataUrl, loadAllSceneImages, saveSceneImage } from './utils/imageStorage';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [scenesList] = useState<SceneConfig[]>(SCENES);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Modals
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSoundMixerOpen, setIsSoundMixerOpen] = useState(false);

  // Grounding prompt (after 10 minutes)
  const [showGroundingPrompt, setShowGroundingPrompt] = useState(false);
  const groundingTimerRef = useRef<number | null>(null);

  // Watch mode exit button visibility
  const [showWatchExitDot, setShowWatchExitDot] = useState(false);
  const watchExitTimeoutRef = useRef<number | null>(null);

  // User uploaded 14 photos persisted in IndexedDB
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const fileInputBannerRef = useRef<HTMLInputElement | null>(null);

  // Load photos from IndexedDB on startup
  useEffect(() => {
    loadAllSceneImages().then((saved) => {
      if (saved && Object.keys(saved).length > 0) {
        setCustomImages(saved);
      }
    });
  }, []);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return {
      masterVolume: 0.7,
      natureSoundEnabled: true,
      musicEnabled: true,
      motionIntensity: prefersReducedMotion ? 'dusuk' : 'orta',
      brightness: 1.0,
      timeOfDay: 'gun',
      onlyWatchMode: false,
      breathingLightEnabled: false,
      breathingExerciseEnabled: false,
      autoCycleScenes: false,
      autoCycleIntervalMinutes: 3,
      soundMixer: {
        wind: 0.35,
        waves: 0.0,
        rain: 0.0,
        stream: 0.0,
        fireplace: 0.0,
        crickets: 0.05,
        birds: 0.5,
        thunder: 0.0,
        singingBowl: 0.0,
        pad: 0.5,
        preset: 'manzara',
      },
    };
  });

  const currentScene = scenesList[currentSceneIndex] || scenesList[0];

  // Start app
  const handleStart = async () => {
    setHasStarted(true);
    await ambientAudio.init();
    ambientAudio.updateScene(currentScene.soundProfile);

    // Schedule 10-minute grounding reminder
    groundingTimerRef.current = window.setTimeout(() => {
      setShowGroundingPrompt(true);
    }, 10 * 60 * 1000);
  };

  // Change Scene
  const handleSelectScene = useCallback(
    (scene: SceneConfig) => {
      const idx = scenesList.findIndex((s) => s.id === scene.id);
      if (idx !== -1) {
        setCurrentSceneIndex(idx);
        ambientAudio.updateScene(scene.soundProfile);
      }
    },
    [scenesList]
  );

  const handleNextScene = useCallback(() => {
    const nextIdx = (currentSceneIndex + 1) % scenesList.length;
    setCurrentSceneIndex(nextIdx);
    ambientAudio.updateScene(scenesList[nextIdx].soundProfile);
  }, [currentSceneIndex, scenesList]);

  const handlePrevScene = useCallback(() => {
    const prevIdx = (currentSceneIndex - 1 + scenesList.length) % scenesList.length;
    setCurrentSceneIndex(prevIdx);
    ambientAudio.updateScene(scenesList[prevIdx].soundProfile);
  }, [currentSceneIndex, scenesList]);

  const handleRandomScene = useCallback(() => {
    let nextIdx = Math.floor(Math.random() * scenesList.length);
    if (nextIdx === currentSceneIndex && scenesList.length > 1) {
      nextIdx = (nextIdx + 1) % scenesList.length;
    }
    setCurrentSceneIndex(nextIdx);
    ambientAudio.updateScene(scenesList[nextIdx].soundProfile);
  }, [currentSceneIndex, scenesList]);

  // Pause / Resume
  const handleTogglePause = () => {
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    ambientAudio.setPaused(newPaused);
  };

  // Mute / Unmute
  const handleToggleMute = () => {
    const muted = ambientAudio.toggleMute();
    setIsMuted(muted);
  };

  // Settings update
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.masterVolume !== undefined) {
        ambientAudio.setVolume(newSettings.masterVolume);
      }
      if (newSettings.natureSoundEnabled !== undefined) {
        ambientAudio.setNatureEnabled(newSettings.natureSoundEnabled);
      }
      if (newSettings.musicEnabled !== undefined) {
        ambientAudio.setMusicEnabled(newSettings.musicEnabled);
      }
      if (newSettings.soundMixer !== undefined) {
        ambientAudio.updateMixer(newSettings.soundMixer);
      }
      return updated;
    });
  };

  // Auto cycle scenes ("Sürekli Gezdir")
  useEffect(() => {
    if (!hasStarted || !settings.autoCycleScenes) return;

    const intervalMs = settings.autoCycleIntervalMinutes * 60 * 1000;
    const intervalId = setInterval(() => {
      handleNextScene();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [hasStarted, settings.autoCycleScenes, settings.autoCycleIntervalMinutes, handleNextScene]);

  // Touch Swipe gestures (left/right to change landscape view)
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isAnyModalOpen = isSoundMixerOpen || isSettingsOpen || isGalleryOpen;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnyModalOpen) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isAnyModalOpen || touchStartXRef.current === null || touchStartYRef.current === null) {
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      return;
    }
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        handleNextScene();
      } else {
        handlePrevScene();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Watch mode tap reaction
  const handleScreenTap = () => {
    if (isAnyModalOpen) return;
    if (settings.onlyWatchMode) {
      setShowWatchExitDot(true);
      if (watchExitTimeoutRef.current) clearTimeout(watchExitTimeoutRef.current);
      watchExitTimeoutRef.current = window.setTimeout(() => {
        setShowWatchExitDot(false);
      }, 3500);
    }
  };

  // Intelligent matching of uploaded files to the 14 scene IDs
  const handleUploadCustomImages = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const updatedMap: Record<string, string> = { ...customImages };
    let matchCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const dataUrl = await fileToDataUrl(file);
      const name = file.name.toLowerCase();

      // Find matching scene by filename keyword or timestamp
      let matchedScene = scenesList.find((sc) => {
        const scIdLower = sc.id.toLowerCase();
        // Check if timestamp in filename matches scene ID
        const timeMatch = scIdLower.match(/\d{14}/);
        if (timeMatch && name.includes(timeMatch[0])) return true;

        if (name.includes('kyoto') && scIdLower.includes('kyoto')) return true;
        if (name.includes('fjord') && scIdLower.includes('fjord')) return true;
        if (name.includes('iceland') && scIdLower.includes('iceland')) return true;
        if (name.includes('cappadocia') && scIdLower.includes('cappadocia')) return true;
        if (name.includes('alps') && scIdLower.includes('alps')) return true;
        if (name.includes('maldives') && scIdLower.includes('maldives')) return true;
        if (name.includes('village') && scIdLower.includes('village')) return true;
        return false;
      });

      // If single file uploaded while viewing current scene, apply to current scene
      if (!matchedScene && fileArray.length === 1) {
        matchedScene = currentScene;
      } else if (!matchedScene) {
        // Fallback: match by index
        matchedScene = scenesList[i % scenesList.length];
      }

      if (matchedScene) {
        updatedMap[matchedScene.id] = dataUrl;
        await saveSceneImage(matchedScene.id, dataUrl);
        matchCount++;
      }
    }

    setCustomImages(updatedMap);
    setUploadNotice(`${matchCount} fotoğraf başarıyla pencereye yerleştirildi.`);
    setTimeout(() => setUploadNotice(null), 4000);
  };

  // Drag and Drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadCustomImages(e.dataTransfer.files);
    }
  };

  const loadedPhotosCount = Object.keys(customImages).length;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleScreenTap}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none"
    >
      {/* FULL-BLEED WINDOW VIEW (KEN BURNS + LAYERED LIFE) */}
      <SceneView
        currentScene={currentScene}
        settings={settings}
        isPaused={isPaused}
        customImages={customImages}
      />

      {/* EKRAN ORTASINDA ZARİF NEFES KILAVUZ HALKASI */}
      <BreathingGuideRing
        enabled={settings.breathingExerciseEnabled}
        isPaused={isPaused}
      />

      {/* TOP NOTIFICATION / ONE-CLICK PHOTO IMPORT BANNER */}
      {hasStarted && !settings.onlyWatchMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-35 flex flex-col items-center gap-1 pointer-events-auto">
          {/* Success toast if recently uploaded */}
          {uploadNotice && (
            <div className="flex items-center gap-2 bg-stone-900/90 text-amber-200 px-4 py-2 rounded-full border border-amber-500/40 shadow-xl text-xs font-light animate-fade-in backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>{uploadNotice}</span>
            </div>
          )}

          {/* Quick upload prompt if user hasn't loaded their 14 photos yet */}
          {loadedPhotosCount === 0 && !uploadNotice && (
            <div className="flex items-center gap-2 bg-stone-950/75 hover:bg-stone-950/90 text-stone-200 px-3.5 py-1.5 rounded-full border border-white/15 shadow-xl text-xs font-light backdrop-blur-md transition-all">
              <span>Verdiğin 14 fotoğrafı tek dokunuşla ekle:</span>
              <button
                onClick={() => fileInputBannerRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-800/70 hover:bg-amber-700/80 text-amber-100 rounded-full text-[11px] font-medium border border-amber-600/50 cursor-pointer transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>Fotoğrafları Seç (14 Adet)</span>
              </button>
              <input
                ref={fileInputBannerRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleUploadCustomImages(e.target.files)}
                className="hidden"
              />
            </div>
          )}
        </div>
      )}

      {/* MINIMAL CONTROLS (Bottom Center / Floating) */}
      {hasStarted && !settings.onlyWatchMode && (
        <div
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-35 flex items-center gap-2 sm:gap-3 bg-stone-950/50 hover:bg-stone-950/75 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 shadow-lg transition-all duration-300"
        >
          {/* Duraklat / Devam Et */}
          <button
            onClick={handleTogglePause}
            className="p-2 rounded-full hover:bg-white/15 text-stone-200 transition-colors cursor-pointer"
            title={isPaused ? 'Devam Et' : 'Duraklat'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Ses */}
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-full hover:bg-white/15 text-stone-200 transition-colors cursor-pointer"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Ses Mikseri */}
          <button
            onClick={() => setIsSoundMixerOpen(true)}
            className="p-2 rounded-full hover:bg-white/15 text-stone-200 transition-colors cursor-pointer"
            title="Sesleri Özelleştir (10 Doğal Ses Kanalı)"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-300" />
          </button>

          <div className="w-[1px] h-4 bg-white/15" />

          {/* Manzara Adı & Galeri Açıcı */}
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-white/15 text-stone-200 text-xs font-light tracking-wide transition-colors cursor-pointer"
            title="14 Manzara"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-200/80" />
            <span className="max-w-[130px] truncate">{currentScene.name}</span>
            <span className="text-[10px] text-stone-400">({currentSceneIndex + 1}/14)</span>
          </button>

          <div className="w-[1px] h-4 bg-white/15" />

          {/* Ayarlar */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-white/15 text-stone-200 transition-colors cursor-pointer"
            title="Ayarlar"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SADECE İZLEME MODU ÇIKIŞ BUTONU */}
      {settings.onlyWatchMode && showWatchExitDot && (
        <button
          onClick={() => handleUpdateSettings({ onlyWatchMode: false })}
          className="fixed top-6 right-6 z-40 flex items-center gap-2 bg-stone-900/85 hover:bg-stone-800 text-stone-200 px-3.5 py-2 rounded-full border border-white/20 shadow-xl text-xs font-light transition-all cursor-pointer animate-fade-in"
        >
          <EyeOff className="w-3.5 h-3.5 text-amber-300" />
          <span>İzleme Modundan Çık</span>
        </button>
      )}

      {/* START SCREEN (Dışarı bak. Yavaşça nefes ver.) */}
      {!hasStarted && <StartScreen onStart={handleStart} />}

      {/* 14 MANZARA GALERİSİ BAR / DRAWER */}
      {isGalleryOpen && (
        <SceneGallery
          scenes={scenesList}
          currentSceneId={currentScene.id}
          autoCycle={settings.autoCycleScenes}
          customImages={customImages}
          onSelectScene={(sc) => {
            handleSelectScene(sc);
            setIsGalleryOpen(false);
          }}
          onRandomScene={handleRandomScene}
          onToggleAutoCycle={() =>
            handleUpdateSettings({ autoCycleScenes: !settings.autoCycleScenes })
          }
          onUploadCustomImages={handleUploadCustomImages}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}

      {/* AYARLAR MODALI */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onOpenSoundMixer={() => setIsSoundMixerOpen(true)}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* SESLER & MİKSER MODALI */}
      {isSoundMixerOpen && (
        <SoundMixerModal
          mixer={settings.soundMixer}
          masterVolume={settings.masterVolume}
          onUpdateMixer={(newMixer) => handleUpdateSettings({ soundMixer: newMixer })}
          onUpdateVolume={(vol) => handleUpdateSettings({ masterVolume: vol })}
          onClose={() => setIsSoundMixerOpen(false)}
        />
      )}

      {/* 10 DAKİKALIK FARKINDALIK HATIRLATICISI */}
      {showGroundingPrompt && (
        <GroundingPrompt onDismiss={() => setShowGroundingPrompt(false)} />
      )}
    </div>
  );
}
