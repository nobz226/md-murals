import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

function GalleryControls() {
  const settings = useQuery(api.gallerySettings.getGallerySettings);
  const updateSettings = useMutation(api.gallerySettings.updateGallerySettings);
  const resetSettings = useMutation(api.gallerySettings.resetGallerySettings);
  
  const [localSettings, setLocalSettings] = useState({
    tileSize: 320,
    rows: 3,
    cols: 13,
    startPosition: 'left',
    enableTileHoverZoom: true,
    enableImageHoverZoom: true,
  });

  // Sync local settings with server settings
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        tileSize: settings.tileSize,
        rows: settings.rows,
        cols: settings.cols,
        startPosition: settings.startPosition,
        enableTileHoverZoom: settings.enableTileHoverZoom,
        enableImageHoverZoom: settings.enableImageHoverZoom,
      });
    }
  }, [settings]);

  const handleChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      alert('Gallery settings saved!');
    } catch (error) {
      console.error('Error saving gallery settings:', error);
      alert('Error saving settings');
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all gallery settings to defaults?')) return;
    try {
      const result = await resetSettings();
      setLocalSettings({
        tileSize: result.tileSize,
        rows: result.rows,
        cols: result.cols,
        startPosition: result.startPosition,
        enableTileHoverZoom: result.enableTileHoverZoom,
        enableImageHoverZoom: result.enableImageHoverZoom,
      });
      alert('Settings reset to defaults!');
    } catch (error) {
      console.error('Error resetting gallery settings:', error);
      alert('Error resetting settings');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    background: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: 'white',
    fontSize: '16px',
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
  };

  const sectionStyle = {
    marginBottom: '1.5rem',
  };

  const checkboxStyle = {
    marginRight: '0.75rem',
    width: '18px',
    height: '18px',
    accentColor: '#fff',
  };

  return (
    <div style={{
      background: '#1a1a1a',
      padding: '2rem',
      borderRadius: '8px',
      marginBottom: '2rem'
    }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Gallery Controls</h2>

      <div style={{ marginBottom: '1rem', fontSize: '14px', color: '#888', lineHeight: '1.6' }}>
        Configure the homepage gallery grid layout and hover effects. 
        Changes take effect immediately on the homepage.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={sectionStyle}>
          <label style={labelStyle}>Tile Size (px)</label>
          <input
            type="number"
            value={localSettings.tileSize}
            onChange={(e) => handleChange('tileSize', parseInt(e.target.value) || 320)}
            min="100"
            max="800"
            step="10"
            style={inputStyle}
          />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Rows</label>
          <input
            type="number"
            value={localSettings.rows}
            onChange={(e) => handleChange('rows', parseInt(e.target.value) || 3)}
            min="1"
            max="10"
            step="1"
            style={inputStyle}
          />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Columns</label>
          <input
            type="number"
            value={localSettings.cols}
            onChange={(e) => handleChange('cols', parseInt(e.target.value) || 13)}
            min="1"
            max="30"
            step="1"
            style={inputStyle}
          />
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>Start Position</label>
          <select
            value={localSettings.startPosition}
            onChange={(e) => handleChange('startPosition', e.target.value)}
            style={inputStyle}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        padding: '1.5rem',
        background: '#2a2a2a',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '16px' }}>Hover Effects</h3>
        
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={localSettings.enableTileHoverZoom}
            onChange={(e) => handleChange('enableTileHoverZoom', e.target.checked)}
            style={checkboxStyle}
          />
          <span>Tile Hover Zoom (tile scales to 1.08x)</span>
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={localSettings.enableImageHoverZoom}
            onChange={(e) => handleChange('enableImageHoverZoom', e.target.checked)}
            style={checkboxStyle}
          />
          <span>Image Hover Zoom (image zooms after 3s delay)</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '0.75rem 2rem',
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px',
          }}
        >
          Save Settings
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '0.75rem 2rem',
            background: 'transparent',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px',
          }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

export default GalleryControls;