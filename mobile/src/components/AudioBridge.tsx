import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { SoundProfile } from '../types';

interface AudioBridgeProps {
  soundProfile: SoundProfile;
  isPaused: boolean;
  isMuted: boolean;
  volume?: number;
  natureEnabled?: boolean;
  musicEnabled?: boolean;
}

const AUDIO_SYNTH_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background:transparent;">
  <script>
    class AmbientAudioManager {
      constructor() {
        this.ctx = null;
        this.isInitialized = false;
        this.isMuted = false;
        this.isPaused = false;
        this.userVolume = 0.75;
        this.natureEnabled = true;
        this.musicEnabled = true;

        this.masterGain = null;
        this.natureGain = null;
        this.musicGain = null;
        this.noiseNode = null;

        this.windFilter = null;
        this.windGain = null;
        this.wavesFilter = null;
        this.wavesGain = null;
        this.wavesLfo = null;
        this.rainFilter = null;
        this.rainGain = null;
        this.streamFilter = null;
        this.streamGain = null;
        this.streamLfo = null;
        this.fireplaceGain = null;
        this.fireplaceTimer = null;
        this.thunderFilter = null;
        this.thunderGain = null;
        this.thunderTimer = null;
        this.cricketsFilter = null;
        this.cricketsGain = null;
        this.birdsGain = null;
        this.birdTimer = null;
        this.chimesGain = null;
        this.chimesTimer = null;
        this.coffeeGain = null;
        this.coffeeTimer = null;
        this.bowlGain = null;
        this.bowlTimer = null;

        this.padOscillators = [];
        this.padGainNode = null;
        this.padFilterNode = null;

        this.currentProfile = null;
      }

      async init() {
        if (this.isInitialized && this.ctx) {
          if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
          }
          return;
        }

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();

        if (this.ctx.state === 'suspended') {
          await this.ctx.resume();
        }

        // Master
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Nature bus
        this.natureGain = this.ctx.createGain();
        this.natureGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.natureGain.connect(this.masterGain);

        // Music bus
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        // Pink noise buffer
        const noiseBuffer = this.createPinkNoiseBuffer(10);
        this.noiseNode = this.ctx.createBufferSource();
        this.noiseNode.buffer = noiseBuffer;
        this.noiseNode.loop = true;

        // 1. Wind
        this.windFilter = this.ctx.createBiquadFilter();
        this.windFilter.type = 'bandpass';
        this.windFilter.frequency.setValueAtTime(340, this.ctx.currentTime);
        this.windFilter.Q.setValueAtTime(1.1, this.ctx.currentTime);
        this.windGain = this.ctx.createGain();
        this.windGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        this.windFilter.connect(this.windGain);
        this.windGain.connect(this.natureGain);

        // 2. Waves
        this.wavesFilter = this.ctx.createBiquadFilter();
        this.wavesFilter.type = 'lowpass';
        this.wavesFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
        this.wavesGain = this.ctx.createGain();
        this.wavesGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

        this.wavesLfo = this.ctx.createOscillator();
        this.wavesLfo.frequency.setValueAtTime(0.11, this.ctx.currentTime);
        const wavesLfoGain = this.ctx.createGain();
        wavesLfoGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        this.wavesLfo.connect(wavesLfoGain);
        wavesLfoGain.connect(this.wavesGain.gain);
        this.wavesLfo.start();

        this.wavesFilter.connect(this.wavesGain);
        this.wavesGain.connect(this.natureGain);

        // 3. Rain
        this.rainFilter = this.ctx.createBiquadFilter();
        this.rainFilter.type = 'bandpass';
        this.rainFilter.frequency.setValueAtTime(1300, this.ctx.currentTime);
        this.rainFilter.Q.setValueAtTime(0.9, this.ctx.currentTime);
        this.rainGain = this.ctx.createGain();
        this.rainGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.rainFilter.connect(this.rainGain);
        this.rainGain.connect(this.natureGain);

        // 4. Stream
        this.streamFilter = this.ctx.createBiquadFilter();
        this.streamFilter.type = 'bandpass';
        this.streamFilter.frequency.setValueAtTime(780, this.ctx.currentTime);
        this.streamFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);
        this.streamGain = this.ctx.createGain();
        this.streamGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

        this.streamLfo = this.ctx.createOscillator();
        this.streamLfo.frequency.setValueAtTime(1.6, this.ctx.currentTime);
        const streamLfoGain = this.ctx.createGain();
        streamLfoGain.gain.setValueAtTime(160, this.ctx.currentTime);
        this.streamLfo.connect(streamLfoGain);
        streamLfoGain.connect(this.streamFilter.frequency);
        this.streamLfo.start();

        this.streamFilter.connect(this.streamGain);
        this.streamGain.connect(this.natureGain);

        // 5. Fireplace
        const fireBaseFilter = this.ctx.createBiquadFilter();
        fireBaseFilter.type = 'lowpass';
        fireBaseFilter.frequency.setValueAtTime(160, this.ctx.currentTime);
        this.fireplaceGain = this.ctx.createGain();
        this.fireplaceGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        fireBaseFilter.connect(this.fireplaceGain);
        this.fireplaceGain.connect(this.natureGain);

        // 6. Thunder
        this.thunderFilter = this.ctx.createBiquadFilter();
        this.thunderFilter.type = 'lowpass';
        this.thunderFilter.frequency.setValueAtTime(65, this.ctx.currentTime);
        this.thunderGain = this.ctx.createGain();
        this.thunderGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.thunderFilter.connect(this.thunderGain);
        this.thunderGain.connect(this.natureGain);

        // 7. Crickets
        this.cricketsFilter = this.ctx.createBiquadFilter();
        this.cricketsFilter.type = 'bandpass';
        this.cricketsFilter.frequency.setValueAtTime(4600, this.ctx.currentTime);
        this.cricketsFilter.Q.setValueAtTime(3.2, this.ctx.currentTime);
        this.cricketsGain = this.ctx.createGain();
        this.cricketsGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.cricketsFilter.connect(this.cricketsGain);
        this.cricketsGain.connect(this.natureGain);

        // Connect noise
        this.noiseNode.connect(this.windFilter);
        this.noiseNode.connect(this.wavesFilter);
        this.noiseNode.connect(this.rainFilter);
        this.noiseNode.connect(this.streamFilter);
        this.noiseNode.connect(fireBaseFilter);
        this.noiseNode.connect(this.thunderFilter);
        this.noiseNode.connect(this.cricketsFilter);
        this.noiseNode.start();

        // Birds
        this.birdsGain = this.ctx.createGain();
        this.birdsGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        this.birdsGain.connect(this.natureGain);

        // Singing bowl
        this.bowlGain = this.ctx.createGain();
        this.bowlGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.bowlGain.connect(this.musicGain);

        // Warm pad
        this.padGainNode = this.ctx.createGain();
        this.padGainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
        this.padFilterNode = this.ctx.createBiquadFilter();
        this.padFilterNode.type = 'lowpass';
        this.padFilterNode.frequency.setValueAtTime(550, this.ctx.currentTime);
        this.padFilterNode.connect(this.padGainNode);
        this.padGainNode.connect(this.musicGain);

        // Chimes
        this.chimesGain = this.ctx.createGain();
        this.chimesGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.chimesGain.connect(this.musicGain);

        // Coffee clinks
        this.coffeeGain = this.ctx.createGain();
        this.coffeeGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        this.coffeeGain.connect(this.natureGain);

        this.isInitialized = true;

        this.applyBuses();

        // Fade in master
        this.masterGain.gain.linearRampToValueAtTime(this.userVolume, this.ctx.currentTime + 2.5);

        // Event loops
        this.startBirdSchedule();
        this.startChimesSchedule();
        this.startSingingBowlSchedule();

        if (this.currentProfile) {
          this.updateScene(this.currentProfile);
        }
      }

      createPinkNoiseBuffer(durationSeconds) {
        const sampleRate = this.ctx.sampleRate;
        const bufferSize = sampleRate * durationSeconds;
        const buffer = this.ctx.createBuffer(2, bufferSize, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
          const output = buffer.getChannelData(channel);
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
            b6 = white * 0.115926;
          }
        }
        return buffer;
      }

      rampGain(gainNode, targetVal, duration) {
        if (!this.ctx || !gainNode) return;
        const now = this.ctx.currentTime;
        const safeTarget = Math.max(0.0001, targetVal);
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(safeTarget, now + duration);
      }

      updateScene(profile) {
        this.currentProfile = profile;
        if (!this.ctx || !this.isInitialized) return;

        const ramp = 2.0;
        this.rampGain(this.windGain, (profile.windLevel || 0.2) * 0.38, ramp);
        this.rampGain(this.rainGain, (profile.rainLevel || 0.0) * 0.38, ramp);
        this.rampGain(this.birdsGain, (profile.birdsLevel || 0.3) * 0.5, ramp);
        this.rampGain(this.wavesGain, (profile.seaWavesLevel || 0.0) * 0.35, ramp);
        this.rampGain(this.cricketsGain, (profile.cricketsLevel || 0.0) * 0.1, ramp);

        if (profile.padBaseFreq && profile.padChord) {
          this.setupWarmPad(profile.padBaseFreq, profile.padChord, profile.toneBrightness || 0.5);
        }
      }

      setupWarmPad(baseFreq, chordRatios, brightness) {
        if (!this.ctx || !this.padFilterNode) return;
        const now = this.ctx.currentTime;

        const cutoff = 250 + brightness * 500;
        this.padFilterNode.frequency.linearRampToValueAtTime(cutoff, now + 2);

        const oldOscs = [...this.padOscillators];
        this.padOscillators = [];

        oldOscs.forEach((osc) => {
          try { osc.stop(now + 2); } catch(e) {}
        });

        chordRatios.forEach((ratio, index) => {
          if (!this.ctx || !this.padFilterNode) return;
          const freq = baseFreq * ratio;

          const osc1 = this.ctx.createOscillator();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(freq, now);
          osc1.detune.setValueAtTime(index % 2 === 0 ? 3 : -3, now);

          const osc2 = this.ctx.createOscillator();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(freq, now);
          osc2.detune.setValueAtTime(index % 2 === 0 ? -4 : 4, now);

          const voiceGain = this.ctx.createGain();
          voiceGain.gain.setValueAtTime(0.001, now);
          voiceGain.gain.linearRampToValueAtTime(0.035, now + 2.5);

          osc1.connect(voiceGain);
          osc2.connect(voiceGain);
          voiceGain.connect(this.padFilterNode);

          osc1.start(now);
          osc2.start(now);

          this.padOscillators.push(osc1, osc2);
        });
      }

      startBirdSchedule() {
        if (this.birdTimer) clearTimeout(this.birdTimer);
        const step = () => {
          const delay = 5000 + Math.random() * 8000;
          this.birdTimer = setTimeout(() => {
            if (!this.isPaused && !this.isMuted && this.currentProfile && this.currentProfile.birdsLevel > 0.05) {
              this.triggerSoftBirdChirp();
            }
            step();
          }, delay);
        };
        step();
      }

      triggerSoftBirdChirp() {
        if (!this.ctx || !this.birdsGain) return;
        const now = this.ctx.currentTime;
        const baseFreq = 2200 + Math.random() * 950;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';

        const chirpGain = this.ctx.createGain();
        const peak = 0.025 * (this.currentProfile ? this.currentProfile.birdsLevel : 0.5);
        chirpGain.gain.setValueAtTime(0.0001, now);

        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, now + 0.16);

        chirpGain.gain.linearRampToValueAtTime(peak, now + 0.04);
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        osc.connect(chirpGain);
        chirpGain.connect(this.birdsGain);

        osc.start(now);
        osc.stop(now + 0.3);
      }

      startChimesSchedule() {
        if (this.chimesTimer) clearTimeout(this.chimesTimer);
        const step = () => {
          const delay = 8000 + Math.random() * 12000;
          this.chimesTimer = setTimeout(() => {
            if (!this.isPaused && !this.isMuted) {
              this.triggerWindChimeStrike();
            }
            step();
          }, delay);
        };
        step();
      }

      triggerWindChimeStrike() {
        if (!this.ctx || !this.chimesGain) return;
        const now = this.ctx.currentTime;
        const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
        const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const chimeEnv = this.ctx.createGain();
        chimeEnv.gain.setValueAtTime(0.0001, now);
        chimeEnv.gain.linearRampToValueAtTime(0.015, now + 0.015);
        chimeEnv.gain.exponentialRampToValueAtTime(0.00001, now + 2.5);

        osc.connect(chimeEnv);
        chimeEnv.connect(this.chimesGain);

        osc.start(now);
        osc.stop(now + 2.6);
      }

      startSingingBowlSchedule() {
        if (this.bowlTimer) clearTimeout(this.bowlTimer);
        const step = () => {
          const delay = 16000 + Math.random() * 20000;
          this.bowlTimer = setTimeout(() => {
            if (!this.isPaused && !this.isMuted) {
              this.strikeSingingBowl();
            }
            step();
          }, delay);
        };
        step();
      }

      strikeSingingBowl(freq = 432) {
        if (!this.ctx || !this.bowlGain) return;
        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2.75, now);

        const strikeGain = this.ctx.createGain();
        strikeGain.gain.setValueAtTime(0.0001, now);
        strikeGain.gain.linearRampToValueAtTime(0.035, now + 0.12);
        strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 8.0);

        osc1.connect(strikeGain);
        osc2.connect(strikeGain);
        strikeGain.connect(this.bowlGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 8.1);
        osc2.stop(now + 8.1);
      }

      setPaused(paused) {
        this.isPaused = paused;
        this.applyVolume();
      }

      setMuted(muted) {
        this.isMuted = muted;
        this.applyVolume();
      }

      setVolume(vol) {
        this.userVolume = Math.max(0, Math.min(1, vol));
        this.applyVolume();
      }

      setNatureEnabled(enabled) {
        this.natureEnabled = enabled;
        this.applyBuses();
      }

      setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        this.applyBuses();
      }

      applyBuses() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        if (this.natureGain) {
          this.natureGain.gain.cancelScheduledValues(now);
          this.natureGain.gain.linearRampToValueAtTime(this.natureEnabled ? 1.0 : 0.0001, now + 0.25);
        }
        if (this.musicGain) {
          this.musicGain.gain.cancelScheduledValues(now);
          this.musicGain.gain.linearRampToValueAtTime(this.musicEnabled ? 0.85 : 0.0001, now + 0.25);
        }
      }

      applyVolume() {
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const target = this.isMuted || this.isPaused ? 0.0001 : this.userVolume;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(target, now + 0.25);
      }
    }

    const manager = new AmbientAudioManager();

    // Auto-init on click or touch
    function tryInit() {
      manager.init();
    }
    window.addEventListener('click', tryInit);
    window.addEventListener('touchstart', tryInit);

    // Message handler from React Native
    function handleMessage(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'init') {
          manager.init();
        } else if (data.type === 'updateScene') {
          manager.init();
          if (data.profile) manager.updateScene(data.profile);
          if (data.isPaused !== undefined) manager.setPaused(data.isPaused);
          if (data.isMuted !== undefined) manager.setMuted(data.isMuted);
          if (data.volume !== undefined) manager.setVolume(data.volume);
          if (data.natureEnabled !== undefined) manager.setNatureEnabled(data.natureEnabled);
          if (data.musicEnabled !== undefined) manager.setMusicEnabled(data.musicEnabled);
        } else if (data.type === 'setPaused') {
          manager.setPaused(data.isPaused);
        } else if (data.type === 'setMuted') {
          manager.setMuted(data.isMuted);
        }
      } catch (e) {
        console.error(e);
      }
    }

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage);

    // Initial trigger
    setTimeout(() => {
      manager.init();
    }, 100);
  </script>
