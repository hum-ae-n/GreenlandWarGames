// Enhanced Chiptune Music Engine - 60+ second loops per faction
// Culturally-appropriate music with proper song structures

type TensionMood = 'peaceful' | 'tense' | 'crisis' | 'combat' | 'menu' | 'victory' | 'defeat';
type FactionStyle = 'usa' | 'russia' | 'china' | 'eu' | 'canada' | 'norway' | 'denmark' | 'neutral';

// Musical notes (A4 = 440Hz)
const NOTES: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  'Bb2': 116.54,
  C3: 130.81, 'Db3': 138.59, D3: 146.83, 'Eb3': 155.56, E3: 164.81, F3: 174.61,
  'Gb3': 185.00, G3: 196.00, 'Ab3': 207.65, A3: 220.00, 'Bb3': 233.08, B3: 246.94,
  C4: 261.63, 'Db4': 277.18, D4: 293.66, 'Eb4': 311.13, E4: 329.63, F4: 349.23,
  'Gb4': 369.99, G4: 392.00, 'Ab4': 415.30, A4: 440.00, 'Bb4': 466.16, B4: 493.88,
  C5: 523.25, 'Db5': 554.37, D5: 587.33, 'Eb5': 622.25, E5: 659.25, F5: 698.46,
  'Gb5': 739.99, G5: 783.99, 'Ab5': 830.61, A5: 880.00, 'Bb5': 932.33, B5: 987.77,
  C6: 1046.50,
  REST: 0,
};

// ============================================================================
// USA - Patriotic, march-like, major keys (Star-Spangled Banner feel)
// ============================================================================
const USA_SONGS = {
  peaceful: {
    // 8-bar phrases, ~64 beats at 85 BPM = ~45 sec per section
    sections: ['A', 'A', 'B', 'A', 'C', 'B', 'A', 'A'], // ~90 sec total
    melodies: {
      A: [
        'C4','E4','G4','REST','G4','A4','G4','E4','C4','REST','D4','E4','F4','E4','D4','REST',
        'E4','G4','C5','REST','C5','B4','A4','G4','E4','REST','D4','C4','D4','E4','C4','REST',
        'G4','REST','A4','B4','C5','REST','B4','A4','G4','REST','E4','D4','E4','G4','E4','REST',
        'C4','E4','G4','C5','E5','REST','D5','C5','B4','A4','G4','REST','E4','D4','C4','REST',
      ],
      B: [
        'E4','REST','G4','A4','B4','REST','C5','B4','A4','G4','E4','REST','D4','E4','G4','REST',
        'A4','REST','B4','C5','D5','REST','C5','B4','A4','REST','G4','A4','B4','C5','B4','REST',
        'G4','A4','B4','REST','C5','D5','E5','REST','D5','C5','B4','A4','G4','REST','E4','REST',
        'C5','B4','A4','G4','E4','D4','C4','REST','D4','E4','F4','E4','D4','C4','REST','REST',
      ],
      C: [
        'C5','REST','REST','G4','C5','REST','E5','REST','D5','C5','B4','REST','A4','G4','REST','REST',
        'G4','A4','B4','C5','D5','E5','D5','C5','B4','A4','G4','REST','E4','G4','C5','REST',
        'E5','REST','D5','C5','B4','REST','A4','G4','E4','REST','D4','E4','G4','A4','G4','REST',
        'C4','D4','E4','G4','C5','E5','G5','REST','E5','C5','G4','E4','C4','REST','REST','REST',
      ],
    },
    bass: {
      A: ['C2','REST','G2','REST','C3','REST','G2','REST','F2','REST','C3','REST','G2','REST','C2','REST'],
      B: ['A2','REST','E2','REST','A2','REST','E2','REST','G2','REST','D3','REST','G2','REST','C3','REST'],
      C: ['C3','REST','G2','REST','C3','REST','E2','REST','F2','REST','G2','REST','C2','REST','G2','REST'],
    },
    chords: {
      A: [['C4','E4','G4'], ['F4','A4','C5'], ['G4','B4','D5'], ['C4','E4','G4']],
      B: [['A3','C4','E4'], ['G3','B3','D4'], ['F3','A3','C4'], ['G3','B3','D4']],
      C: [['C4','E4','G4'], ['G3','B3','D4'], ['A3','C4','E4'], ['G3','B3','D4']],
    },
  },
  tense: {
    sections: ['A', 'B', 'A', 'C', 'B', 'A'],
    melodies: {
      A: [
        'E4','REST','G4','REST','A4','G4','E4','REST','C4','D4','E4','REST','G4','E4','D4','REST',
        'C4','E4','G4','REST','E4','D4','C4','REST','A3','C4','E4','REST','D4','C4','A3','REST',
        'E4','REST','E4','REST','G4','REST','A4','REST','G4','E4','D4','C4','E4','REST','REST','REST',
        'G4','REST','E4','REST','C4','REST','D4','E4','G4','REST','E4','D4','C4','REST','REST','REST',
      ],
      B: [
        'A4','REST','G4','E4','C4','REST','D4','E4','G4','REST','A4','G4','E4','REST','D4','REST',
        'C4','REST','E4','G4','A4','REST','G4','E4','D4','REST','C4','D4','E4','REST','REST','REST',
        'G4','A4','G4','E4','D4','C4','D4','E4','G4','A4','G4','E4','D4','C4','REST','REST',
        'E4','REST','D4','REST','C4','REST','REST','REST','E4','D4','C4','REST','REST','REST','REST','REST',
      ],
      C: [
        'C4','REST','C4','REST','E4','REST','G4','REST','A4','REST','G4','REST','E4','REST','C4','REST',
        'D4','REST','E4','REST','G4','REST','A4','REST','B4','REST','A4','REST','G4','REST','E4','REST',
        'E4','G4','A4','G4','E4','D4','C4','REST','D4','E4','G4','A4','G4','E4','D4','REST',
        'C4','REST','REST','REST','E4','REST','REST','REST','G4','REST','REST','REST','C5','REST','REST','REST',
      ],
    },
    bass: {
      A: ['C2','REST','C2','REST','A2','REST','A2','REST','F2','REST','G2','REST','C2','REST','REST','REST'],
      B: ['A2','REST','E2','REST','A2','REST','E2','REST','F2','REST','G2','REST','A2','REST','REST','REST'],
      C: ['C2','REST','E2','REST','G2','REST','A2','REST','G2','REST','E2','REST','C2','REST','REST','REST'],
    },
    chords: {
      A: [['C4','E4','G4'], ['A3','C4','E4'], ['F3','A3','C4'], ['G3','B3','D4']],
      B: [['A3','C4','E4'], ['E3','G3','B3'], ['F3','A3','C4'], ['G3','B3','D4']],
      C: [['C4','E4','G4'], ['D4','F4','A4'], ['G3','B3','D4'], ['C4','E4','G4']],
    },
  },
  crisis: {
    sections: ['A', 'A', 'B', 'C', 'A', 'B'],
    melodies: {
      A: [
        'A4','REST','E4','A4','G4','E4','REST','D4','E4','REST','A4','G4','E4','D4','REST','REST',
        'E4','G4','A4','REST','G4','E4','D4','REST','C4','D4','E4','G4','E4','D4','C4','REST',
        'A4','REST','A4','REST','E4','REST','A4','REST','G4','E4','D4','REST','E4','REST','REST','REST',
        'E4','A4','G4','E4','D4','C4','D4','E4','A4','G4','E4','D4','C4','REST','REST','REST',
      ],
      B: [
        'E4','REST','Ab4','REST','A4','REST','E4','REST','F4','REST','E4','REST','D4','REST','E4','REST',
        'A4','Ab4','A4','REST','E4','REST','F4','E4','D4','REST','E4','REST','REST','REST','REST','REST',
        'E4','F4','Ab4','A4','Ab4','F4','E4','REST','D4','E4','F4','Ab4','A4','REST','REST','REST',
        'A4','Ab4','F4','E4','D4','E4','F4','Ab4','A4','REST','REST','REST','E4','REST','REST','REST',
      ],
      C: [
        'E4','E4','REST','E4','E4','REST','F4','E4','D4','REST','E4','E4','REST','E4','F4','REST',
        'A4','REST','A4','REST','Ab4','REST','F4','REST','E4','REST','D4','REST','E4','REST','REST','REST',
        'E4','F4','Ab4','A4','E5','REST','D5','C5','A4','REST','Ab4','F4','E4','REST','REST','REST',
        'A4','REST','E4','REST','A4','REST','E4','REST','A4','E4','A4','E4','A4','REST','REST','REST',
      ],
    },
    bass: {
      A: ['A2','REST','A2','E2','A2','REST','D2','REST','E2','REST','A2','REST','E2','REST','A2','REST'],
      B: ['E2','REST','E2','REST','F2','REST','E2','REST','D2','REST','E2','REST','A2','REST','REST','REST'],
      C: ['A2','A2','REST','A2','E2','REST','F2','REST','E2','REST','A2','REST','E2','REST','A2','REST'],
    },
    chords: {
      A: [['A3','C4','E4'], ['D3','F3','A3'], ['E3','G3','B3'], ['A3','C4','E4']],
      B: [['E3','Ab3','B3'], ['F3','A3','C4'], ['E3','G3','B3'], ['A3','C4','E4']],
      C: [['A3','C4','E4'], ['F3','A3','C4'], ['E3','Ab3','B3'], ['A3','C4','E4']],
    },
  },
  combat: {
    sections: ['A', 'B', 'A', 'C', 'B', 'A', 'C', 'A'],
    melodies: {
      A: [
        'G4','G4','B4','D5','G4','B4','D5','REST','C5','B4','G4','D4','G4','B4','D5','G5',
        'D5','B4','G4','D4','G4','B4','D5','REST','E5','D5','B4','G4','D4','G4','B4','D5',
        'G4','G4','G4','B4','D5','G5','D5','B4','G4','D4','G4','B4','D5','G5','D5','B4',
        'G4','B4','D5','G5','B5','G5','D5','B4','G4','D4','G4','REST','REST','REST','REST','REST',
      ],
      B: [
        'C5','C5','E5','G5','C5','E5','G5','REST','D5','C5','G4','E4','G4','C5','E5','C5',
        'G4','E4','C4','G4','C5','E5','G5','REST','E5','D5','C5','G4','E4','G4','C5','E5',
        'C5','REST','C5','REST','E5','REST','G5','REST','E5','C5','G4','E4','C4','REST','REST','REST',
        'G5','E5','C5','G4','E4','C4','G4','C5','E5','G5','E5','C5','G4','REST','REST','REST',
      ],
      C: [
        'D5','D5','Gb5','A5','D5','Gb5','A5','REST','B5','A5','Gb5','D5','A4','D5','Gb5','A5',
        'Gb5','D5','A4','D4','A4','D5','Gb5','REST','A5','Gb5','D5','A4','D4','A4','D5','Gb5',
        'D5','Gb5','A5','D5','Gb5','A5','REST','REST','Gb5','D5','A4','Gb4','D4','REST','REST','REST',
        'A5','Gb5','D5','A4','Gb4','D4','A4','D5','Gb5','A5','REST','REST','D5','REST','REST','REST',
      ],
    },
    bass: {
      A: ['G2','G2','REST','G2','D3','D3','REST','D3','G2','G2','REST','G2','D3','D3','G2','G2'],
      B: ['C3','C3','REST','C3','G2','G2','REST','G2','C3','C3','REST','C3','G2','G2','C3','C3'],
      C: ['D3','D3','REST','D3','A2','A2','REST','A2','D3','D3','REST','D3','A2','A2','D3','D3'],
    },
    chords: {
      A: [['G3','B3','D4'], ['C4','E4','G4'], ['D4','Gb4','A4'], ['G3','B3','D4']],
      B: [['C4','E4','G4'], ['G3','B3','D4'], ['A3','C4','E4'], ['G3','B3','D4']],
      C: [['D4','Gb4','A4'], ['G3','B3','D4'], ['A3','Db4','E4'], ['D4','Gb4','A4']],
    },
  },
};

