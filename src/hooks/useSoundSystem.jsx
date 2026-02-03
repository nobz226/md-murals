import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(false);
  const sounds = useQuery(api.sounds.getAllSounds);
  const audioRefs = useRef({});
  const enabledRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Preload all sounds when they're available
  useEffect(() => {
    if (!sounds) return;

    sounds.forEach((sound) => {
      if (!audioRefs.current[sound.type]) {
        const audio = new Audio(sound.url);
        audio.preload = 'auto';
        audio.volume = 0.5; // Set default volume to 50%
        audioRefs.current[sound.type] = audio;
      } else {
        // Update URL if sound changed
        audioRefs.current[sound.type].src = sound.url;
      }
    });
  }, [sounds]);

  const play = (soundType) => {
    // Use ref to get current enabled state
    if (!enabledRef.current) return;
    
    const audio = audioRefs.current[soundType];
    if (audio) {
      // Reset to beginning and play
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.log('Audio play prevented:', error);
      });
    }
  };

  const toggle = () => {
    setEnabled(!enabled);
  };

  return (
    <SoundContext.Provider value={{ enabled, play, toggle }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundSystem() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundSystem must be used within SoundProvider');
  }
  return context;
}
