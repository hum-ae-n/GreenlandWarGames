// Chiptune Music Engine using Web Audio API
// Generates culturally-appropriate music for each faction with tension-based dynamics

type TensionMood = 'peaceful' | 'tense' | 'crisis' | 'combat' | 'menu' | 'victory' | 'defeat';
type FactionStyle = 'usa' | 'russia' | 'china' | 'eu' | 'neutral';

// Musical notes (A4 = 440Hz) - Extended range
const NOTES: Record<string, number> = {
  // Octave 2
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  // Octave 3
  C3: 130.81, 'Db3': 138.59, D3: 146.83, 'Eb3': 155.56, E3: 164.81, F3: 174.61,
  'Gb3': 185.00, G3: 196.00, 'Ab3': 207.65, A3: 220.00, 'Bb3': 233.08, B3: 246.94,
  // Octave 4
  C4: 261.63, 'Db4': 277.18, D4: 293.66, 'Eb4': 311.13, E4: 329.63, F4: 349.23,
  'Gb4': 369.99, G4: 392.00, 'Ab4': 415.30, A4: 440.00, 'Bb4': 466.16, B4: 493.88,
  // Octave 5
  C5: 523.25, 'Db5': 554.37, D5: 587.33, 'Eb5': 622.25, E5: 659.25, F5: 698.46,
  'Gb5': 739.99, G5: 783.99, 'Ab5': 830.61, A5: 880.00, 'Bb5': 932.33, B5: 987.77,
  REST: 0,
};

// ============================================================================
// FACTION-SPECIFIC CHORD PROGRESSIONS
// ============================================================================

