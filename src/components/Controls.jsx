import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSoundSystem } from '../hooks/useSoundSystem';

function Controls({ currentZoom, setCurrentZoom, isZoomMode, onAutoFit }) {
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundSystem();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const handleZoom = (level) => {
    if (isZoomMode) return;
    setCurrentZoom(level);
  };

  const handleAutoFit = () => {
    if (isZoomMode) return;
    if (onAutoFit) onAutoFit();
  };

  // Sound wave animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 32;
    const height = 16;
    const centerY = Math.floor(height / 2);
    let startTime = Date.now();
    let currentAmplitude = soundEnabled ? 1 : 0;

    const interpolateColor = (color1, color2, factor) => {
      const c1 = {
        r: parseInt(color1.slice(1, 3), 16),
        g: parseInt(color1.slice(3, 5), 16),
        b: parseInt(color1.slice(5, 7), 16)
      };
      const c2 = {
        r: parseInt(color2.slice(1, 3), 16),
        g: parseInt(color2.slice(3, 5), 16),
        b: parseInt(color2.slice(5, 7), 16)
      };
      return `rgb(${
        Math.round(c1.r + (c2.r - c1.r) * factor)
      }, ${
        Math.round(c1.g + (c2.g - c1.g) * factor)
      }, ${
        Math.round(c1.b + (c2.b - c1.b) * factor)
      })`;
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const targetAmplitude = soundEnabled ? 1 : 0;
      currentAmplitude += (targetAmplitude - currentAmplitude) * 0.1;

      ctx.clearRect(0, 0, width, height);

      const mutedColor = '#666666';
      const activeColor = '#333333';
      const waveColor = interpolateColor(mutedColor, activeColor, currentAmplitude);

      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const frequency = 0.15;
        const wave = Math.sin((x + elapsed * 0.05) * frequency) * (2 + currentAmplitude * 3);
        const y = centerY + wave;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [soundEnabled]);

  const percentage = Math.round(currentZoom * 100);

  return (
    <div className={`controls-container visible ${isZoomMode ? 'split-mode' : ''}`}>
      <div className="percentage-indicator">
        {percentage}%
      </div>
      <div className="switch">
        <button 
          className={`switch-button ${currentZoom === 0.3 ? 'switch-button-current' : ''}`}
          onClick={() => handleZoom(0.3)}
          disabled={isZoomMode}
        >
          <span className="indicator-dot"></span>
          ZOOM OUT
        </button>
        <button 
          className={`switch-button ${currentZoom === 0.6 ? 'switch-button-current' : ''}`}
          onClick={() => handleZoom(0.6)}
          disabled={isZoomMode}
        >
          <span className="indicator-dot"></span>
          NORMAL
        </button>
        <button 
          className={`switch-button ${currentZoom === 1.0 ? 'switch-button-current' : ''}`}
          onClick={() => handleZoom(1.0)}
          disabled={isZoomMode}
        >
          <span className="indicator-dot"></span>
          ZOOM IN
        </button>
        <button 
          className="switch-button"
          onClick={handleAutoFit}
          disabled={isZoomMode}
        >
          <span className="indicator-dot"></span>
          FIT
        </button>
      </div>
      <button 
        className={`sound-toggle ${soundEnabled ? 'active' : ''}`}
        onClick={toggleSound}
      >
        <canvas ref={canvasRef} className="sound-wave-canvas" width="32" height="16"></canvas>
      </button>
    </div>
  );
}

export default Controls;
