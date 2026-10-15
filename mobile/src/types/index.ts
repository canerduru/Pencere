export interface SoundProfile {
  windLevel: number;
  rainLevel: number;
  birdsLevel: number;
  seaWavesLevel: number;
  cricketsLevel: number;
  padBaseFreq: number;
  padChord: number[];
  toneBrightness: number;
}

export interface ScenePalette {
  skyTop: string;
  skyBottom: string;
  landscapePrimary: string;
  landscapeSecondary: string;
  curtainColor: string;
  roomWoodColor: string;
  sillColor: string;
}

export interface SceneConfig {
  id: string;
  name: string;
  country: string;
  description: string;
  // For mobile: require() images stored in assets/images/
  imageAsset?: number; // ReturnType<typeof require>
  // Fallback gradient colors if no image
  palette: ScenePalette;
  soundProfile: SoundProfile;
  particleType: 'clouds' | 'petals' | 'fireflies' | 'sea_sparkle' | 'rain' | 'balloons' | 'none';
  defaultTimeOfDay: 'sabah' | 'gun' | 'aksam' | 'gece';
}

export interface AppSettings {
  masterVolume: number;
  natureSoundEnabled: boolean;
  musicEnabled: boolean;
  breathingExerciseEnabled: boolean;
  autoCycleScenes: boolean;
  autoCycleIntervalMinutes: number;
  onlyWatchMode: boolean;
}

export type RootStackParamList = {
  Start: undefined;
  Main: undefined;
  Gallery: undefined;
  SoundMixer: undefined;
  Settings: undefined;
};