// ============================================================================
// RUSSIA - Minor keys, Slavic feel, dramatic and melancholic (Kalinka/folk feel)
// ============================================================================
const RUSSIA_SONGS = {
  peaceful: {
    sections: ['A', 'A', 'B', 'A', 'C', 'B', 'A', 'A'],
    melodies: {
      A: [
        'A4','REST','E4','F4','E4','D4','C4','REST','D4','E4','REST','A4','G4','E4','D4','REST',
        'E4','A4','G4','F4','E4','REST','D4','C4','D4','E4','REST','F4','E4','D4','C4','REST',
        'A4','REST','A4','REST','G4','F4','E4','D4','C4','REST','D4','E4','F4','E4','D4','REST',
        'E4','REST','F4','E4','D4','C4','D4','E4','A4','REST','G4','F4','E4','REST','REST','REST',
      ],
      B: [
        'E4','REST','F4','G4','A4','REST','G4','F4','E4','REST','D4','E4','F4','G4','A4','REST',
        'A4','G4','F4','E4','D4','REST','C4','D4','E4','REST','F4','E4','D4','C4','REST','REST',
        'A4','REST','G4','REST','F4','REST','E4','REST','D4','REST','C4','REST','D4','E4','REST','REST',
        'E4','F4','G4','A4','G4','F4','E4','D4','C4','D4','E4','REST','REST','REST','REST','REST',
      ],
      C: [
        'A4','REST','A4','B4','C5','REST','B4','A4','G4','REST','F4','G4','A4','B4','C5','REST',
        'C5','B4','A4','G4','F4','REST','E4','F4','G4','REST','A4','G4','F4','E4','REST','REST',
        'A4','B4','C5','D5','C5','B4','A4','REST','G4','A4','B4','C5','B4','A4','G4','REST',
        'F4','G4','A4','B4','A4','G4','F4','E4','D4','E4','F4','G4','A4','REST','REST','REST',
      ],
    },
    bass: {
      A: ['A2','REST','E2','REST','A2','REST','D2','REST','E2','REST','A2','REST','E2','REST','A2','REST'],
      B: ['E2','REST','A2','REST','D2','REST','A2','REST','E2','REST','A2','REST','E2','REST','A2','REST'],
      C: ['A2','REST','A2','REST','G2','REST','F2','REST','E2','REST','A2','REST','E2','REST','A2','REST'],
    },
    chords: {
      A: [['A3','C4','E4'], ['D3','F3','A3'], ['E3','G3','B3'], ['A3','C4','E4']],
      B: [['E3','G3','B3'], ['A3','C4','E4'], ['D3','F3','A3'], ['E3','G3','B3']],
      C: [['A3','C4','E4'], ['G3','B3','D4'], ['F3','A3','C4'], ['E3','G3','B3']],
    },
  },
  tense: {
    sections: ['A', 'B', 'A', 'C', 'B', 'A'],
    melodies: {
      A: [
        'A4','REST','Ab4','A4','E4','REST','F4','E4','D4','REST','E4','F4','Ab4','A4','REST','REST',
        'E4','F4','Ab4','REST','A4','Ab4','F4','E4','REST','D4','E4','F4','REST','E4','D4','REST',
        'A4','Ab4','A4','REST','E4','Ab4','A4','REST','F4','E4','D4','REST','E4','REST','REST','REST',
        'Ab4','A4','Ab4','F4','E4','D4','E4','F4','Ab4','A4','REST','REST','E4','REST','REST','REST',
      ],
      B: [
        'E4','REST','E4','F4','Ab4','REST','A4','Ab4','F4','E4','D4','REST','E4','REST','REST','REST',
        'Ab4','REST','A4','Ab4','F4','REST','E4','D4','E4','REST','F4','Ab4','A4','REST','REST','REST',
        'E4','F4','Ab4','A4','B4','A4','Ab4','F4','E4','D4','E4','REST','REST','REST','REST','REST',
        'A4','Ab4','F4','E4','D4','E4','F4','Ab4','A4','REST','REST','REST','E4','REST','REST','REST',
      ],
      C: [
        'E4','REST','E4','REST','Ab4','REST','A4','REST','B4','REST','A4','REST','Ab4','REST','E4','REST',
        'F4','Ab4','A4','Ab4','F4','E4','D4','E4','F4','Ab4','A4','REST','Ab4','F4','E4','REST',
        'E4','Ab4','A4','E5','Ab4','A4','E4','REST','D4','E4','F4','Ab4','A4','REST','REST','REST',
        'A4','REST','Ab4','REST','F4','REST','E4','REST','D4','REST','E4','REST','A4','REST','REST','REST',
      ],
    },
    bass: {
      A: ['A2','REST','A2','E2','F2','REST','F2','C3','E2','REST','E2','B2','A2','REST','A2','REST'],
      B: ['E2','REST','E2','REST','F2','REST','E2','REST','D2','REST','E2','REST','A2','REST','REST','REST'],
      C: ['E2','REST','E2','REST','F2','REST','F2','REST','E2','REST','A2','REST','E2','REST','A2','REST'],
    },
    chords: {
      A: [['A3','C4','E4'], ['F3','A3','C4'], ['E3','Ab3','B3'], ['A3','C4','E4']],
      B: [['E3','Ab3','B3'], ['F3','A3','C4'], ['D3','F3','A3'], ['E3','Ab3','B3']],
      C: [['E3','Ab3','B3'], ['F3','A3','C4'], ['E3','G3','B3'], ['A3','C4','E4']],
    },
  },
  crisis: {
    sections: ['A', 'A', 'B', 'C', 'A', 'B'],
    melodies: {
      A: [
        'E4','F4','Ab4','E4','F4','Ab4','A4','REST','B4','A4','Ab4','F4','E4','REST','E4','REST',
        'Ab4','B4','A4','Ab4','F4','E4','REST','REST','E4','F4','Ab4','A4','Ab4','F4','E4','REST',
        'E4','REST','Ab4','REST','A4','REST','B4','REST','A4','Ab4','F4','E4','D4','REST','E4','REST',
        'Ab4','A4','B4','A4','Ab4','F4','E4','D4','E4','F4','Ab4','A4','REST','REST','E4','REST',
      ],
      B: [
        'B4','REST','A4','Ab4','F4','E4','D4','E4','F4','Ab4','A4','B4','A4','Ab4','F4','REST',
        'E4','REST','E4','REST','F4','Ab4','A4','REST','B4','A4','Ab4','F4','E4','REST','REST','REST',
        'A4','B4','A4','Ab4','F4','E4','D4','E4','F4','Ab4','A4','REST','REST','REST','REST','REST',
        'E4','F4','Ab4','A4','B4','C5','B4','A4','Ab4','F4','E4','REST','REST','REST','REST','REST',
      ],
      C: [
        'E4','E4','Ab4','E4','B4','A4','Ab4','E4','F4','E4','Ab4','B4','A4','Ab4','E4','REST',
        'B4','A4','Ab4','E4','F4','Ab4','A4','B4','E5','B4','A4','Ab4','E4','Ab4','A4','B4',
        'E4','Ab4','B4','E4','Ab4','B4','A4','Ab4','F4','E4','D4','E4','REST','REST','REST','REST',
        'A4','Ab4','F4','E4','D4','E4','F4','Ab4','A4','B4','A4','Ab4','E4','REST','REST','REST',
      ],
    },
    bass: {
      A: ['E2','E2','REST','E2','F2','F2','REST','F2','A2','A2','REST','A2','E2','REST','E2','REST'],
      B: ['B2','REST','A2','REST','F2','REST','E2','REST','D2','REST','E2','REST','A2','REST','REST','REST'],
      C: ['E2','E2','E2','REST','A2','A2','A2','REST','D2','D2','D2','REST','E2','E2','E2','E2'],
    },
    chords: {
      A: [['E3','Ab3','B3'], ['F3','A3','C4'], ['A3','C4','E4'], ['E3','Ab3','B3']],
      B: [['B3','D4','Gb4'], ['A3','C4','E4'], ['F3','A3','C4'], ['E3','Ab3','B3']],
      C: [['E3','Ab3','B3'], ['A3','C4','E4'], ['D3','F3','A3'], ['E3','Ab3','B3']],
    },
  },
  combat: {
    sections: ['A', 'B', 'A', 'C', 'B', 'A', 'C', 'A'],
    melodies: {
      A: [
        'E4','E4','Ab4','E4','B4','A4','Ab4','E4','F4','E4','Ab4','B4','A4','Ab4','E4','REST',
        'B4','A4','Ab4','E4','F4','Ab4','A4','B4','E5','B4','A4','Ab4','E4','Ab4','A4','B4',
        'E4','E4','E4','Ab4','B4','E5','B4','Ab4','E4','F4','E4','Ab4','B4','E5','B4','Ab4',
        'E4','Ab4','B4','E5','Ab5','E5','B4','Ab4','E4','F4','E4','REST','REST','REST','REST','REST',
      ],
      B: [
        'A4','A4','C5','E5','A4','C5','E5','REST','F5','E5','C5','A4','E4','A4','C5','A4',
        'E4','C4','A3','E4','A4','C5','E5','REST','C5','B4','A4','E4','C4','E4','A4','C5',
        'A4','REST','A4','REST','C5','REST','E5','REST','C5','A4','E4','C4','A3','REST','REST','REST',
        'E5','C5','A4','E4','C4','A3','E4','A4','C5','E5','C5','A4','E4','REST','REST','REST',
      ],
      C: [
        'B4','B4','D5','Gb5','B4','D5','Gb5','REST','A5','Gb5','D5','B4','Gb4','B4','D5','Gb5',
        'D5','B4','Gb4','D4','Gb4','B4','D5','REST','Gb5','D5','B4','Gb4','D4','Gb4','B4','D5',
        'B4','D5','Gb5','B4','D5','Gb5','REST','REST','D5','B4','Gb4','D4','B3','REST','REST','REST',
        'Gb5','D5','B4','Gb4','D4','B3','Gb4','B4','D5','Gb5','REST','REST','B4','REST','REST','REST',
      ],
    },
    bass: {
      A: ['E2','E2','E2','REST','A2','A2','A2','REST','D2','D2','D2','REST','E2','E2','E2','E2'],
      B: ['A2','A2','REST','A2','E2','E2','REST','E2','A2','A2','REST','A2','E2','E2','A2','A2'],
      C: ['B2','B2','REST','B2','Gb2','Gb2','REST','Gb2','B2','B2','REST','B2','Gb2','Gb2','B2','B2'],
    },
    chords: {
      A: [['E3','Ab3','B3'], ['A3','C4','E4'], ['D3','F3','A3'], ['E3','Ab3','B3']],
      B: [['A3','C4','E4'], ['E3','Ab3','B3'], ['F3','A3','C4'], ['E3','Ab3','B3']],
      C: [['B3','D4','Gb4'], ['E3','Ab3','B3'], ['Gb3','A3','Db4'], ['B3','D4','Gb4']],
    },
  },
};

