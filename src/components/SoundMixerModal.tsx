import React, { useState } from 'react';
import { X, Wind, Waves, CloudRain, Flame, Bell, Music, Sparkles, Volume2, Sliders, Layers } from 'lucide-react';
import { SoundMixerSettings, SoundPreset } from '../types';
import { ambientAudio } from '../audio/ambientAudio';

interface SoundMixerModalProps {
  mixer: SoundMixerSettings;
  masterVolume: number;
  onUpdateMixer: (newMixer: SoundMixerSettings) => void;
  onUpdateVolume: (vol: number) => void;
  onClose: () => void;
}

const PRESETS: Array<{
  id: SoundPreset;
  title: string;
  desc: string;
  config: Partial<SoundMixerSettings>;
}> = [
  {
    id: 'manzara',
    title: 'Manzaraya Özel',
    desc: 'O anki pencerenin doğal ses dengesi',
    config: { preset: 'manzara' },
  },
  {
    id: 'yagmur',
    title: 'Yağmurlu İkindi',
    desc: 'Cama vuran yağmur ve uzak gök gürültüsü',
    config: {
      preset: 'yagmur',
      wind: 0.3,
      waves: 0.0,
      rain: 0.7,
      stream: 0.0,
      fireplace: 0.15,
      crickets: 0.0,
      birds: 0.05,
      thunder: 0.45,
      singingBowl: 0.0,
      pad: 0.4,
    },
  },
  {
    id: 'somine',
    title: 'Sıcak Şömine',
    desc: 'Çıtırdayan odun sesleri ve hafif rüzgar',
    config: {
      preset: 'somine',
      wind: 0.25,
      waves: 0.0,
      rain: 0.0,
      stream: 0.0,
      fireplace: 0.75,
      crickets: 0.0,
      birds: 0.0,
      thunder: 0.0,
      singingBowl: 0.0,
      pad: 0.45,
    },
  },
  {
    id: 'deniz',
    title: 'Sakin Sahil',
    desc: 'Kıyıya vuran dalgalar ve deniz meltemi',
    config: {
      preset: 'deniz',
      wind: 0.35,
      waves: 0.75,
      rain: 0.0,
      stream: 0.0,
      fireplace: 0.0,
      crickets: 0.0,
      birds: 0.2,
      thunder: 0.0,
      singingBowl: 0.0,
      pad: 0.3,
    },
  },
  {
    id: 'orman',
    title: 'Dağ Deresi & Orman',
    desc: 'Şırıldayan su sesi, kuşlar ve çam esintisi',
    config: {
      preset: 'orman',
      wind: 0.3,
      waves: 0.0,
      rain: 0.0,
      stream: 0.65,
      fireplace: 0.0,
      crickets: 0.0,
      birds: 0.65,
      thunder: 0.0,
      singingBowl: 0.0,
      pad: 0.25,
    },
  },
  {
    id: 'gece',
    title: 'Yaz Gecesi',
    desc: 'Cırcır böcekleri, gece serinliği ve akorlar',
    config: {
      preset: 'gece',
      wind: 0.2,
      waves: 0.0,
      rain: 0.0,
      stream: 0.0,
      fireplace: 0.0,
      crickets: 0.6,
      birds: 0.0,
      thunder: 0.0,
      singingBowl: 0.2,
      pad: 0.55,
    },
  },
  {
    id: 'meditasyon',
    title: 'Derin Dinginlik',
    desc: '432 Hz Tibet çanağı ve sıcak akorlar',
    config: {
      preset: 'meditasyon',
      wind: 0.25,
      waves: 0.15,
      rain: 0.0,
      stream: 0.0,
      fireplace: 0.0,
      crickets: 0.0,
      birds: 0.0,
      thunder: 0.0,
      singingBowl: 0.7,
      pad: 0.6,
    },
  },
];

