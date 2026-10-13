export type TimeOfDay = 'sabah' | 'gun' | 'aksam' | 'gece' | 'otomatik';

export type ParticleType =
  | 'clouds'
  | 'birds'
  | 'petals'
  | 'fireflies'
  | 'rain'
  | 'snow'
  | 'balloons'
  | 'sea_sparkle';

export type TapEffectType =
  | 'flowers'
  | 'ripples'
  | 'birds'
  | 'petals'
  | 'shooting_star'
  | 'rain_glow'
  | 'balloons';

export type MotionIntensity = 'dusuk' | 'orta' | 'normal';

export interface Hotspot {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  label: string;
}

export interface CurtainRegions {
  left: { minX: number; maxX: number };
  right: { minX: number; maxX: number };
}

export interface SoundProfile {
  windLevel: number;
  rainLevel: number;
  birdsLevel: number;
  seaWavesLevel: number;
  cricketsLevel: number;
  streamLevel?: number;
  fireplaceLevel?: number;
  thunderLevel?: number;
  singingBowlLevel?: number;
  padBaseFreq: number;
  padChord: number[];
  toneBrightness: number;
}

export type SoundPreset =
  | 'manzara'
  | 'yagmur'
  | 'gece'
  | 'deniz'
  | 'somine'
  | 'orman'
  | 'meditasyon'
  | 'ruzgar_cani'
  | 'sonbahar'
  | 'kahve_kosesi'
  | 'ozel';

export interface SoundMixerSettings {
  wind: number; // 0 to 1
  waves: number;
  rain: number;
  stream: number; // Dere / Akarsu
  fireplace: number; // Şömine / Çıtırdayan Odun
  crickets: number; // Cırcır Böcekleri
  birds: number; // Kuş Cıvıltıları
  thunder: number; // Uzak Dingin Gök Gürültüsü
  singingBowl: number; // Tibet Çanağı / Dingin Çan
  windChimes: number; // Rüzgar Çanı (Bambu & Kristal)
  leaves: number; // Yaprak Hışırtısı & Orman Esintisi
  coffeeMurmur: number; // Sıcak Kahve & Kupa Fısıltısı
  pad: number; // Dingin Akorlar
  preset: SoundPreset;
}

export interface SceneConfig {
  id: string;
  name: string;
  country: string;
  description: string;
  imagePath: string;
  curtainRegions: CurtainRegions;
  steamHotspots: Hotspot[];
  plantHotspots: Hotspot[];
  particleType: ParticleType;
  tapEffectType: TapEffectType;
  defaultTimeOfDay: 'sabah' | 'gun' | 'aksam' | 'gece';
  soundProfile: SoundProfile;
  palette: {
    skyTop: string;
    skyBottom: string;
    landscapePrimary: string;
    landscapeSecondary: string;
    curtainColor: string;
    roomWoodColor: string;
    sillColor: string;
  };
}

export type ColorWarmth = 'dogal' | 'sicak' | 'serin' | 'sepya';

export interface AppSettings {
  masterVolume: number;
  natureSoundEnabled: boolean;
  musicEnabled: boolean;
  motionIntensity: MotionIntensity;
  brightness: number;
  timeOfDay: TimeOfDay;
  colorWarmth: ColorWarmth;
  onlyWatchMode: boolean;
  breathingLightEnabled: boolean;
  breathingExerciseEnabled: boolean;
  autoCycleScenes: boolean;
  autoCycleIntervalMinutes: number;
  soundMixer: SoundMixerSettings;
}