</body>
</html>
`;

export function AudioBridge({
  soundProfile,
  isPaused,
  isMuted,
  volume = 0.75,
  natureEnabled = true,
  musicEnabled = true,
}: AudioBridgeProps) {
  const webViewRef = useRef<WebView>(null);

  // Send updates to the Web Audio engine in the WebView
  useEffect(() => {
    if (!webViewRef.current) return;
    const msg = JSON.stringify({
      type: 'updateScene',
      profile: soundProfile,
      isPaused,
      isMuted,
      volume,
      natureEnabled,
      musicEnabled,
    });
    webViewRef.current.postMessage(msg);
  }, [soundProfile, isPaused, isMuted, volume, natureEnabled, musicEnabled]);

  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: AUDIO_SYNTH_HTML }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onLoadEnd={() => {
          if (webViewRef.current) {
            webViewRef.current.postMessage(
              JSON.stringify({
                type: 'updateScene',
                profile: soundProfile,
                isPaused,
                isMuted,
                volume,
                natureEnabled,
                musicEnabled,
              })
            );
          }
        }}
        style={styles.hiddenWebView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenContainer: {
    width: 0,
    height: 0,
    position: 'absolute',
    opacity: 0,
  },
  hiddenWebView: {
    width: 1,
    height: 1,
  },
});