export const SoundMixerModal: React.FC<SoundMixerModalProps> = ({
  mixer,
  masterVolume,
  onUpdateMixer,
  onUpdateVolume,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'channels'>('channels');

  const handleApplyPreset = (preset: (typeof PRESETS)[0]) => {
    const updated: SoundMixerSettings = {
      ...mixer,
      ...preset.config,
      preset: preset.id,
    };
    onUpdateMixer(updated);
    ambientAudio.updateMixer(updated);
  };

  const handleSliderChange = (channel: keyof SoundMixerSettings, val: number) => {
    const updated: SoundMixerSettings = {
      ...mixer,
      [channel]: val,
      preset: 'ozel',
    };
    onUpdateMixer(updated);
    ambientAudio.updateMixer(updated);
  };

  return (
    <div
      onClick={onClose}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm select-none"
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Modal Dialog Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-stone-900/98 border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 text-stone-200 max-h-[82vh] flex flex-col overscroll-contain animate-slide-up"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-800/80 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-950/60 text-amber-300 rounded-xl border border-amber-800/40">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-medium font-serif tracking-wide text-stone-100">
                Ses Mikseri & Ambiyans
              </h2>
              <p className="text-[11px] text-stone-400 font-light">
                Doğal sesleri karıştır veya hazır mod seç
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Volume Bar */}
        <div className="py-2.5 border-b border-stone-800/60 flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-stone-300 font-light whitespace-nowrap">
            Ana Ses
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={(e) => onUpdateVolume(parseFloat(e.target.value))}
            className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-stone-400 font-mono w-9 text-right flex-shrink-0">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-3 pb-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-light tracking-wide flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              activeTab === 'channels'
                ? 'bg-amber-950/60 border-amber-600/60 text-amber-200 shadow-sm'
                : 'bg-stone-850 border-stone-800 hover:border-stone-700 text-stone-400'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>10 Ses Kanalı</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-light tracking-wide flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-amber-950/60 border-amber-600/60 text-amber-200 shadow-sm'
                : 'bg-stone-850 border-stone-800 hover:border-stone-700 text-stone-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Hazır Ambiyanslar</span>
          </button>
        </div>

        {/* Scrollable Tab Content with clean scroll styling */}
        <div
          className="flex-grow overflow-y-auto overscroll-contain pr-1 space-y-2.5 pt-1"
          style={{ overscrollBehavior: 'contain' }}
        >
          {activeTab === 'presets' ? (
            /* PRESETS LIST */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2">
              {PRESETS.map((p) => {
                const isActive = mixer.preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleApplyPreset(p)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-950/50 border-amber-500/80 text-amber-100 shadow-md ring-1 ring-amber-400/40'
                        : 'bg-stone-800/40 border-stone-800 hover:border-stone-700 text-stone-300'
                    }`}
                  >
                    <div className="text-xs font-medium">{p.title}</div>
                    <div className="text-[11px] text-stone-400 font-light mt-0.5 leading-snug">
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* 10 SOUND CHANNELS SLIDERS */
            <div className="space-y-2 pb-3">
              <SoundChannelRow
                icon={<Wind className="w-3.5 h-3.5 text-stone-400" />}
                title="Rüzgar & Hafif Esinti"
                value={mixer.wind}
                onChange={(v) => handleSliderChange('wind', v)}
              />

              <SoundChannelRow
                icon={<Waves className="w-3.5 h-3.5 text-sky-400" />}
                title="Deniz Dalgaları"
                value={mixer.waves}
                onChange={(v) => handleSliderChange('waves', v)}
              />

              <SoundChannelRow
                icon={<CloudRain className="w-3.5 h-3.5 text-blue-400" />}
                title="Pencere Yağmuru"
                value={mixer.rain}
                onChange={(v) => handleSliderChange('rain', v)}
              />

              <SoundChannelRow
                icon={<Waves className="w-3.5 h-3.5 text-teal-400" />}
                title="Dere & Akarsu Şırıltısı"
                value={mixer.stream}
                onChange={(v) => handleSliderChange('stream', v)}
              />

              <SoundChannelRow
                icon={<Flame className="w-3.5 h-3.5 text-orange-400" />}
                title="Şömine & Çıtırdayan Odun"
                value={mixer.fireplace}
                onChange={(v) => handleSliderChange('fireplace', v)}
                extraTrigger={() => ambientAudio.triggerFireCracklePop?.()}
              />

              <SoundChannelRow
                icon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                title="Orman Kuşları"
                value={mixer.birds}
                onChange={(v) => handleSliderChange('birds', v)}
                extraTrigger={() => ambientAudio.triggerSoftBirdChirp()}
              />

              <SoundChannelRow
                icon={<Sparkles className="w-3.5 h-3.5 text-lime-400" />}
                title="Gece Cırcır Böcekleri"
                value={mixer.crickets}
                onChange={(v) => handleSliderChange('crickets', v)}
              />

              <SoundChannelRow
                icon={<CloudRain className="w-3.5 h-3.5 text-indigo-400" />}
                title="Uzak Gök Gürültüsü"
                value={mixer.thunder}
                onChange={(v) => handleSliderChange('thunder', v)}
                extraTrigger={() => ambientAudio.triggerDistantThunder()}
              />

              <SoundChannelRow
                icon={<Bell className="w-3.5 h-3.5 text-amber-300" />}
                title="Tibet Çanağı & Çan (432 Hz)"
                value={mixer.singingBowl}
                onChange={(v) => handleSliderChange('singingBowl', v)}
                extraTrigger={() => ambientAudio.strikeSingingBowl()}
              />

              <SoundChannelRow
                icon={<Music className="w-3.5 h-3.5 text-purple-400" />}
                title="Dingin Akorlar (Warm Pad)"
                value={mixer.pad}
                onChange={(v) => handleSliderChange('pad', v)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SoundChannelRowProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  onChange: (val: number) => void;
  extraTrigger?: () => void;
}

const SoundChannelRow: React.FC<SoundChannelRowProps> = ({
  icon,
  title,
  value,
  onChange,
  extraTrigger,
}) => {
  return (
    <div
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className="flex items-center gap-2.5 bg-stone-800/40 p-2 sm:p-2.5 rounded-2xl border border-stone-800/80"
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between text-xs font-light text-stone-300 pb-1">
          <span className="truncate pr-2">{title}</span>
          <span className="text-[11px] text-stone-500 font-mono flex-shrink-0">
            {Math.round(value * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full accent-amber-500 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {extraTrigger && (
        <button
          onClick={extraTrigger}
          className="flex-shrink-0 px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-[10px] transition-colors cursor-pointer"
          title="Tıklayarak sesi dinle"
        >
          Çal
        </button>
      )}
    </div>
  );
};
