import React, { useState, useEffect } from 'react';
import { getChiptuneEngine, ChiptuneEngine } from '../audio/ChiptuneEngine';
import { TensionLevel } from '../types/game';

interface AudioControlsProps {
  maxTension?: TensionLevel;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ maxTension }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [engine] = useState<ChiptuneEngine>(() => getChiptuneEngine());

  // Update music mood based on game tension
  useEffect(() => {
    if (maxTension) {
      engine.setMood(ChiptuneEngine.tensionToMood(maxTension));
    }
  }, [maxTension, engine]);

  const toggleMusic = () => {
    if (isPlaying) {
      engine.stop();
      setIsPlaying(false);
    } else {
      engine.start();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    engine.setVolume(newVolume / 100);
  };

  const playSfx = (type: 'click' | 'alert' | 'success' | 'warning' | 'action') => {
    engine.playSfx(type);
  };

  return (
    <div className="audio-controls">
      <button
        className={`music-toggle ${isPlaying ? 'playing' : ''}`}
        onClick={toggleMusic}
        title={isPlaying ? 'Stop Music' : 'Play Music'}
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>

      {isPlaying && (
        <div className="volume-control">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
          <span className="volume-value">{volume}%</span>
        </div>
      )}

      <div className="sfx-buttons">
        <button onClick={() => playSfx('click')} title="Test Click">🔔</button>
      </div>
    </div>
  );
};

// Hook to play sound effects
export const useSfx = () => {
  const engine = getChiptuneEngine();

  return {
    playClick: () => engine.playSfx('click'),
    playAlert: () => engine.playSfx('alert'),
    playSuccess: () => engine.playSfx('success'),
    playWarning: () => engine.playSfx('warning'),
    playAction: () => engine.playSfx('action'),
  };
};

export default AudioControls;
