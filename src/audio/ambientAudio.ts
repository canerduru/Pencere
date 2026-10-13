import { SoundMixerSettings, SoundProfile } from '../types';

class AmbientAudioManager {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private isMuted = false;
  private isPaused = false;
  private masterGain: GainNode | null = null;
  private natureGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // Base pink noise source
  private noiseNode: AudioBufferSourceNode | null = null;

  // Sound channels
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;

  private wavesFilter: BiquadFilterNode | null = null;
  private wavesGain: GainNode | null = null;
  private wavesLfo: OscillatorNode | null = null;

  private rainFilter: BiquadFilterNode | null = null;
  private rainGain: GainNode | null = null;

  private streamFilter: BiquadFilterNode | null = null;
  private streamGain: GainNode | null = null;
  private streamLfo: OscillatorNode | null = null;

  private fireplaceGain: GainNode | null = null;
  private fireplaceTimer: number | null = null;

  private thunderFilter: BiquadFilterNode | null = null;
  private thunderGain: GainNode | null = null;
  private thunderTimer: number | null = null;

  private cricketsFilter: BiquadFilterNode | null = null;
  private cricketsGain: GainNode | null = null;

  // Wind Chimes (Rüzgar Çanı)
  private chimesGain: GainNode | null = null;
  private chimesTimer: number | null = null;

  // Leaves Rustle (Yaprak Hışırtısı)
  private leavesFilter: BiquadFilterNode | null = null;
  private leavesGain: GainNode | null = null;
  private leavesLfo: OscillatorNode | null = null;

  // Coffee / Porcelain warmth (Sıcak Kahve Fısıltısı)
  private coffeeGain: GainNode | null = null;
  private coffeeTimer: number | null = null;

  // Tibetan Singing Bowl channel
  private bowlGain: GainNode | null = null;
  private bowlTimer: number | null = null;

  // Warm Ambient Pad
  private padOscillators: OscillatorNode[] = [];
  private padGainNode: GainNode | null = null;
  private padFilterNode: BiquadFilterNode | null = null;

  // Bird scheduler
  private birdTimer: number | null = null;
  private birdsGain: GainNode | null = null;

  // Active user levels
  private userVolume = 0.7;
  private natureEnabled = true;
  private musicEnabled = true;

  // Current levels
  private mixerLevels: SoundMixerSettings = {
    wind: 0.35,
    waves: 0.0,
    rain: 0.0,
    stream: 0.0,
    fireplace: 0.0,
    crickets: 0.05,
    birds: 0.5,
    thunder: 0.0,
    singingBowl: 0.0,
    windChimes: 0.0,
    leaves: 0.0,
    coffeeMurmur: 0.0,
    pad: 0.5,
    preset: 'manzara',
  };

  public async init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Nature sub-bus
    this.natureGain = this.ctx.createGain();
    this.natureGain.gain.setValueAtTime(this.natureEnabled ? 1.0 : 0.001, this.ctx.currentTime);
    this.natureGain.connect(this.masterGain);

    // Music sub-bus
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.8 : 0.001, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    // Continuous pink noise buffer (12s loop)
    const noiseBuffer = this.createPinkNoiseBuffer(12);
    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // 1. WIND (Rüzgar)
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(340, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(1.1, this.ctx.currentTime);
    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.natureGain);

    // 2. WAVES (Deniz Dalgaları)
    this.wavesFilter = this.ctx.createBiquadFilter();
    this.wavesFilter.type = 'lowpass';
    this.wavesFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
    this.wavesGain = this.ctx.createGain();
    this.wavesGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.wavesLfo = this.ctx.createOscillator();
    this.wavesLfo.frequency.setValueAtTime(0.11, this.ctx.currentTime); // ~9s swell
    const wavesLfoGain = this.ctx.createGain();
    wavesLfoGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    this.wavesLfo.connect(wavesLfoGain);
    wavesLfoGain.connect(this.wavesGain.gain);
    this.wavesLfo.start();

    this.wavesFilter.connect(this.wavesGain);
    this.wavesGain.connect(this.natureGain);