// ============================================================================
// CHINA - Pentatonic scales, traditional feel, C-D-E-G-A pentatonic
// ============================================================================
const CHINA_SONGS = {
  peaceful: {
    sections: ['A', 'A', 'B', 'A', 'C', 'B', 'A', 'A'],
    melodies: {
      A: [
        'E4','REST','G4','A4','REST','C5','A4','REST','G4','E4','REST','D4','E4','REST','G4','REST',
        'C5','A4','G4','REST','E4','D4','REST','C4','D4','E4','G4','REST','A4','G4','E4','REST',
        'A4','REST','G4','E4','D4','REST','C4','D4','E4','G4','A4','REST','G4','E4','D4','REST',
        'E4','G4','A4','C5','A4','G4','E4','REST','D4','E4','G4','A4','G4','E4','REST','REST',
      ],
      B: [
        'C5','REST','A4','G4','E4','REST','D4','C4','D4','E4','G4','REST','A4','C5','A4','REST',
        'G4','REST','E4','D4','C4','REST','D4','E4','G4','REST','A4','G4','E4','D4','REST','REST',
        'A4','C5','D5','C5','A4','G4','E4','REST','D4','E4','G4','A4','C5','A4','G4','REST',
        'E4','G4','A4','G4','E4','D4','C4','REST','D4','E4','G4','E4','D4','REST','REST','REST',
      ],
      C: [
        'D5','REST','C5','A4','G4','REST','E4','G4','A4','C5','D5','REST','C5','A4','G4','REST',
        'E4','REST','G4','A4','C5','D5','C5','REST','A4','G4','E4','D4','C4','REST','REST','REST',
        'C5','D5','E5','D5','C5','A4','G4','REST','E4','G4','A4','C5','D5','C5','A4','REST',
        'G4','A4','C5','D5','C5','A4','G4','E4','D4','E4','G4','A4','G4','REST','REST','REST',
      ],
    },
    bass: {
      A: ['C3','REST','REST','G2','REST','REST','A2','REST','REST','E2','REST','REST','G2','REST','C3','REST'],
      B: ['A2','REST','REST','E2','REST','REST','G2','REST','REST','D3','REST','REST','C3','REST','G2','REST'],
      C: ['D3','REST','REST','A2','REST','REST','G2','REST','REST','C3','REST','REST','G2','REST','C3','REST'],
    },
    chords: {
      A: [['C4','E4','G4'], ['D4','G4','A4'], ['E4','G4','C5'], ['C4','E4','G4']],
      B: [['A3','C4','E4'], ['G3','C4','D4'], ['E3','G3','A3'], ['C4','E4','G4']],
      C: [['D4','G4','A4'], ['C4','E4','G4'], ['A3','C4','E4'], ['G3','C4','D4']],
    },
  },
  tense: {
    sections: ['A', 'B', 'A', 'C', 'B', 'A'],
    melodies: {
      A: [
        'D4','REST','E4','G4','REST','A4','C5','REST','A4','G4','REST','E4','D4','REST','E4','REST',
        'G4','A4','C5','REST','D5','C5','A4','REST','G4','E4','D4','REST','E4','G4','A4','REST',
        'D4','REST','D4','REST','E4','REST','G4','REST','A4','G4','E4','D4','REST','REST','REST','REST',
        'E4','G4','A4','G4','E4','D4','C4','D4','E4','G4','A4','REST','G4','E4','D4','REST',
      ],
      B: [
        'A4','REST','C5','D5','E5','REST','D5','C5','A4','REST','G4','A4','C5','D5','REST','REST',
        'E5','D5','C5','A4','G4','REST','E4','G4','A4','REST','C5','A4','G4','E4','REST','REST',
        'D5','REST','C5','A4','G4','REST','E4','D4','C4','D4','E4','G4','A4','REST','REST','REST',
        'A4','C5','D5','C5','A4','G4','E4','D4','E4','G4','A4','REST','REST','REST','REST','REST',
      ],
      C: [
        'E4','REST','E4','REST','G4','REST','A4','REST','C5','REST','D5','REST','C5','REST','A4','REST',
        'G4','A4','C5','D5','E5','D5','C5','A4','G4','E4','D4','REST','E4','G4','A4','REST',
        'E5','REST','D5','C5','A4','REST','G4','E4','D4','REST','C4','D4','E4','G4','A4','REST',
        'C5','D5','E5','D5','C5','A4','G4','E4','D4','E4','G4','A4','REST','REST','REST','REST',
      ],
    },
    bass: {
      A: ['D3','REST','A2','REST','E2','REST','G2','REST','A2','REST','D3','REST','G2','REST','A2','REST'],
      B: ['A2','REST','E3','REST','D3','REST','A2','REST','G2','REST','C3','REST','A2','REST','REST','REST'],
      C: ['E2','REST','A2','REST','C3','REST','D3','REST','A2','REST','E2','REST','A2','REST','REST','REST'],
    },
    chords: {
      A: [['D4','G4','A4'], ['E4','A4','C5'], ['G4','C5','D5'], ['D4','G4','A4']],
      B: [['A3','C4','E4'], ['D4','G4','A4'], ['E4','G4','C5'], ['A3','C4','E4']],
      C: [['E4','G4','A4'], ['A3','D4','E4'], ['C4','E4','G4'], ['D4','G4','A4']],
    },
  },
  crisis: {
    sections: ['A', 'A', 'B', 'C', 'A', 'B'],
    melodies: {
      A: [
        'A4','REST','E4','REST','A4','C5','A4','REST','E4','G4','A4','REST','E4','D4','E4','REST',
        'E4','A4','C5','A4','E4','REST','D4','E4','G4','A4','G4','E4','D4','REST','E4','REST',
        'A4','REST','A4','REST','G4','E4','D4','REST','E4','G4','A4','REST','E4','D4','REST','REST',
        'E4','A4','C5','D5','C5','A4','G4','E4','D4','E4','G4','A4','REST','REST','REST','REST',
      ],
      B: [
        'E5','REST','D5','C5','A4','REST','G4','E4','D4','REST','E4','G4','A4','C5','D5','REST',
        'C5','A4','G4','E4','D4','REST','C4','D4','E4','G4','A4','REST','G4','E4','D4','REST',
        'A4','C5','D5','E5','D5','C5','A4','REST','G4','A4','C5','D5','C5','A4','G4','REST',
        'E4','G4','A4','C5','A4','G4','E4','D4','C4','D4','E4','G4','A4','REST','REST','REST',
      ],
      C: [
        'A4','A4','REST','A4','A4','REST','C5','A4','G4','REST','A4','A4','REST','A4','C5','REST',
        'D5','REST','D5','REST','C5','REST','A4','REST','G4','REST','E4','REST','A4','REST','REST','REST',
        'A4','C5','D5','E5','A5','REST','G5','E5','D5','REST','C5','A4','G4','REST','REST','REST',
        'E5','D5','C5','A4','G4','E4','D4','E4','G4','A4','C5','D5','A4','REST','REST','REST',
      ],
    },
    bass: {
      A: ['A2','REST','A2','E2','A2','REST','D2','REST','E2','REST','A2','REST','E2','REST','A2','REST'],
      B: ['E2','REST','D2','REST','C2','REST','D2','REST','E2','REST','A2','REST','E2','REST','REST','REST'],
      C: ['A2','A2','REST','A2','D2','REST','E2','REST','A2','REST','D2','REST','E2','REST','A2','REST'],
    },
    chords: {
      A: [['A3','C4','E4'], ['D4','G4','A4'], ['E4','G4','A4'], ['A3','C4','E4']],
      B: [['E4','G4','A4'], ['D4','G4','A4'], ['C4','E4','G4'], ['E4','G4','A4']],
      C: [['A3','C4','E4'], ['D4','G4','A4'], ['E4','A4','C5'], ['A3','C4','E4']],
    },
  },
  combat: {
    sections: ['A', 'B', 'A', 'C', 'B', 'A', 'C', 'A'],
    melodies: {
      A: [
        'A4','C5','D5','A4','E4','A4','C5','D5','E5','D5','C5','A4','E4','A4','C5','D5',
        'E5','D5','C5','A4','G4','A4','C5','REST','D5','C5','A4','G4','E4','G4','A4','C5',
        'A4','A4','A4','C5','D5','A5','D5','C5','A4','E4','A4','C5','D5','E5','D5','C5',
        'A4','C5','D5','E5','A5','E5','D5','C5','A4','E4','A4','REST','REST','REST','REST','REST',
      ],
      B: [
        'E5','E5','G5','A5','E5','G5','A5','REST','D5','C5','A4','E4','A4','E5','G5','E5',
        'A4','G4','E4','A4','E5','G5','A5','REST','G5','E5','D5','A4','E4','A4','E5','G5',
        'E5','REST','E5','REST','G5','REST','A5','REST','G5','E5','D5','A4','E4','REST','REST','REST',
        'A5','G5','E5','D5','A4','E4','A4','E5','G5','A5','G5','E5','A4','REST','REST','REST',
      ],
      C: [
        'D5','D5','E5','G5','D5','E5','G5','REST','A5','G5','E5','D5','A4','D5','E5','G5',
        'E5','D5','A4','D4','A4','D5','E5','REST','G5','E5','D5','A4','D4','A4','D5','E5',
        'D5','E5','G5','D5','E5','G5','REST','REST','E5','D5','A4','E4','D4','REST','REST','REST',
        'G5','E5','D5','A4','E4','D4','A4','D5','E5','G5','REST','REST','D5','REST','REST','REST',
      ],
    },
    bass: {
      A: ['A2','A2','REST','A2','E2','E2','REST','E2','A2','A2','REST','A2','E2','E2','A2','A2'],
      B: ['E2','E2','REST','E2','A2','A2','REST','A2','D2','D2','REST','D2','A2','A2','E2','E2'],
      C: ['D2','D2','REST','D2','A2','A2','REST','A2','D2','D2','REST','D2','A2','A2','D2','D2'],
    },
    chords: {
      A: [['A3','C4','E4'], ['D4','G4','A4'], ['E4','G4','A4'], ['A3','C4','E4']],
      B: [['E4','G4','A4'], ['A3','C4','E4'], ['D4','G4','A4'], ['E4','G4','A4']],
      C: [['D4','G4','A4'], ['A3','C4','E4'], ['E4','G4','A4'], ['D4','G4','A4']],
    },
  },
};

