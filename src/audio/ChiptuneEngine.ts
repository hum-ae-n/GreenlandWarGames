// Chiptune Music Engine using Web Audio API
// Generates AMIGA-style music dynamically based on game tension

type TensionMood = 'peaceful' | 'tense' | 'crisis' | 'combat' | 'menu' | 'victory' | 'defeat';

// Musical notes (A4 = 440Hz)
const NOTES: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  REST: 0,
};

// Chord progressions for different moods
const PROGRESSIONS: Record<TensionMood, string[][]> = {
  peaceful: [
    ['C4', 'E4', 'G4'], // C major
    ['A3', 'C4', 'E4'], // A minor
    ['F3', 'A3', 'C4'], // F major
    ['G3', 'B3', 'D4'], // G major
  ],
  tense: [
    ['A3', 'C4', 'E4'], // A minor
    ['E3', 'G3', 'B3'], // E minor
    ['D3', 'F3', 'A3'], // D minor
    ['A3', 'C4', 'E4'], // A minor
  ],
  crisis: [
    ['E3', 'G3', 'B3'],  // E minor
    ['F3', 'A3', 'C4'],  // F major (tension)
    ['E3', 'G3', 'B3'],  // E minor
    ['D3', 'F3', 'A3'],  // D minor
  ],
  combat: [
    ['E3', 'G3', 'B3'],  // E minor
    ['E3', 'G3', 'B3'],  // E minor (repeated for urgency)
    ['D3', 'F3', 'A3'],  // D minor
    ['E3', 'G3', 'B3'],  // E minor
  ],
  menu: [
    ['C4', 'E4', 'G4'],  // C major - majestic
    ['G3', 'B3', 'D4'],  // G major
    ['A3', 'C4', 'E4'],  // A minor - mysterious
    ['F3', 'A3', 'C4'],  // F major - hopeful
  ],
  victory: [
    ['C4', 'E4', 'G4'],  // C major - triumphant
    ['G3', 'B3', 'D4'],  // G major
    ['C4', 'E4', 'G4'],  // C major
    ['F3', 'A3', 'C4'],  // F major - celebratory
  ],
  defeat: [
    ['A3', 'C4', 'E4'],  // A minor - somber
    ['D3', 'F3', 'A3'],  // D minor
    ['E3', 'G3', 'B3'],  // E minor
    ['A3', 'C4', 'E4'],  // A minor
  ],
};

