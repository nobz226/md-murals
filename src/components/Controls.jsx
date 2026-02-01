import { useState } from 'react';

function Controls({ currentZoom, setCurrentZoom, isZoomMode }) {
  const [soundEnabled, setSoundEnabled] = useState(false);

  const handleZoom = (level) => {
    if (isZoomMode) return;
    setCurrentZoom(level);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const percentage = Math.round(currentZoom * 100);

  return (
    <div className="controls-container visible">
      <div className="percentage-indicator">
        {percentage}%
      </div>
      <div className="switch">
        <button 
          className={`switch-button ${currentZoom === 0.3 ? 'switch-button-current' : ''}`}
          onClick={() => handleZoom(0.3)}
        >
          <span className="indicator-dot"></span>
          ZOOM OUT
        </button>
        <button 
          className={`switch-button ${currentZoom === 0.6 ? 'switch-button-current' : ''}`}
          onClick={() => handleZoom(0.6)}
        >
          <span className="indicator-dot"></span>
          NORMAL
        </button>
        <button 
          className={`switch-button ${currentZoom === 1.0 ? 'switch-button-current' : ''}`}
          onClick={() => handleZoom(1.0)}
        >
          <span className="indicator-dot"></span>
          ZOOM IN
        </button>
        <button className="switch-button">
          <span className="indicator-dot"></span>
          FIT
        </button>
      </div>
      <button 
        className={`sound-toggle ${soundEnabled ? 'active' : ''}`}
        onClick={toggleSound}
      >
        <canvas className="sound-wave-canvas" width="32" height="16"></canvas>
      </button>
    </div>
  );
}

export default Controls;