// ============================================================================
// EU - Classical European, baroque/romantic feel, refined
// ============================================================================
const EU_SONGS = {
  peaceful: {
    sections: ['A', 'A', 'B', 'A', 'C', 'B', 'A', 'A'],
    melodies: {
      A: [
        'C4','D4','E4','F4','G4','REST','A4','G4','F4','E4','D4','REST','C4','E4','G4','REST',
        'G4','F4','E4','D4','C4','REST','D4','E4','F4','G4','A4','REST','G4','F4','E4','REST',
        'E4','F4','G4','A4','B4','REST','C5','B4','A4','G4','F4','REST','E4','G4','C5','REST',
        'C5','B4','A4','G4','F4','E4','D4','REST','C4','D4','E4','F4','G4','REST','REST','REST',
      ],
      B: [
        'G4','REST','A4','B4','C5','REST','D5','C5','B4','A4','G4','REST','F4','G4','A4','REST',
        'B4','A4','G4','F4','E4','REST','F4','G4','A4','REST','B4','A4','G4','F4','REST','REST',
        'C5','D5','E5','D5','C5','B4','A4','REST','G4','A4','B4','C5','B4','A4','G4','REST',
        'F4','G4','A4','B4','A4','G4','F4','E4','D4','E4','F4','G4','C4','REST','REST','REST',
      ],
      C: [
        'E5','REST','D5','C5','B4','REST','A4','G4','F4','E4','D4','REST','C4','E4','G4','REST',
        'G4','A4','B4','C5','D5','E5','D5','REST','C5','B4','A4','G4','F4','REST','REST','REST',
        'C5','B4','A4','G4','F4','E4','D4','C4','D4','E4','F4','G4','A4','B4','C5','REST',
        'E5','D5','C5','B4','A4','G4','F4','E4','D4','E4','F4','G4','C4','REST','REST','REST',
      ],
    },
    bass: {
      A: ['C3','REST','G2','REST','C3','REST','E2','REST','F2','REST','C3','REST','G2','REST','C3','REST'],
      B: ['G2','REST','D3','REST','G2','REST','B2','REST','E2','REST','G2','REST','D3','REST','G2','REST'],
      C: ['E2','REST','A2','REST','D2','REST','G2','REST','C3','REST','F2','REST','G2','REST','C3','REST'],
    },
    chords: {
      A: [['C4','E4','G4'], ['G3','B3','D4'], ['A3','C4','E4'], ['F3','A3','C4']],
      B: [['G3','B3','D4'], ['E3','G3','B3'], ['F3','A3','C4'], ['G3','B3','D4']],
      C: [['E4','G4','B4'], ['A3','C4','E4'], ['D4','F4','A4'], ['G3','B3','D4']],
    },
  },
  tense: {
    sections: ['A', 'B', 'A', 'C', 'B', 'A'],
    melodies: {
      A: [
        'G4','REST','A4','B4','C5','B4','A4','REST','G4','Gb4','E4','D4','REST','E4','Gb4','REST',
        'B4','A4','G4','Gb4','E4','REST','D4','E4','Gb4','G4','A4','REST','B4','A4','G4','REST',
        'G4','REST','G4','REST','A4','B4','C5','REST','B4','A4','G4','Gb4','E4','REST','REST','REST',
        'B4','A4','G4','Gb4','E4','D4','E4','Gb4','G4','A4','B4','REST','G4','REST','REST','REST',
      ],
      B: [
        'E4','REST','Gb4','G4','A4','REST','B4','A4','G4','Gb4','E4','REST','D4','E4','Gb4','REST',
        'G4','Gb4','E4','D4','C4','REST','D4','E4','Gb4','REST','G4','Gb4','E4','D4','REST','REST',
        'A4','B4','C5','D5','C5','B4','A4','REST','G4','A4','B4','C5','B4','A4','G4','REST',
        'Gb4','G4','A4','B4','A4','G4','Gb4','E4','D4','E4','Gb4','G4','REST','REST','REST','REST',
      ],
      C: [
        'D4','REST','D4','REST','E4','Gb4','G4','REST','A4','REST','B4','REST','A4','REST','G4','REST',
        'Gb4','G4','A4','B4','C5','B4','A4','G4','Gb4','E4','D4','REST','E4','Gb4','G4','REST',
        'B4','REST','A4','G4','Gb4','REST','E4','D4','C4','D4','E4','Gb4','G4','REST','REST','REST',
        'A4','B4','C5','B4','A4','G4','Gb4','E4','D4','E4','Gb4','G4','REST','REST','REST','REST',
      ],
    },
    bass: {
      A: ['G2','REST','D3','REST','G2','REST','B2','REST','E2','REST','G2','REST','D3','REST','G2','REST'],
      B: ['E2','REST','A2','REST','D2','REST','G2','REST','C3','REST','F2','REST','G2','REST','REST','REST'],
      C: ['D2','REST','G2','REST','A2','REST','D3','REST','G2','REST','D2','REST','G2','REST','REST','REST'],
    },
    chords: {
      A: [['G3','B3','D4'], ['E3','G3','B3'], ['C4','E4','G4'], ['D4','Gb4','A4']],
      B: [['E3','G3','B3'], ['A3','C4','E4'], ['D3','Gb3','A3'], ['G3','B3','D4']],
      C: [['D3','Gb3','A3'], ['G3','B3','D4'], ['A3','C4','E4'], ['D4','Gb4','A4']],
    },
  },
  crisis: {
    sections: ['A', 'A', 'B', 'C', 'A', 'B'],
    melodies: {
      A: [
        'D4','REST','F4','A4','D5','REST','C5','Bb4','A4','REST','G4','F4','E4','D4','REST','REST',
        'A4','Bb4','C5','D5','REST','C5','Bb4','A4','G4','F4','REST','E4','F4','G4','A4','REST',
        'D4','REST','D4','REST','F4','A4','D5','REST','C5','Bb4','A4','G4','F4','REST','REST','REST',
        'A4','Bb4','C5','D5','C5','Bb4','A4','G4','F4','G4','A4','Bb4','D4','REST','REST','REST',
      ],
      B: [
        'F4','REST','G4','A4','Bb4','REST','C5','Bb4','A4','G4','F4','REST','E4','F4','G4','REST',
        'A4','G4','F4','E4','D4','REST','E4','F4','G4','REST','A4','G4','F4','E4','REST','REST',
        'Bb4','C5','D5','Eb5','D5','C5','Bb4','REST','A4','Bb4','C5','D5','C5','Bb4','A4','REST',
        'G4','A4','Bb4','C5','Bb4','A4','G4','F4','E4','F4','G4','A4','D4','REST','REST','REST',
      ],
      C: [
        'D5','REST','D5','REST','C5','Bb4','A4','REST','G4','F4','E4','D4','E4','F4','G4','REST',
        'A4','Bb4','C5','D5','Eb5','D5','C5','Bb4','A4','G4','F4','REST','E4','F4','G4','REST',
        'D5','Eb5','F5','Eb5','D5','C5','Bb4','A4','G4','A4','Bb4','C5','D5','REST','REST','REST',
        'A4','Bb4','C5','D5','C5','Bb4','A4','G4','F4','G4','A4','Bb4','D4','REST','REST','REST',
      ],
    },
    bass: {
      A: ['D2','REST','A2','REST','Bb2','REST','F2','REST','A2','REST','D2','REST','A2','REST','D2','REST'],
      B: ['F2','REST','C3','REST','F2','REST','A2','REST','Bb2','REST','F2','REST','C3','REST','REST','REST'],
      C: ['D2','REST','D2','REST','Bb2','REST','A2','REST','G2','REST','D2','REST','A2','REST','D2','REST'],
    },
    chords: {
      A: [['D3','F3','A3'], ['Bb3','D4','F4'], ['A3','C4','E4'], ['D3','F3','A3']],
      B: [['F3','A3','C4'], ['Bb3','D4','F4'], ['G3','Bb3','D4'], ['A3','C4','E4']],
      C: [['D4','F4','A4'], ['Bb3','D4','F4'], ['A3','C4','E4'], ['D3','F3','A3']],
    },
  },
  combat: {
    sections: ['A', 'B', 'A', 'C', 'B', 'A', 'C', 'A'],
    melodies: {
      A: [
        'A4','C5','E5','A4','Ab4','B4','E5','REST','A4','C5','E5','F5','E5','C5','A4','Ab4',
        'E5','C5','A4','Ab4','E4','Ab4','A4','C5','E5','F5','E5','C5','Ab4','A4','REST','E5',
        'A4','A4','A4','C5','E5','A5','E5','C5','A4','Ab4','A4','C5','E5','A5','E5','C5',
        'A4','C5','E5','A5','C6','A5','E5','C5','A4','Ab4','A4','REST','REST','REST','REST','REST',
      ],
      B: [
        'E5','E5','G5','B5','E5','G5','B5','REST','A5','G5','E5','B4','E4','E5','G5','E5',
        'B4','Ab4','E4','B4','E5','G5','B5','REST','G5','E5','C5','B4','Ab4','B4','E5','G5',
        'E5','REST','E5','REST','G5','REST','B5','REST','G5','E5','C5','B4','Ab4','REST','REST','REST',
        'B5','G5','E5','C5','B4','Ab4','B4','E5','G5','B5','G5','E5','B4','REST','REST','REST',
      ],
      C: [
        'D5','D5','F5','A5','D5','F5','A5','REST','Bb5','A5','F5','D5','A4','D5','F5','A5',
        'F5','D5','A4','D4','A4','D5','F5','REST','A5','F5','D5','A4','D4','A4','D5','F5',
        'D5','F5','A5','D5','F5','A5','REST','REST','F5','D5','A4','F4','D4','REST','REST','REST',
        'A5','F5','D5','A4','F4','D4','A4','D5','F5','A5','REST','REST','D5','REST','REST','REST',
      ],
    },
    bass: {
      A: ['A2','A2','REST','A2','E2','E2','REST','E2','A2','A2','REST','A2','E2','E2','A2','A2'],
      B: ['E2','E2','REST','E2','B2','B2','REST','B2','E2','E2','REST','E2','B2','B2','E2','E2'],
      C: ['D2','D2','REST','D2','A2','A2','REST','A2','D2','D2','REST','D2','A2','A2','D2','D2'],
    },
    chords: {
      A: [['A3','C4','E4'], ['E3','Ab3','B3'], ['F3','A3','C4'], ['E3','Ab3','B3']],
      B: [['E3','Ab3','B3'], ['A3','C4','E4'], ['B3','D4','Gb4'], ['E3','Ab3','B3']],
      C: [['D3','F3','A3'], ['Bb3','D4','F4'], ['A3','C4','E4'], ['D3','F3','A3']],
    },
  },
};