// USA: Major keys, patriotic feel, brass-like, military march influences
const USA_PROGRESSIONS = {
  peaceful: [['C4', 'E4', 'G4'], ['F4', 'A4', 'C5'], ['G4', 'B4', 'D5'], ['C4', 'E4', 'G4']],
  tense: [['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4']],
  crisis: [['A3', 'C4', 'E4'], ['D3', 'F3', 'A3'], ['E3', 'G3', 'B3'], ['A3', 'C4', 'E4']],
  combat: [['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['D4', 'Gb4', 'A4'], ['G3', 'B3', 'D4']],
};

// Russia: Minor keys, Slavic feel, dramatic and melancholic
const RUSSIA_PROGRESSIONS = {
  peaceful: [['A3', 'C4', 'E4'], ['D3', 'F3', 'A3'], ['E3', 'G3', 'B3'], ['A3', 'C4', 'E4']],
  tense: [['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['E3', 'Ab3', 'B3'], ['A3', 'C4', 'E4']],
  crisis: [['E3', 'Ab3', 'B3'], ['F3', 'A3', 'C4'], ['A3', 'C4', 'E4'], ['E3', 'Ab3', 'B3']],
  combat: [['E3', 'Ab3', 'B3'], ['A3', 'C4', 'E4'], ['D3', 'F3', 'A3'], ['E3', 'Ab3', 'B3']],
};

// China: Pentatonic scales, traditional Chinese music influence
const CHINA_PROGRESSIONS = {
  peaceful: [['C4', 'E4', 'G4'], ['D4', 'G4', 'A4'], ['E4', 'G4', 'C5'], ['C4', 'E4', 'G4']],
  tense: [['D4', 'G4', 'A4'], ['E4', 'A4', 'C5'], ['G4', 'C5', 'D5'], ['D4', 'G4', 'A4']],
  crisis: [['A3', 'C4', 'E4'], ['C4', 'E4', 'G4'], ['D4', 'G4', 'A4'], ['A3', 'C4', 'E4']],
  combat: [['A3', 'C4', 'E4'], ['D4', 'E4', 'A4'], ['E4', 'G4', 'A4'], ['A3', 'C4', 'E4']],
};

// EU: Classical European, refined, baroque/romantic influences
const EU_PROGRESSIONS = {
  peaceful: [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']],
  tense: [['G3', 'B3', 'D4'], ['E3', 'G3', 'B3'], ['C4', 'E4', 'G4'], ['D4', 'Gb4', 'A4']],
  crisis: [['D3', 'F3', 'A3'], ['Bb3', 'D4', 'F4'], ['A3', 'C4', 'E4'], ['D3', 'F3', 'A3']],
  combat: [['A3', 'C4', 'E4'], ['E3', 'Ab3', 'B3'], ['F3', 'A3', 'C4'], ['E3', 'Ab3', 'B3']],
};

// Neutral/Menu: Ambient, atmospheric
const NEUTRAL_PROGRESSIONS = {
  peaceful: [['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4']],
  tense: [['A3', 'C4', 'E4'], ['E3', 'G3', 'B3'], ['D3', 'F3', 'A3'], ['A3', 'C4', 'E4']],
  crisis: [['E3', 'G3', 'B3'], ['F3', 'A3', 'C4'], ['E3', 'G3', 'B3'], ['D3', 'F3', 'A3']],
  combat: [['E3', 'G3', 'B3'], ['A3', 'C4', 'E4'], ['D3', 'F3', 'A3'], ['E3', 'G3', 'B3']],
};

// ============================================================================
// FACTION-SPECIFIC MELODIES
// ============================================================================

const USA_MELODIES = {
  peaceful: [
    ['C4', 'E4', 'G4', 'E4', 'C5', 'REST', 'G4', 'A4', 'G4', 'E4', 'C4', 'REST', 'D4', 'E4', 'G4', 'REST'],
    ['G4', 'A4', 'C5', 'A4', 'G4', 'E4', 'REST', 'D4', 'E4', 'G4', 'C5', 'REST', 'A4', 'G4', 'E4', 'REST'],
  ],
  tense: [
    ['E4', 'REST', 'G4', 'REST', 'A4', 'G4', 'E4', 'REST', 'C4', 'D4', 'E4', 'REST', 'G4', 'E4', 'D4', 'REST'],
    ['C4', 'E4', 'G4', 'REST', 'E4', 'D4', 'C4', 'REST', 'A3', 'C4', 'E4', 'REST', 'D4', 'C4', 'A3', 'REST'],
  ],
  crisis: [
    ['A4', 'REST', 'E4', 'A4', 'G4', 'E4', 'REST', 'D4', 'E4', 'REST', 'A4', 'G4', 'E4', 'D4', 'REST', 'REST'],
    ['E4', 'G4', 'A4', 'REST', 'G4', 'E4', 'D4', 'REST', 'C4', 'D4', 'E4', 'G4', 'E4', 'D4', 'C4', 'REST'],
  ],
  combat: [
    ['G4', 'G4', 'B4', 'D5', 'G4', 'B4', 'D5', 'REST', 'C5', 'B4', 'G4', 'D4', 'G4', 'B4', 'D5', 'G5'],
    ['D5', 'B4', 'G4', 'D4', 'G4', 'B4', 'D5', 'REST', 'E5', 'D5', 'B4', 'G4', 'D4', 'G4', 'B4', 'D5'],
  ],
};

const RUSSIA_MELODIES = {
  peaceful: [
    ['A4', 'REST', 'E4', 'F4', 'E4', 'D4', 'C4', 'REST', 'D4', 'E4', 'REST', 'A4', 'G4', 'E4', 'D4', 'REST'],
    ['E4', 'A4', 'G4', 'F4', 'E4', 'REST', 'D4', 'C4', 'D4', 'E4', 'REST', 'F4', 'E4', 'D4', 'C4', 'REST'],
  ],
  tense: [
    ['A4', 'REST', 'Ab4', 'A4', 'E4', 'REST', 'F4', 'E4', 'D4', 'REST', 'E4', 'F4', 'Ab4', 'A4', 'REST', 'REST'],
    ['E4', 'F4', 'Ab4', 'REST', 'A4', 'Ab4', 'F4', 'E4', 'REST', 'D4', 'E4', 'F4', 'REST', 'E4', 'D4', 'REST'],
  ],
  crisis: [
    ['E4', 'F4', 'Ab4', 'E4', 'F4', 'Ab4', 'A4', 'REST', 'B4', 'A4', 'Ab4', 'F4', 'E4', 'REST', 'E4', 'REST'],
    ['Ab4', 'B4', 'A4', 'Ab4', 'F4', 'E4', 'REST', 'REST', 'E4', 'F4', 'Ab4', 'A4', 'Ab4', 'F4', 'E4', 'REST'],
  ],
  combat: [
    ['E4', 'E4', 'Ab4', 'E4', 'B4', 'A4', 'Ab4', 'E4', 'F4', 'E4', 'Ab4', 'B4', 'A4', 'Ab4', 'E4', 'REST'],
    ['B4', 'A4', 'Ab4', 'E4', 'F4', 'Ab4', 'A4', 'B4', 'E5', 'B4', 'A4', 'Ab4', 'E4', 'Ab4', 'A4', 'B4'],
  ],
};

const CHINA_MELODIES = {
  peaceful: [
    ['E4', 'REST', 'G4', 'A4', 'REST', 'C5', 'A4', 'REST', 'G4', 'E4', 'REST', 'D4', 'E4', 'REST', 'G4', 'REST'],
    ['C5', 'A4', 'G4', 'REST', 'E4', 'D4', 'REST', 'C4', 'D4', 'E4', 'G4', 'REST', 'A4', 'G4', 'E4', 'REST'],
  ],
  tense: [
    ['D4', 'REST', 'E4', 'G4', 'REST', 'A4', 'C5', 'REST', 'A4', 'G4', 'REST', 'E4', 'D4', 'REST', 'E4', 'REST'],
    ['G4', 'A4', 'C5', 'REST', 'D5', 'C5', 'A4', 'REST', 'G4', 'E4', 'D4', 'REST', 'E4', 'G4', 'A4', 'REST'],
  ],
  crisis: [
    ['A4', 'REST', 'E4', 'REST', 'A4', 'C5', 'A4', 'REST', 'E4', 'G4', 'A4', 'REST', 'E4', 'D4', 'E4', 'REST'],
    ['E4', 'A4', 'C5', 'A4', 'E4', 'REST', 'D4', 'E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'REST', 'E4', 'REST'],
  ],
  combat: [
    ['A4', 'C5', 'D5', 'A4', 'E4', 'A4', 'C5', 'D5', 'E5', 'D5', 'C5', 'A4', 'E4', 'A4', 'C5', 'D5'],
    ['E5', 'D5', 'C5', 'A4', 'G4', 'A4', 'C5', 'REST', 'D5', 'C5', 'A4', 'G4', 'E4', 'G4', 'A4', 'C5'],
  ],
};

const EU_MELODIES = {
  peaceful: [
    ['C4', 'D4', 'E4', 'F4', 'G4', 'REST', 'A4', 'G4', 'F4', 'E4', 'D4', 'REST', 'C4', 'E4', 'G4', 'REST'],
    ['G4', 'F4', 'E4', 'D4', 'C4', 'REST', 'D4', 'E4', 'F4', 'G4', 'A4', 'REST', 'G4', 'F4', 'E4', 'REST'],
  ],
  tense: [
    ['G4', 'REST', 'A4', 'B4', 'C5', 'B4', 'A4', 'REST', 'G4', 'Gb4', 'E4', 'D4', 'REST', 'E4', 'Gb4', 'REST'],
    ['B4', 'A4', 'G4', 'Gb4', 'E4', 'REST', 'D4', 'E4', 'Gb4', 'G4', 'A4', 'REST', 'B4', 'A4', 'G4', 'REST'],
  ],
  crisis: [
    ['D4', 'REST', 'F4', 'A4', 'D5', 'REST', 'C5', 'Bb4', 'A4', 'REST', 'G4', 'F4', 'E4', 'D4', 'REST', 'REST'],
    ['A4', 'Bb4', 'C5', 'D5', 'REST', 'C5', 'Bb4', 'A4', 'G4', 'F4', 'REST', 'E4', 'F4', 'G4', 'A4', 'REST'],
  ],
  combat: [
    ['A4', 'C5', 'E5', 'A4', 'Ab4', 'B4', 'E5', 'REST', 'A4', 'C5', 'E5', 'F5', 'E5', 'C5', 'A4', 'Ab4'],
    ['E5', 'C5', 'A4', 'Ab4', 'E4', 'Ab4', 'A4', 'C5', 'E5', 'F5', 'E5', 'C5', 'Ab4', 'A4', 'REST', 'E5'],
  ],
};

const NEUTRAL_MELODIES = {
  peaceful: [
    ['E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'C4', 'D4', 'E4', 'REST', 'G4', 'E4', 'D4', 'C4', 'D4', 'E4'],
    ['C4', 'D4', 'E4', 'G4', 'A4', 'G4', 'E4', 'REST', 'C4', 'E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'C4'],
  ],
  tense: [
    ['A4', 'REST', 'E4', 'REST', 'A4', 'G4', 'E4', 'REST', 'A4', 'REST', 'B4', 'A4', 'G4', 'E4', 'REST', 'REST'],
    ['E4', 'A4', 'REST', 'E4', 'G4', 'REST', 'A4', 'G4', 'E4', 'REST', 'REST', 'A4', 'G4', 'E4', 'REST', 'D4'],
  ],
  crisis: [
    ['E4', 'E4', 'E4', 'REST', 'E4', 'E4', 'F4', 'E4', 'D4', 'REST', 'E4', 'E4', 'E4', 'F4', 'G4', 'REST'],
    ['E4', 'REST', 'E4', 'E4', 'F4', 'REST', 'E4', 'D4', 'E4', 'REST', 'E4', 'F4', 'E4', 'D4', 'REST', 'E4'],
  ],
  combat: [
    ['E4', 'E4', 'E5', 'E4', 'E4', 'E5', 'D5', 'E5', 'E4', 'E4', 'E5', 'E4', 'G4', 'E5', 'D5', 'C5'],
    ['E5', 'D5', 'E5', 'E4', 'G4', 'E5', 'D5', 'E5', 'C5', 'D5', 'E5', 'E4', 'E5', 'D5', 'C5', 'B4'],
  ],
};

// ============================================================================
// BASS PATTERNS (Faction-aware)
// ============================================================================

const USA_BASS = {
  peaceful: ['C3', 'REST', 'G2', 'REST', 'F2', 'REST', 'G2', 'REST', 'C3', 'REST', 'E2', 'REST', 'F2', 'REST', 'G2', 'REST'],
  tense: ['C3', 'REST', 'C3', 'G2', 'A2', 'REST', 'A2', 'E2', 'F2', 'REST', 'F2', 'C3', 'G2', 'REST', 'G2', 'REST'],
  crisis: ['A2', 'REST', 'A2', 'A2', 'D2', 'REST', 'D2', 'D2', 'E2', 'REST', 'E2', 'E2', 'A2', 'REST', 'A2', 'REST'],
  combat: ['G2', 'G2', 'REST', 'G2', 'C3', 'C3', 'REST', 'C3', 'D3', 'D3', 'REST', 'D3', 'G2', 'G2', 'G2', 'G2'],
};

const RUSSIA_BASS = {
  peaceful: ['A2', 'REST', 'E2', 'REST', 'D2', 'REST', 'E2', 'REST', 'A2', 'REST', 'D2', 'REST', 'E2', 'REST', 'A2', 'REST'],
  tense: ['A2', 'REST', 'A2', 'E2', 'F2', 'REST', 'F2', 'C3', 'E2', 'REST', 'E2', 'B2', 'A2', 'REST', 'A2', 'REST'],
  crisis: ['E2', 'E2', 'REST', 'E2', 'F2', 'F2', 'REST', 'F2', 'A2', 'A2', 'REST', 'A2', 'E2', 'REST', 'E2', 'REST'],
  combat: ['E2', 'E2', 'E2', 'REST', 'A2', 'A2', 'A2', 'REST', 'D2', 'D2', 'D2', 'REST', 'E2', 'E2', 'E2', 'E2'],
};

const CHINA_BASS = {
  peaceful: ['C3', 'REST', 'REST', 'G2', 'REST', 'REST', 'A2', 'REST', 'REST', 'E2', 'REST', 'REST', 'G2', 'REST', 'C3', 'REST'],
  tense: ['D3', 'REST', 'A2', 'REST', 'E2', 'REST', 'G2', 'REST', 'A2', 'REST', 'D3', 'REST', 'G2', 'REST', 'A2', 'REST'],
  crisis: ['A2', 'REST', 'E2', 'REST', 'A2', 'REST', 'C3', 'REST', 'D3', 'REST', 'A2', 'REST', 'E2', 'REST', 'A2', 'REST'],
  combat: ['A2', 'A2', 'REST', 'E2', 'A2', 'REST', 'C3', 'REST', 'D3', 'REST', 'A2', 'E2', 'A2', 'REST', 'E2', 'A2'],
};

const EU_BASS = {
  peaceful: ['C3', 'REST', 'G2', 'REST', 'C3', 'REST', 'E2', 'REST', 'F2', 'REST', 'C3', 'REST', 'G2', 'REST', 'C3', 'REST'],
  tense: ['G2', 'REST', 'D3', 'REST', 'G2', 'REST', 'B2', 'REST', 'E2', 'REST', 'G2', 'REST', 'D3', 'REST', 'G2', 'REST'],
  crisis: ['D3', 'REST', 'A2', 'REST', 'Bb2', 'REST', 'F2', 'REST', 'A2', 'REST', 'D3', 'REST', 'A2', 'REST', 'D3', 'REST'],
  combat: ['A2', 'A2', 'REST', 'E2', 'A2', 'A2', 'REST', 'E2', 'F2', 'F2', 'REST', 'C3', 'E2', 'E2', 'B2', 'E2'],
};

const NEUTRAL_BASS = {
  peaceful: ['C2', 'REST', 'G2', 'REST', 'C2', 'REST', 'G2', 'REST', 'A2', 'REST', 'E2', 'REST', 'F2', 'REST', 'G2', 'REST'],
  tense: ['A2', 'REST', 'A2', 'A2', 'E2', 'REST', 'E2', 'E2', 'D2', 'REST', 'D2', 'D2', 'A2', 'REST', 'A2', 'A2'],
  crisis: ['E2', 'E2', 'REST', 'E2', 'F2', 'F2', 'REST', 'F2', 'E2', 'E2', 'REST', 'E2', 'D2', 'D2', 'REST', 'D2'],
  combat: ['E2', 'E2', 'E2', 'E2', 'E2', 'E2', 'E2', 'E2', 'D2', 'D2', 'D2', 'D2', 'E2', 'E2', 'E2', 'E2'],
};

// Add Bb2 to notes
const NOTES_EXTENDED: Record<string, number> = {
  ...NOTES,
  'Bb2': 116.54,
};

// ============================================================================
// MUSIC ENGINE CLASS
// ============================================================================

export class ChiptuneEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentMood: TensionMood = 'peaceful';
  private currentFaction: FactionStyle = 'neutral';
  private bpm = 100;
  private beatIndex = 0;
  private scheduledTime = 0;
  private lookahead = 0.1;
  private scheduleInterval: number | null = null;
  private melodyVariation = 0;
  private barsSinceChange = 0;

  constructor() {
    // Audio context created on first user interaction
  }

  private initAudio(): boolean {
    if (this.audioContext) return true;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.25; // Softer default volume
      return true;
    } catch (e) {
      console.warn('Web Audio API not supported');
      return false;
    }
  }

  // Create a softer, more musical oscillator
  private playNote(
    frequency: number,
    startTime: number,
    duration: number,
    volume: number = 0.2,
    type: OscillatorType = 'triangle' // Softer than square
  ): void {
    if (!this.audioContext || !this.masterGain || frequency === 0) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Add a low-pass filter for warmer sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000; // Cut harsh highs
    filter.Q.value = 1;

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // Softer ADSR envelope
    const attackTime = 0.02;
    const decayTime = 0.1;
    const sustainLevel = volume * 0.6;
    const releaseTime = 0.15;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel, startTime + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.1);
  }

  // Softer arpeggio
  private playArpeggio(
    notes: string[],
    startTime: number,
    totalDuration: number,
    volume: number = 0.1
  ): void {
    const noteDuration = totalDuration / notes.length;
    notes.forEach((note, i) => {
      const freq = NOTES[note] || NOTES_EXTENDED[note];
      if (freq) {
        this.playNote(freq, startTime + i * noteDuration, noteDuration * 0.9, volume, 'sine');
      }
    });
  }

  // Softer drums
  private playDrum(startTime: number, type: 'kick' | 'snare' | 'hihat', soft: boolean = true): void {
    if (!this.audioContext || !this.masterGain) return;

    const volumeMult = soft ? 0.5 : 1.0;

    if (type === 'kick') {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(100, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(30, startTime + 0.15);
      gainNode.gain.setValueAtTime(0.3 * volumeMult, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    } else if (type === 'snare' || type === 'hihat') {
      const bufferSize = this.audioContext.sampleRate * 0.08;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;

      const filter = this.audioContext.createBiquadFilter();
      filter.type = type === 'hihat' ? 'highpass' : 'bandpass';
      filter.frequency.value = type === 'hihat' ? 9000 : 2500;

      const gainNode = this.audioContext.createGain();
      const vol = (type === 'hihat' ? 0.06 : 0.15) * volumeMult;
      const dur = type === 'hihat' ? 0.04 : 0.08;

      gainNode.gain.setValueAtTime(vol, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + dur);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);
      noise.start(startTime);
      noise.stop(startTime + dur);
    }
  }

  private getMelodies(): string[][] {
    const moodKey = this.currentMood === 'menu' || this.currentMood === 'victory' || this.currentMood === 'defeat'
      ? 'peaceful' : this.currentMood;

    switch (this.currentFaction) {
      case 'usa': return USA_MELODIES[moodKey] || USA_MELODIES.peaceful;
      case 'russia': return RUSSIA_MELODIES[moodKey] || RUSSIA_MELODIES.peaceful;
      case 'china': return CHINA_MELODIES[moodKey] || CHINA_MELODIES.peaceful;
      case 'eu': return EU_MELODIES[moodKey] || EU_MELODIES.peaceful;
      default: return NEUTRAL_MELODIES[moodKey] || NEUTRAL_MELODIES.peaceful;
    }
  }

  private getBass(): string[] {
    const moodKey = this.currentMood === 'menu' || this.currentMood === 'victory' || this.currentMood === 'defeat'
      ? 'peaceful' : this.currentMood;

    switch (this.currentFaction) {
      case 'usa': return USA_BASS[moodKey] || USA_BASS.peaceful;
      case 'russia': return RUSSIA_BASS[moodKey] || RUSSIA_BASS.peaceful;
      case 'china': return CHINA_BASS[moodKey] || CHINA_BASS.peaceful;
      case 'eu': return EU_BASS[moodKey] || EU_BASS.peaceful;
      default: return NEUTRAL_BASS[moodKey] || NEUTRAL_BASS.peaceful;
    }
  }

  private getProgressions(): string[][] {
    const moodKey = this.currentMood === 'menu' || this.currentMood === 'victory' || this.currentMood === 'defeat'
      ? 'peaceful' : this.currentMood;

    switch (this.currentFaction) {
      case 'usa': return USA_PROGRESSIONS[moodKey] || USA_PROGRESSIONS.peaceful;
      case 'russia': return RUSSIA_PROGRESSIONS[moodKey] || RUSSIA_PROGRESSIONS.peaceful;
      case 'china': return CHINA_PROGRESSIONS[moodKey] || CHINA_PROGRESSIONS.peaceful;
      case 'eu': return EU_PROGRESSIONS[moodKey] || EU_PROGRESSIONS.peaceful;
      default: return NEUTRAL_PROGRESSIONS[moodKey] || NEUTRAL_PROGRESSIONS.peaceful;
    }
  }

  private scheduleNextBeat(): void {
    if (!this.audioContext || !this.isPlaying) return;

    const currentTime = this.audioContext.currentTime;
    const beatDuration = 60 / this.bpm / 4; // 16th notes

    while (this.scheduledTime < currentTime + this.lookahead) {
      const beatInBar = this.beatIndex % 16;
      const barIndex = Math.floor(this.beatIndex / 16) % 4;

      // Change melody variation every 4-8 bars
      if (beatInBar === 0 && barIndex === 0) {
        this.barsSinceChange++;
        if (this.barsSinceChange >= 4 + Math.floor(Math.random() * 4)) {
          const melodies = this.getMelodies();
          this.melodyVariation = Math.floor(Math.random() * melodies.length);
          this.barsSinceChange = 0;
        }
      }

      const melodies = this.getMelodies();
      const melody = melodies[this.melodyVariation % melodies.length];
      const bass = this.getBass();
      const progressions = this.getProgressions();
      const chord = progressions[barIndex % progressions.length];

      // Melody - use softer triangle wave
      const melodyNote = melody[beatInBar];
      if (melodyNote && melodyNote !== 'REST') {
        const freq = NOTES[melodyNote] || NOTES_EXTENDED[melodyNote];
        if (freq) {
          // Different wave types for different factions
          const waveType: OscillatorType = this.currentFaction === 'china' ? 'sine'
            : this.currentFaction === 'russia' ? 'sawtooth'
            : 'triangle';
          this.playNote(freq, this.scheduledTime, beatDuration * 0.85, 0.15, waveType);
        }
      }

      // Bass - softer
      if (beatInBar % 2 === 0) {
        const bassNote = bass[beatInBar];
        if (bassNote && bassNote !== 'REST') {
          const freq = NOTES[bassNote] || NOTES_EXTENDED[bassNote];
          if (freq) {
            this.playNote(freq, this.scheduledTime, beatDuration * 1.5, 0.18, 'sine');
          }
        }
      }

      // Chord arpeggio - sparser
      if (beatInBar === 0) {
        this.playArpeggio(chord, this.scheduledTime, beatDuration * 3, 0.08);
      }

      // Drums - faction and mood dependent
      const softDrums = this.currentMood !== 'combat' && this.currentMood !== 'crisis';

      if (this.currentMood === 'combat') {
        if (beatInBar % 4 === 0) this.playDrum(this.scheduledTime, 'kick', false);
        if (beatInBar % 4 === 2) this.playDrum(this.scheduledTime, 'snare', false);
        if (beatInBar % 2 === 1) this.playDrum(this.scheduledTime, 'hihat', true);
      } else if (this.currentMood === 'crisis') {
        if (beatInBar === 0 || beatInBar === 8) this.playDrum(this.scheduledTime, 'kick', false);
        if (beatInBar === 4 || beatInBar === 12) this.playDrum(this.scheduledTime, 'snare', true);
      } else if (this.currentMood === 'tense') {
        if (beatInBar === 0) this.playDrum(this.scheduledTime, 'kick', softDrums);
        if (beatInBar === 12) this.playDrum(this.scheduledTime, 'hihat', softDrums);
      } else if (this.currentMood === 'menu' || this.currentMood === 'victory') {
        if (beatInBar === 0) this.playDrum(this.scheduledTime, 'kick', true);
      } else if (this.currentMood === 'defeat') {
        // Very minimal drums for defeat
        if (beatInBar === 0 && barIndex === 0) this.playDrum(this.scheduledTime, 'kick', true);
      } else {
        // Peaceful - very light
        if (beatInBar === 0) this.playDrum(this.scheduledTime, 'kick', true);
        if (beatInBar === 8) this.playDrum(this.scheduledTime, 'hihat', true);
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
    switch (mood) {
      case 'peaceful': this.bpm = 85; break;
      case 'tense': this.bpm = 95; break;
      case 'crisis': this.bpm = 115; break;
      case 'combat': this.bpm = 135; break;
      case 'menu': this.bpm = 80; break;
      case 'victory': this.bpm = 110; break;
      case 'defeat': this.bpm = 60; break;
    }
  }

  public setFaction(faction: string): void {
    const factionMap: Record<string, FactionStyle> = {
      'usa': 'usa',
      'russia': 'russia',
      'china': 'china',
      'eu': 'eu',
    };
    this.currentFaction = factionMap[faction.toLowerCase()] || 'neutral';
  }

  public setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume * 0.5)); // Cap at 50% for comfort
    }
  }

  public isActive(): boolean {
    return this.isPlaying;
  }

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

  public playSfx(type: 'click' | 'alert' | 'success' | 'warning' | 'action'): void {
    if (!this.initAudio() || !this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    switch (type) {
      case 'click':
        this.playNote(600, now, 0.04, 0.1, 'sine');
        break;
      case 'alert':
        this.playNote(440, now, 0.08, 0.15, 'triangle');
        this.playNote(660, now + 0.1, 0.08, 0.15, 'triangle');
        break;
      case 'success':
        this.playNote(523.25, now, 0.1, 0.12, 'sine');
        this.playNote(659.25, now + 0.1, 0.1, 0.12, 'sine');
        this.playNote(783.99, now + 0.2, 0.15, 0.12, 'sine');
        break;
      case 'warning':
        this.playNote(330, now, 0.12, 0.15, 'triangle');
        this.playNote(330, now + 0.15, 0.12, 0.15, 'triangle');
        break;
      case 'action':
        this.playNote(200, now, 0.06, 0.12, 'sine');
        this.playNote(300, now + 0.05, 0.06, 0.1, 'sine');
        break;
    }
  }
}

// Singleton
let engineInstance: ChiptuneEngine | null = null;

export const getChiptuneEngine = (): ChiptuneEngine => {
  if (!engineInstance) {
    engineInstance = new ChiptuneEngine();
  }
  return engineInstance;
};

export default ChiptuneEngine;
