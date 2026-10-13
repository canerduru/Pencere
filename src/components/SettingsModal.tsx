import React from 'react';
import { X, Volume2, Sun, Clock, Wind, Eye, Sparkles, Heart, CircleDot } from 'lucide-react';
import { AppSettings, MotionIntensity, TimeOfDay } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenSoundMixer?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onOpenSoundMixer,
  onClose,
}) => {
  return (
    <div
      onClick={onClose}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-stone-900/90 border border-stone-800/80 rounded-2xl shadow-2xl p-6 text-stone-200 max-h-[90vh] overflow-y-auto overscroll-contain"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800/70">
          <h2 className="text-lg font-light tracking-wide font-serif text-stone-100">
            Ayarlar
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800/80 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 pt-4 text-xs sm:text-sm">
          {/* 1. Ses Seviyesi & Ambiyans Seçenekleri */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-2 font-light">
                <Volume2 className="w-4 h-4 text-stone-400" />
                Ses Düzeyi & Karıştırıcı
              </span>
              <span className="text-stone-400 text-xs">
                {Math.round(settings.masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) =>
                onUpdateSettings({ masterVolume: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500/80 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />

            {/* Ses Mikserini Aç Butonu */}
            <button
              onClick={() => {
                onOpenSoundMixer?.();
                onClose();
              }}
              className="w-full py-2 px-3 bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border border-amber-800/50 rounded-xl text-xs font-light flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Sesleri Özelleştir (10 Doğal Ses Kanalı)</span>
              <span className="text-[11px] bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-700/50">
                Mikseri Aç &rarr;
              </span>
            </button>

            {/* Sub-toggles: Doğa Sesi & Müzik */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-stone-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.natureSoundEnabled}
                  onChange={(e) =>
                    onUpdateSettings({ natureSoundEnabled: e.target.checked })
                  }
                  className="rounded border-stone-700 bg-stone-800 accent-amber-500 cursor-pointer"
                />
                Doğa sesleri
              </label>

              <label className="flex items-center gap-2 text-stone-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.musicEnabled}
                  onChange={(e) =>
                    onUpdateSettings({ musicEnabled: e.target.checked })
                  }
                  className="rounded border-stone-700 bg-stone-800 accent-amber-500 cursor-pointer"
                />
                Dingin Akorlar
              </label>
            </div>
          </div>

          {/* 2. Hareket Yoğunluğu */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-stone-300 font-light">
              <Wind className="w-4 h-4 text-stone-400" />
              Hareket Yoğunluğu
            </div>
            <div className="grid grid-cols-3 gap-2 p-1 bg-stone-800/60 rounded-xl border border-stone-800">
              {(['dusuk', 'orta', 'normal'] as MotionIntensity[]).map((level) => {
                const label =
                  level === 'dusuk'
                    ? 'Düşük'
                    : level === 'orta'
                    ? 'Orta'
                    : 'Normal';
                const isActive = settings.motionIntensity === level;
                return (
                  <button
                    key={level}
                    onClick={() => onUpdateSettings({ motionIntensity: level })}
                    className={`py-1.5 px-3 rounded-lg text-xs font-light tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? 'bg-stone-700 text-stone-100 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Parlaklık */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-stone-300">
              <span className="flex items-center gap-2 font-light">
                <Sun className="w-4 h-4 text-stone-400" />
                Parlaklık
              </span>
              <span className="text-stone-400 text-xs">
                {Math.round(settings.brightness * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={settings.brightness}
              onChange={(e) =>
                onUpdateSettings({ brightness: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500/80 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* 4. Gün Saati */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-stone-300 font-light">
              <Clock className="w-4 h-4 text-stone-400" />
              Gün Saati
            </div>
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-stone-800/60 rounded-xl border border-stone-800 text-center">
              {(
                [
                  ['sabah', 'Sabah'],
                  ['gun', 'Gün'],
                  ['aksam', 'Akşam'],
                  ['gece', 'Gece'],
                  ['otomatik', 'Oto'],
                ] as [TimeOfDay, string][]
              ).map(([timeKey, timeLabel]) => {
                const isActive = settings.timeOfDay === timeKey;
                return (
                  <button
                    key={timeKey}
                    onClick={() => onUpdateSettings({ timeOfDay: timeKey })}
                    className={`py-1.5 rounded-lg text-xs font-light transition-all cursor-pointer ${
                      isActive
                        ? 'bg-stone-700 text-stone-100 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {timeLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Toggles: Nefes Egzersizi, Nefes Işığı, Sadece İzleme Modu */}
          <div className="space-y-3 pt-2 border-t border-stone-800/60">
            {/* Nefes Egzersizi Modu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-300 font-light">
                <CircleDot className="w-4 h-4 text-amber-300" />
                <div>
                  <span className="text-stone-100 font-normal">Nefes Egzersizi</span>
                  <p className="text-[11px] text-stone-400 font-light">
                    Ekran ortasında zarif nefes kılavuz halkası
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({
                    breathingExerciseEnabled: !settings.breathingExerciseEnabled,
                  })
                }
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                  settings.breathingExerciseEnabled
                    ? 'bg-amber-600/80 ring-1 ring-amber-400/50'
                    : 'bg-stone-800'
                }`}
                title="Nefes Egzersizi Modunu Aç/Kapat"
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    settings.breathingExerciseEnabled
                      ? 'translate-x-5'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Nefes Işığı */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-300 font-light">
                <Sparkles className="w-4 h-4 text-stone-400" />
                <div>
                  <span>Nefes Işığı</span>
                  <p className="text-[11px] text-stone-500 font-light">
                    Denizlik üzerinde minik parlayan küre
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({
                    breathingLightEnabled: !settings.breathingLightEnabled,
                  })
                }
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                  settings.breathingLightEnabled
                    ? 'bg-amber-600/80'
                    : 'bg-stone-800'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    settings.breathingLightEnabled
                      ? 'translate-x-5'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sadece İzleme Modu */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-300 font-light">
                <Eye className="w-4 h-4 text-stone-400" />
                <div>
                  <span>Sadece İzleme Modu</span>
                  <p className="text-[11px] text-stone-500 font-light">
                    Tüm düğmeleri gizler, ekrana dokunarak çıkılır
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onUpdateSettings({ onlyWatchMode: true });
                  onClose();
                }}
                className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-light transition-colors cursor-pointer"
              >
                Başlat
              </button>
            </div>

            {/* Sürekli Gezdir */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-300 font-light">
                <Heart className="w-4 h-4 text-stone-400" />
                <div>
                  <span>Sürekli Gezdir</span>
                  <p className="text-[11px] text-stone-500 font-light">
                    Her birkaç dakikada manzarayı usulca değiştirir
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  onUpdateSettings({
                    autoCycleScenes: !settings.autoCycleScenes,
                  })
                }
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                  settings.autoCycleScenes
                    ? 'bg-amber-600/80'
                    : 'bg-stone-800'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    settings.autoCycleScenes
                      ? 'translate-x-5'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* SAFETY & WELLNESS MANDATORY FRAMING */}
          <div className="pt-3 border-t border-stone-800/60">
            <p className="text-[11px] text-stone-500 font-light leading-relaxed">
              Bu uygulama bir rahatlama ve farkındalık aracıdır. Tıbbi tedavinin ya da profesyonel destek yerini almaz. Kendini kötü hissediyorsan bir uzmandan destek al.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
