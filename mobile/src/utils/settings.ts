import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

const SETTINGS_KEY = '@pencere_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  masterVolume: 0.7,
  natureSoundEnabled: true,
  musicEnabled: true,
  breathingExerciseEnabled: false,
  autoCycleScenes: false,
  autoCycleIntervalMinutes: 3,
  onlyWatchMode: false,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    }
  } catch (_) {}
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (_) {}
}