// Melodic patterns for each mood
const MELODIES: Record<TensionMood, string[]> = {
  peaceful: ['E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'C4', 'D4', 'E4', 'REST', 'G4', 'E4', 'D4', 'C4', 'D4', 'E4'],
  tense: ['A4', 'REST', 'E4', 'REST', 'A4', 'G4', 'E4', 'REST', 'A4', 'REST', 'B4', 'A4', 'G4', 'E4', 'REST', 'REST'],
  crisis: ['E4', 'E4', 'E4', 'REST', 'E4', 'E4', 'F4', 'E4', 'D4', 'REST', 'E4', 'E4', 'E4', 'F4', 'G4', 'REST'],
  combat: ['E4', 'E4', 'E5', 'E4', 'E4', 'E5', 'D5', 'E5', 'E4', 'E4', 'E5', 'E4', 'G4', 'E5', 'D5', 'C5'],
  menu: ['G4', 'REST', 'C5', 'B4', 'A4', 'G4', 'REST', 'E4', 'F4', 'G4', 'A4', 'REST', 'G4', 'F4', 'E4', 'D4'],
  victory: ['C5', 'E5', 'G5', 'E5', 'C5', 'G4', 'C5', 'E5', 'G5', 'REST', 'G5', 'A5', 'G5', 'E5', 'C5', 'REST'],
  defeat: ['A4', 'REST', 'E4', 'REST', 'A4', 'REST', 'E4', 'REST', 'D4', 'REST', 'A3', 'REST', 'E4', 'REST', 'A3', 'REST'],
};

// Bass patterns
const BASS_PATTERNS: Record<TensionMood, string[]> = {
  peaceful: ['C3', 'REST', 'C3', 'REST', 'A2', 'REST', 'A2', 'REST', 'F2', 'REST', 'F2', 'REST', 'G2', 'REST', 'G2', 'REST'],
  tense: ['A2', 'REST', 'A2', 'A2', 'E2', 'REST', 'E2', 'E2', 'D2', 'REST', 'D2', 'D2', 'A2', 'REST', 'A2', 'A2'],
  crisis: ['E2', 'E2', 'REST', 'E2', 'F2', 'F2', 'REST', 'F2', 'E2', 'E2', 'REST', 'E2', 'D2', 'D2', 'REST', 'D2'],
  combat: ['E2', 'E2', 'E2', 'E2', 'E2', 'E2', 'E2', 'E2', 'D2', 'D2', 'D2', 'D2', 'E2', 'E2', 'E2', 'E2'],
  menu: ['C2', 'REST', 'G2', 'REST', 'C2', 'REST', 'G2', 'REST', 'A2', 'REST', 'E2', 'REST', 'F2', 'REST', 'G2', 'REST'],
  victory: ['C2', 'C2', 'G2', 'G2', 'C2', 'C2', 'G2', 'G2', 'C2', 'C2', 'F2', 'F2', 'G2', 'G2', 'C2', 'C2'],
  defeat: ['A2', 'REST', 'REST', 'REST', 'D2', 'REST', 'REST', 'REST', 'E2', 'REST', 'REST', 'REST', 'A2', 'REST', 'REST', 'REST'],
};

// Add lower octave notes
const NOTES_EXTENDED: Record<string, number> = {
  ...NOTES,
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
};

export class ChiptuneEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentMood: TensionMood = 'peaceful';
  private bpm = 120;
  private beatIndex = 0;
  private scheduledTime = 0;
  private lookahead = 0.1; // seconds
  private scheduleInterval: number | null = null;

  constructor() {
    // Audio context will be created on first user interaction
  }

  private initAudio(): boolean {
    if (this.audioContext) return true;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3;
      return true;
    } catch (e) {
      console.warn('Web Audio API not supported');
      return false;
    }
  }

  // Create a simple square wave oscillator (classic chiptune sound)
  private playNote(
    frequency: number,
    startTime: number,
    duration: number,
    volume: number = 0.3,
    type: OscillatorType = 'square'
  ): void {
    if (!this.audioContext || !this.masterGain || frequency === 0) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // ADSR envelope for more musical sound
    const attackTime = 0.01;
    const decayTime = 0.05;
    const sustainLevel = volume * 0.7;
    const releaseTime = 0.1;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel, startTime + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  // Play arpeggio (classic chiptune technique)
  private playArpeggio(
    notes: string[],
    startTime: number,
    totalDuration: number,
    volume: number = 0.2
  ): void {
    const noteDuration = totalDuration / notes.length;
    notes.forEach((note, i) => {
      const freq = NOTES[note] || NOTES_EXTENDED[note];
      if (freq) {
        this.playNote(freq, startTime + i * noteDuration, noteDuration * 0.9, volume, 'square');
      }
    });
  }

  // Play drum-like percussion using noise
  private playDrum(startTime: number, type: 'kick' | 'snare' | 'hihat'): void {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    if (type === 'kick') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(150, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, startTime + 0.1);
      gainNode.gain.setValueAtTime(0.5, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    } else if (type === 'snare' || type === 'hihat') {
      // Create noise
      const bufferSize = this.audioContext.sampleRate * 0.1;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;

      const filter = this.audioContext.createBiquadFilter();
      filter.type = type === 'hihat' ? 'highpass' : 'bandpass';
      filter.frequency.value = type === 'hihat' ? 8000 : 3000;

      const vol = type === 'hihat' ? 0.1 : 0.3;
      const dur = type === 'hihat' ? 0.05 : 0.1;

      gainNode.gain.setValueAtTime(vol, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + dur);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);
      noise.start(startTime);
      noise.stop(startTime + dur);
    }
  }

  private scheduleNextBeat(): void {
    if (!this.audioContext || !this.isPlaying) return;

    const currentTime = this.audioContext.currentTime;
    const beatDuration = 60 / this.bpm / 4; // 16th notes

    while (this.scheduledTime < currentTime + this.lookahead) {
      const beatInBar = this.beatIndex % 16;
      const barIndex = Math.floor(this.beatIndex / 16) % 4;

      // Get current patterns
      const melody = MELODIES[this.currentMood];
      const bass = BASS_PATTERNS[this.currentMood];
      const chord = PROGRESSIONS[this.currentMood][barIndex];

      // Play melody
      const melodyNote = melody[beatInBar];
      if (melodyNote && melodyNote !== 'REST') {
        const freq = NOTES[melodyNote];
        if (freq) {
          this.playNote(freq, this.scheduledTime, beatDuration * 0.9, 0.2, 'square');
        }
      }

      // Play bass (on every beat)
      if (beatInBar % 2 === 0) {
        const bassNote = bass[beatInBar];
        if (bassNote && bassNote !== 'REST') {
          const freq = NOTES_EXTENDED[bassNote];
          if (freq) {
            this.playNote(freq, this.scheduledTime, beatDuration * 1.5, 0.25, 'triangle');
          }
        }
      }

      // Play chord arpeggio on beats 0 and 8
      if (beatInBar === 0 || beatInBar === 8) {
        this.playArpeggio(chord, this.scheduledTime, beatDuration * 2, 0.15);
      }

      // Drums - pattern varies by mood
      if (this.currentMood === 'combat') {
        // Fast drums for combat
        if (beatInBar % 2 === 0) this.playDrum(this.scheduledTime, 'kick');
        if (beatInBar % 4 === 2) this.playDrum(this.scheduledTime, 'snare');
        if (beatInBar % 2 === 1) this.playDrum(this.scheduledTime, 'hihat');
      } else if (this.currentMood === 'crisis') {
        // Tense drums
        if (beatInBar === 0 || beatInBar === 8) this.playDrum(this.scheduledTime, 'kick');
        if (beatInBar === 4 || beatInBar === 12) this.playDrum(this.scheduledTime, 'snare');
        if (beatInBar % 4 === 0) this.playDrum(this.scheduledTime, 'hihat');
      } else if (this.currentMood === 'tense') {
        // Minimal drums
        if (beatInBar === 0) this.playDrum(this.scheduledTime, 'kick');
        if (beatInBar === 8) this.playDrum(this.scheduledTime, 'snare');
      } else if (this.currentMood === 'menu') {
        // Atmospheric menu music - sparse drums
        if (beatInBar === 0) this.playDrum(this.scheduledTime, 'kick');
        if (beatInBar === 8) this.playDrum(this.scheduledTime, 'hihat');
      } else if (this.currentMood === 'victory') {
        // Celebratory drums
        if (beatInBar % 4 === 0) this.playDrum(this.scheduledTime, 'kick');
        if (beatInBar % 4 === 2) this.playDrum(this.scheduledTime, 'snare');
        if (beatInBar % 2 === 1) this.playDrum(this.scheduledTime, 'hihat');
      } else if (this.currentMood === 'defeat') {
        // Somber, slow drums
        if (beatInBar === 0) this.playDrum(this.scheduledTime, 'kick');
      } else {
        // Peaceful - light drums
        if (beatInBar === 0 || beatInBar === 8) this.playDrum(this.scheduledTime, 'kick');
        if (beatInBar === 4 || beatInBar === 12) this.playDrum(this.scheduledTime, 'hihat');
      }

      this.scheduledTime += beatDuration;
      this.beatIndex++;
    }
  }

  public start(): void {
    if (this.isPlaying) return;
    if (!this.initAudio()) return;

    this.isPlaying = true;
    this.scheduledTime = this.audioContext!.currentTime;
    this.beatIndex = 0;

    this.scheduleInterval = window.setInterval(() => {
      this.scheduleNextBeat();
    }, 25);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }
  }

  public setMood(mood: TensionMood): void {
    this.currentMood = mood;
    // Adjust BPM based on mood
    switch (mood) {
      case 'peaceful': this.bpm = 100; break;
      case 'tense': this.bpm = 110; break;
      case 'crisis': this.bpm = 130; break;
      case 'combat': this.bpm = 150; break;
      case 'menu': this.bpm = 90; break;
      case 'victory': this.bpm = 120; break;
      case 'defeat': this.bpm = 70; break;
    }
  }

  public setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public isActive(): boolean {
    return this.isPlaying;
  }

  // Convert game tension level to music mood
  public static tensionToMood(tensionLevel: string): TensionMood {
    switch (tensionLevel) {
      case 'cooperation': return 'peaceful';
      case 'competition': return 'peaceful';
      case 'confrontation': return 'tense';
      case 'crisis': return 'crisis';
      case 'conflict': return 'combat';
      default: return 'peaceful';
    }
  }

  // Play a one-shot sound effect
  public playSfx(type: 'click' | 'alert' | 'success' | 'warning' | 'action'): void {
    if (!this.initAudio() || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    switch (type) {
      case 'click':
        this.playNote(800, now, 0.05, 0.2, 'square');
        break;
      case 'alert':
        this.playNote(440, now, 0.1, 0.3, 'square');
        this.playNote(880, now + 0.1, 0.1, 0.3, 'square');
        break;
      case 'success':
        this.playNote(523.25, now, 0.1, 0.2, 'square');
        this.playNote(659.25, now + 0.1, 0.1, 0.2, 'square');
        this.playNote(783.99, now + 0.2, 0.2, 0.2, 'square');
        break;
      case 'warning':
        this.playNote(440, now, 0.15, 0.3, 'sawtooth');
        this.playNote(440, now + 0.2, 0.15, 0.3, 'sawtooth');
        break;
      case 'action':
        this.playNote(200, now, 0.1, 0.3, 'square');
        this.playNote(400, now + 0.05, 0.1, 0.2, 'square');
        break;
    }
  }
}

// Singleton instance
let engineInstance: ChiptuneEngine | null = null;

export const getChiptuneEngine = (): ChiptuneEngine => {
  if (!engineInstance) {
    engineInstance = new ChiptuneEngine();
  }
  return engineInstance;
};

export default ChiptuneEngine;