// Neutral/Menu (ambient, atmospheric)
const NEUTRAL_SONGS = {
  peaceful: {
    sections: ['A', 'A', 'B', 'A', 'C', 'B', 'A', 'A'],
    melodies: {
      A: [
        'E4','G4','A4','G4','E4','D4','C4','D4','E4','REST','G4','E4','D4','C4','D4','E4',
        'C4','D4','E4','G4','A4','G4','E4','REST','C4','E4','G4','A4','G4','E4','D4','C4',
        'E4','REST','G4','REST','A4','REST','G4','REST','E4','D4','C4','REST','D4','E4','REST','REST',
        'G4','A4','G4','E4','D4','C4','D4','E4','G4','REST','E4','D4','C4','REST','REST','REST',
      ],
      B: [
        'A4','REST','G4','E4','D4','REST','C4','D4','E4','G4','A4','REST','G4','E4','D4','REST',
        'C4','REST','D4','E4','G4','REST','A4','G4','E4','REST','D4','C4','D4','E4','REST','REST',
        'E4','G4','A4','C5','A4','G4','E4','REST','D4','E4','G4','A4','G4','E4','D4','REST',
        'C4','D4','E4','G4','E4','D4','C4','REST','D4','E4','G4','E4','D4','REST','REST','REST',
      ],
      C: [
        'C5','REST','A4','G4','E4','REST','D4','C4','D4','E4','G4','A4','G4','E4','D4','REST',
        'E4','REST','G4','A4','C5','REST','A4','G4','E4','D4','C4','D4','E4','REST','REST','REST',
        'G4','A4','C5','A4','G4','E4','D4','REST','C4','D4','E4','G4','A4','G4','E4','REST',
        'D4','E4','G4','A4','G4','E4','D4','C4','D4','E4','G4','A4','G4','REST','REST','REST',
      ],
    },
    bass: {
      A: ['C2','REST','G2','REST','C2','REST','G2','REST','A2','REST','E2','REST','F2','REST','G2','REST'],
      B: ['A2','REST','E2','REST','A2','REST','E2','REST','C2','REST','G2','REST','A2','REST','E2','REST'],
      C: ['C2','REST','G2','REST','A2','REST','E2','REST','F2','REST','G2','REST','C2','REST','G2','REST'],
    },
    chords: {
      A: [['C4','E4','G4'], ['A3','C4','E4'], ['F3','A3','C4'], ['G3','B3','D4']],
      B: [['A3','C4','E4'], ['E3','G3','B3'], ['F3','A3','C4'], ['G3','B3','D4']],
      C: [['C4','E4','G4'], ['A3','C4','E4'], ['F3','A3','C4'], ['G3','B3','D4']],
    },
  },
  tense: {
    sections: ['A', 'B', 'A', 'C', 'B', 'A'],
    melodies: {
      A: [
        'A4','REST','E4','REST','A4','G4','E4','REST','A4','REST','B4','A4','G4','E4','REST','REST',
        'E4','A4','REST','E4','G4','REST','A4','G4','E4','REST','REST','A4','G4','E4','REST','D4',
        'A4','REST','A4','REST','G4','E4','D4','REST','E4','G4','A4','REST','E4','D4','REST','REST',
        'E4','A4','G4','E4','D4','C4','D4','E4','A4','REST','G4','E4','D4','REST','REST','REST',
      ],
      B: [
        'E4','REST','E4','E4','F4','REST','E4','D4','E4','REST','E4','F4','E4','D4','REST','E4',
        'A4','REST','A4','REST','G4','REST','E4','REST','D4','REST','E4','REST','A4','REST','REST','REST',
        'E4','F4','G4','A4','G4','F4','E4','D4','E4','F4','G4','A4','REST','REST','REST','REST',
        'A4','G4','E4','D4','E4','G4','A4','REST','G4','E4','D4','REST','E4','REST','REST','REST',
      ],
      C: [
        'E4','REST','E4','REST','G4','REST','A4','REST','B4','REST','A4','REST','G4','REST','E4','REST',
        'F4','G4','A4','G4','F4','E4','D4','E4','F4','G4','A4','REST','G4','F4','E4','REST',
        'A4','REST','G4','E4','D4','REST','E4','G4','A4','REST','G4','E4','D4','REST','REST','REST',
        'E4','G4','A4','G4','E4','D4','C4','D4','E4','G4','A4','REST','REST','REST','REST','REST',
      ],
    },
    bass: {
      A: ['A2','REST','A2','A2','E2','REST','E2','E2','D2','REST','D2','D2','A2','REST','A2','A2'],
      B: ['E2','E2','REST','E2','F2','F2','REST','F2','E2','E2','REST','E2','D2','D2','REST','D2'],
      C: ['E2','REST','A2','REST','D2','REST','E2','REST','A2','REST','E2','REST','A2','REST','REST','REST'],
    },
    chords: {
      A: [['A3','C4','E4'], ['E3','G3','B3'], ['D3','F3','A3'], ['A3','C4','E4']],
      B: [['E3','G3','B3'], ['F3','A3','C4'], ['E3','G3','B3'], ['D3','F3','A3']],
      C: [['E3','G3','B3'], ['A3','C4','E4'], ['D3','F3','A3'], ['E3','G3','B3']],
    },
  },
  crisis: RUSSIA_SONGS.crisis,
  combat: RUSSIA_SONGS.combat,
};