    // 3. RAIN (Yağmur)
    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = 'bandpass';
    this.rainFilter.frequency.setValueAtTime(1300, this.ctx.currentTime);
    this.rainFilter.Q.setValueAtTime(0.9, this.ctx.currentTime);
    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.natureGain);

    // 4. STREAM (Dere & Dağ Suyu)
    this.streamFilter = this.ctx.createBiquadFilter();
    this.streamFilter.type = 'bandpass';
    this.streamFilter.frequency.setValueAtTime(780, this.ctx.currentTime);
    this.streamFilter.Q.setValueAtTime(2.2, this.ctx.currentTime);
    this.streamGain = this.ctx.createGain();
    this.streamGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.streamLfo = this.ctx.createOscillator();
    this.streamLfo.frequency.setValueAtTime(1.6, this.ctx.currentTime); // babbling modulation
    const streamLfoGain = this.ctx.createGain();
    streamLfoGain.gain.setValueAtTime(160, this.ctx.currentTime);
    this.streamLfo.connect(streamLfoGain);
    streamLfoGain.connect(this.streamFilter.frequency);
    this.streamLfo.start();

    this.streamFilter.connect(this.streamGain);
    this.streamGain.connect(this.natureGain);

    // 5. FIREPLACE (Şömine & Çıtırdayan Odun)
    const fireBaseFilter = this.ctx.createBiquadFilter();
    fireBaseFilter.type = 'lowpass';
    fireBaseFilter.frequency.setValueAtTime(160, this.ctx.currentTime);
    this.fireplaceGain = this.ctx.createGain();
    this.fireplaceGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    fireBaseFilter.connect(this.fireplaceGain);
    this.fireplaceGain.connect(this.natureGain);

    // 6. THUNDER (Uzak Dingin Gök Gürültüsü)
    this.thunderFilter = this.ctx.createBiquadFilter();
    this.thunderFilter.type = 'lowpass';
    this.thunderFilter.frequency.setValueAtTime(65, this.ctx.currentTime);
    this.thunderGain = this.ctx.createGain();
    this.thunderGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.thunderFilter.connect(this.thunderGain);
    this.thunderGain.connect(this.natureGain);

    // 7. CRICKETS (Gece Cırcır Böcekleri)
    this.cricketsFilter = this.ctx.createBiquadFilter();
    this.cricketsFilter.type = 'bandpass';
    this.cricketsFilter.frequency.setValueAtTime(4600, this.ctx.currentTime);
    this.cricketsFilter.Q.setValueAtTime(3.2, this.ctx.currentTime);
    this.cricketsGain = this.ctx.createGain();
    this.cricketsGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.cricketsFilter.connect(this.cricketsGain);
    this.cricketsGain.connect(this.natureGain);

    // Connect noise to all filters
    this.noiseNode.connect(this.windFilter);
    this.noiseNode.connect(this.wavesFilter);
    this.noiseNode.connect(this.rainFilter);
    this.noiseNode.connect(this.streamFilter);
    this.noiseNode.connect(fireBaseFilter);
    this.noiseNode.connect(this.thunderFilter);
    this.noiseNode.connect(this.cricketsFilter);
    this.noiseNode.start();

    // 8. BIRDS SUB-BUS
    this.birdsGain = this.ctx.createGain();
    this.birdsGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.birdsGain.connect(this.natureGain);

    // 9. SINGING BOWL SUB-BUS
    this.bowlGain = this.ctx.createGain();
    this.bowlGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.bowlGain.connect(this.musicGain);

    // 10. WARM PAD
    this.padGainNode = this.ctx.createGain();
    this.padGainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
    this.padFilterNode = this.ctx.createBiquadFilter();
    this.padFilterNode.type = 'lowpass';
    this.padFilterNode.frequency.setValueAtTime(550, this.ctx.currentTime);
    this.padFilterNode.connect(this.padGainNode);
    this.padGainNode.connect(this.musicGain);

    // 11. LEAVES RUSTLE SUB-BUS
    this.leavesFilter = this.ctx.createBiquadFilter();
    this.leavesFilter.type = 'bandpass';
    this.leavesFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
    this.leavesFilter.Q.setValueAtTime(1.6, this.ctx.currentTime);
    this.leavesGain = this.ctx.createGain();
    this.leavesGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    this.leavesLfo = this.ctx.createOscillator();
    this.leavesLfo.type = 'sine';
    this.leavesLfo.frequency.setValueAtTime(0.35, this.ctx.currentTime);
    const leavesLfoGain = this.ctx.createGain();
    leavesLfoGain.gain.setValueAtTime(450, this.ctx.currentTime);
    this.leavesLfo.connect(leavesLfoGain);
    leavesLfoGain.connect(this.leavesFilter.frequency);
    this.leavesLfo.start();

    this.leavesFilter.connect(this.leavesGain);
    this.leavesGain.connect(this.natureGain);
    this.noiseNode.connect(this.leavesFilter);

    // 12. WIND CHIMES SUB-BUS
    this.chimesGain = this.ctx.createGain();
    this.chimesGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.chimesGain.connect(this.musicGain);

    // 13. COFFEE / PORCELAIN WARMTH SUB-BUS
    this.coffeeGain = this.ctx.createGain();
    this.coffeeGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.coffeeGain.connect(this.natureGain);

    this.isInitialized = true;

    // Fade in master smoothly over 3 seconds
    this.masterGain.gain.linearRampToValueAtTime(this.userVolume, this.ctx.currentTime + 3);

    // Start background autonomous sound events
    this.startBirdSchedule();
    this.startFireplaceCrackle();
    this.startThunderSchedule();
    this.startSingingBowlSchedule();
    this.startChimesSchedule();
    this.startCoffeeSchedule();
  }

  private createPinkNoiseBuffer(durationSeconds: number): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not ready');
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

  // Update mixer from user settings
  public updateMixer(settings: SoundMixerSettings) {
    this.mixerLevels = { ...settings };
    if (!this.ctx || !this.isInitialized) return;
    const now = this.ctx.currentTime;
    const ramp = 1.8;

    this.rampGain(this.windGain, settings.wind * 0.38, ramp);
    this.rampGain(this.wavesGain, settings.waves * 0.32, ramp);
    this.rampGain(this.rainGain, settings.rain * 0.38, ramp);
    this.rampGain(this.streamGain, settings.stream * 0.34, ramp);
    this.rampGain(this.fireplaceGain, settings.fireplace * 0.45, ramp);
    this.rampGain(this.cricketsGain, settings.crickets * 0.09, ramp);
    this.rampGain(this.birdsGain, settings.birds, ramp);
    this.rampGain(this.thunderGain, settings.thunder * 0.45, ramp);
    this.rampGain(this.bowlGain, settings.singingBowl * 0.4, ramp);
    this.rampGain(this.chimesGain, (settings.windChimes || 0) * 0.42, ramp);
    this.rampGain(this.leavesGain, (settings.leaves || 0) * 0.36, ramp);
    this.rampGain(this.coffeeGain, (settings.coffeeMurmur || 0) * 0.36, ramp);
    this.rampGain(this.padGainNode, settings.pad * 0.28, ramp);
  }

  // Update scene default audio
  public updateScene(profile: SoundProfile) {
    if (this.mixerLevels.preset !== 'manzara') return;
    if (!this.ctx || !this.isInitialized) return;

    this.mixerLevels.wind = profile.windLevel;
    this.mixerLevels.rain = profile.rainLevel;
    this.mixerLevels.birds = profile.birdsLevel;
    this.mixerLevels.waves = profile.seaWavesLevel;
    this.mixerLevels.crickets = profile.cricketsLevel;

    this.updateMixer(this.mixerLevels);
    this.setupWarmPad(profile.padBaseFreq, profile.padChord, profile.toneBrightness);
  }

  private rampGain(gainNode: GainNode | null, targetVal: number, duration: number) {
    if (!this.ctx || !gainNode) return;
    const now = this.ctx.currentTime;
    const safeTarget = Math.max(0.0001, targetVal);
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(safeTarget, now + duration);
  }

  // Realistic Fireplace Pops & Warm Crackle
  private startFireplaceCrackle() {
    if (this.fireplaceTimer) clearTimeout(this.fireplaceTimer);

    const step = () => {
      // Small randomized bursts every 80-250ms
      const delay = 80 + Math.random() * 200;
      this.fireplaceTimer = window.setTimeout(() => {
        if (!this.isPaused && !this.isMuted && this.natureEnabled && this.mixerLevels.fireplace > 0.05) {
          this.triggerFireCracklePop();
        }
        step();
      }, delay);
    };

    step();
  }

  public triggerFireCracklePop() {
    if (!this.ctx || !this.fireplaceGain) return;
    const now = this.ctx.currentTime;

    // Highpass click
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400 + Math.random() * 2400, now);

    const popGain = this.ctx.createGain();
    const vol = (0.005 + Math.random() * 0.02) * this.mixerLevels.fireplace;
    popGain.gain.setValueAtTime(vol, now);
    popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(popGain);
    popGain.connect(this.fireplaceGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Soft Distant Thunder Rumble
  private startThunderSchedule() {
    if (this.thunderTimer) clearTimeout(this.thunderTimer);

    const step = () => {
      const delay = 14000 + Math.random() * 20000;
      this.thunderTimer = window.setTimeout(() => {
        if (!this.isPaused && !this.isMuted && this.natureEnabled && this.mixerLevels.thunder > 0.05) {
          this.triggerDistantThunder();
        }
        step();
      }, delay);
    };

    step();
  }

  public triggerDistantThunder() {
    if (!this.ctx || !this.thunderGain) return;
    const now = this.ctx.currentTime;

    // Gentle sub-bass rumble swell (50Hz - 85Hz)
    const rumbleOsc = this.ctx.createOscillator();
    rumbleOsc.type = 'sine';
    rumbleOsc.frequency.setValueAtTime(52, now);
    rumbleOsc.frequency.linearRampToValueAtTime(42, now + 3.5);

    const rumbleGain = this.ctx.createGain();
    const peak = 0.08 * this.mixerLevels.thunder;
    rumbleGain.gain.setValueAtTime(0.0001, now);
    rumbleGain.gain.linearRampToValueAtTime(peak, now + 1.2);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(this.thunderGain);

    rumbleOsc.start(now);
    rumbleOsc.stop(now + 4.6);
  }

  // Tibetan Singing Bowl (432Hz Bell Tone)
  private startSingingBowlSchedule() {
    if (this.bowlTimer) clearTimeout(this.bowlTimer);

    const step = () => {
      const delay = 18000 + Math.random() * 22000;
      this.bowlTimer = window.setTimeout(() => {
        if (!this.isPaused && !this.isMuted && this.musicEnabled && this.mixerLevels.singingBowl > 0.05) {
          this.strikeSingingBowl();
        }
        step();
      }, delay);
    };

    step();
  }

  public strikeSingingBowl(freq = 432) {
    if (!this.ctx || !this.bowlGain) return;
    const now = this.ctx.currentTime;

    // Fundamental (432Hz)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Harmonic Overtone (2.75x)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.75, now);

    const strikeGain = this.ctx.createGain();
    const peak = 0.07 * this.mixerLevels.singingBowl;
    strikeGain.gain.setValueAtTime(0.0001, now);
    strikeGain.gain.linearRampToValueAtTime(peak, now + 0.12);
    strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 8.5);

    osc1.connect(strikeGain);
    osc2.connect(strikeGain);
    strikeGain.connect(this.bowlGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 8.6);
    osc2.stop(now + 8.6);
  }

  // Birdsong
  private startBirdSchedule() {
    if (this.birdTimer) clearTimeout(this.birdTimer);

    const step = () => {
      const delay = 6000 + Math.random() * 9000;
      this.birdTimer = window.setTimeout(() => {
        if (!this.isPaused && !this.isMuted && this.natureEnabled && this.mixerLevels.birds > 0.05) {
          this.triggerSoftBirdChirp();
        }
        step();
      }, delay);
    };

    step();
  }

  public triggerSoftBirdChirp() {
    if (!this.ctx || !this.birdsGain) return;
    const now = this.ctx.currentTime;

    const baseFreq = 2200 + Math.random() * 950;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';

    const chirpGain = this.ctx.createGain();
    const peak = 0.02 * this.mixerLevels.birds;
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

  public triggerGentleWaterRipple() {
    if (!this.ctx || !this.natureGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.natureGain);
    osc.start(now);
    osc.stop(now + 0.65);
  }

  // Wind Chimes (Rüzgar Çanı - Pentatonic C major / A minor chimes)
  private startChimesSchedule() {
    if (this.chimesTimer) clearTimeout(this.chimesTimer);

    const step = () => {
      // Gentle chime clusters every 7-14s
      const delay = 7000 + Math.random() * 7000;
      this.chimesTimer = window.setTimeout(() => {
        if (!this.isPaused && !this.isMuted && this.musicEnabled && (this.mixerLevels.windChimes || 0) > 0.05) {
          // Play 1 to 3 soft successive chime tones
          const count = 1 + Math.floor(Math.random() * 3);
          for (let i = 0; i < count; i++) {
            setTimeout(() => {
              this.triggerWindChimeStrike();
            }, i * (160 + Math.random() * 260));
          }
        }
        step();
      }, delay);
    };

    step();
  }

  public triggerWindChimeStrike(freqOverride?: number) {
    if (!this.ctx || !this.chimesGain) return;
    const now = this.ctx.currentTime;
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66];
    const freq = freqOverride || pentatonic[Math.floor(Math.random() * pentatonic.length)];

    // Fundamental tone
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Overtone harmonic
    const overtone = this.ctx.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2.76, now);

    const chimeEnv = this.ctx.createGain();
    const peak = 0.025 * (this.mixerLevels.windChimes || 0.5);
    chimeEnv.gain.setValueAtTime(0.0001, now);
    chimeEnv.gain.linearRampToValueAtTime(peak, now + 0.015);
    chimeEnv.gain.exponentialRampToValueAtTime(0.00001, now + 2.8);

    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.setValueAtTime(peak * 0.2, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.00001, now + 1.2);

    osc.connect(chimeEnv);
    overtone.connect(overtoneGain);
    overtoneGain.connect(chimeEnv);
    chimeEnv.connect(this.chimesGain);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 2.9);
    overtone.stop(now + 2.9);
  }

  // Coffee / Porcelain Hot Cup Warmth
  private startCoffeeSchedule() {
    if (this.coffeeTimer) clearTimeout(this.coffeeTimer);

    const step = () => {
      const delay = 9000 + Math.random() * 12000;
      this.coffeeTimer = window.setTimeout(() => {
        if (!this.isPaused && !this.isMuted && this.natureEnabled && (this.mixerLevels.coffeeMurmur || 0) > 0.05) {
          this.triggerPorcelainClink();
        }
        step();
      }, delay);
    };

    step();
  }

  public triggerPorcelainClink() {
    if (!this.ctx || !this.coffeeGain) return;
    const now = this.ctx.currentTime;

    // Gentle porcelain ceramic tap/clink
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760 + Math.random() * 200, now);

    const clinkGain = this.ctx.createGain();
    const peak = 0.012 * (this.mixerLevels.coffeeMurmur || 0.5);
    clinkGain.gain.setValueAtTime(peak, now);
    clinkGain.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);

    osc.connect(clinkGain);
    clinkGain.connect(this.coffeeGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  private setupWarmPad(baseFreq: number, chordRatios: number[], brightness: number) {
    if (!this.ctx || !this.padFilterNode) return;
    const now = this.ctx.currentTime;

    const cutoff = 250 + brightness * 500;
    this.padFilterNode.frequency.linearRampToValueAtTime(cutoff, now + 2);

    const oldOscs = [...this.padOscillators];
    this.padOscillators = [];

    oldOscs.forEach((osc) => {
      try {
        osc.stop(now + 2);
      } catch {
        // ignore
      }
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

  public setVolume(vol: number) {
    this.userVolume = Math.max(0, Math.min(1, vol));
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const target = this.isMuted || this.isPaused ? 0.001 : this.userVolume;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(target, now + 0.2);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolume(this.userVolume);
    return this.isMuted;
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    this.setVolume(this.userVolume);
  }

  public setNatureEnabled(enabled: boolean) {
    this.natureEnabled = enabled;
    if (!this.ctx || !this.natureGain) return;
    const now = this.ctx.currentTime;
    this.natureGain.gain.linearRampToValueAtTime(enabled ? 1.0 : 0.001, now + 0.5);
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.linearRampToValueAtTime(enabled ? 0.8 : 0.001, now + 0.5);
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

export const ambientAudio = new AmbientAudioManager();