// Map factions to song data
const FACTION_SONGS: Record<FactionStyle, typeof USA_SONGS> = {
  usa: USA_SONGS,
  russia: RUSSIA_SONGS,
  china: CHINA_SONGS,
  eu: EU_SONGS,
  canada: USA_SONGS, // Similar to USA
  norway: EU_SONGS, // Nordic/European
  denmark: EU_SONGS, // Nordic/European
  neutral: NEUTRAL_SONGS,
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
  private currentSection = 0;
  private currentSectionBeat = 0;

  constructor() {}

  private initAudio(): boolean {
    if (this.audioContext) return true;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.25;
      return true;
    } catch (e) {
      console.warn('Web Audio API not supported');
      return false;
    }
  }

  private playNote(
    frequency: number,
    startTime: number,
    duration: number,
    volume: number = 0.2,
    type: OscillatorType = 'triangle'
  ): void {
    if (!this.audioContext || !this.masterGain || frequency === 0) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    oscillator.type = type;
    oscillator.frequency.value = frequency;

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

  private playArpeggio(notes: string[], startTime: number, totalDuration: number, volume: number = 0.1): void {
    const noteDuration = totalDuration / notes.length;
    notes.forEach((note, i) => {
      const freq = NOTES[note];
      if (freq) {
        this.playNote(freq, startTime + i * noteDuration, noteDuration * 0.9, volume, 'sine');
      }
    });
  }

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

  private getSongData() {
    const songs = FACTION_SONGS[this.currentFaction] || NEUTRAL_SONGS;
    const moodKey = this.currentMood === 'menu' || this.currentMood === 'victory' || this.currentMood === 'defeat'
      ? 'peaceful' : this.currentMood;
    return songs[moodKey] || songs.peaceful;
  }

  private scheduleNextBeat(): void {
    if (!this.audioContext || !this.isPlaying) return;

    const currentTime = this.audioContext.currentTime;
    const beatDuration = 60 / this.bpm / 4;

    while (this.scheduledTime < currentTime + this.lookahead) {
      const songData = this.getSongData();
      const sections = songData.sections;
      const sectionKey = sections[this.currentSection % sections.length];

      const melody = (songData.melodies as Record<string, string[]>)[sectionKey];
      const bass = (songData.bass as Record<string, string[]>)[sectionKey];
      const chords = (songData.chords as Record<string, string[][]>)[sectionKey];

      const beatInSection = this.currentSectionBeat % 64;
      const barIndex = Math.floor(beatInSection / 16) % chords.length;

      // Melody
      if (melody && melody[beatInSection]) {
        const melodyNote = melody[beatInSection];
        if (melodyNote && melodyNote !== 'REST') {
          const freq = NOTES[melodyNote];
          if (freq) {
            const waveType: OscillatorType = this.currentFaction === 'china' ? 'sine'
              : this.currentFaction === 'russia' ? 'sawtooth' : 'triangle';
            this.playNote(freq, this.scheduledTime, beatDuration * 0.85, 0.15, waveType);
          }
        }
      }

      // Bass (every 2 beats)
      if (beatInSection % 2 === 0 && bass) {
        const bassNote = bass[beatInSection % bass.length];
        if (bassNote && bassNote !== 'REST') {
          const freq = NOTES[bassNote];
          if (freq) {
            this.playNote(freq, this.scheduledTime, beatDuration * 1.5, 0.18, 'sine');
          }
        }
      }

      // Chord arpeggio (start of each bar)
      if (beatInSection % 16 === 0 && chords) {
        const chord = chords[barIndex];
        if (chord) {
          this.playArpeggio(chord, this.scheduledTime, beatDuration * 3, 0.08);
        }
      }

      // Drums
      const softDrums = this.currentMood !== 'combat' && this.currentMood !== 'crisis';
      if (this.currentMood === 'combat') {
        if (beatInSection % 4 === 0) this.playDrum(this.scheduledTime, 'kick', false);
        if (beatInSection % 4 === 2) this.playDrum(this.scheduledTime, 'snare', false);
        if (beatInSection % 2 === 1) this.playDrum(this.scheduledTime, 'hihat', true);
      } else if (this.currentMood === 'crisis') {
        if (beatInSection === 0 || beatInSection === 32) this.playDrum(this.scheduledTime, 'kick', false);
        if (beatInSection === 16 || beatInSection === 48) this.playDrum(this.scheduledTime, 'snare', true);
      } else if (this.currentMood === 'tense') {
        if (beatInSection === 0) this.playDrum(this.scheduledTime, 'kick', softDrums);
        if (beatInSection === 48) this.playDrum(this.scheduledTime, 'hihat', softDrums);
      } else {
        if (beatInSection === 0) this.playDrum(this.scheduledTime, 'kick', true);
        if (beatInSection === 32) this.playDrum(this.scheduledTime, 'hihat', true);
      }

      this.scheduledTime += beatDuration;
      this.currentSectionBeat++;
      this.beatIndex++;

      // Move to next section after 64 beats (4 bars)
      if (this.currentSectionBeat >= 64) {
        this.currentSectionBeat = 0;
        this.currentSection++;
      }
    }
  }

  public start(): void {
    if (this.isPlaying) return;
    if (!this.initAudio()) return;

    this.isPlaying = true;
    this.scheduledTime = this.audioContext!.currentTime;
    this.beatIndex = 0;
    this.currentSection = 0;
    this.currentSectionBeat = 0;

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
      'usa': 'usa', 'russia': 'russia', 'china': 'china', 'eu': 'eu',
      'canada': 'canada', 'norway': 'norway', 'denmark': 'denmark',
    };
    this.currentFaction = factionMap[faction.toLowerCase()] || 'neutral';
  }

  public setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume * 0.5));
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
