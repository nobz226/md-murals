import { useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

function SoundManager() {
  const [uploading, setUploading] = useState(null);
  const fileInputRefs = useRef({});
  
  const sounds = useQuery(api.sounds.getAllSounds);
  const generateUploadUrl = useMutation(api.sounds.generateUploadUrl);
  const saveSound = useMutation(api.sounds.saveSound);
  const deleteSound = useMutation(api.sounds.deleteSound);

  const soundTypes = [
    { type: 'click', label: 'Click', description: 'Grid item clicks' },
    { type: 'open', label: 'Open', description: 'Open project detail' },
    { type: 'close', label: 'Close', description: 'Close project detail' },
    { type: 'zoom-in', label: 'Zoom In', description: 'Zoom in action' },
    { type: 'zoom-out', label: 'Zoom Out', description: 'Zoom out action' },
    { type: 'drag-start', label: 'Drag Start', description: 'Start dragging' },
    { type: 'drag-end', label: 'Drag End', description: 'End dragging' },
    { type: 'nav-hover', label: 'Nav Hover', description: 'Hover over navigation items' },
    { type: 'nav-click', label: 'Nav Click', description: 'Click navigation items' },
  ];

  const handleFileSelect = async (soundType, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file');
      return;
    }

    setUploading(soundType);

    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file
      });

      const { storageId } = await result.json();
      
      // Save sound record
      await saveSound({
        name: file.name,
        type: soundType,
        storageId
      });

      // Reset file input
      if (fileInputRefs.current[soundType]) {
        fileInputRefs.current[soundType].value = '';
      }
    } catch (error) {
      console.error('Error uploading sound:', error);
      alert('Error uploading sound');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (soundId) => {
    if (!confirm('Are you sure you want to delete this sound?')) return;
    try {
      await deleteSound({ soundId });
    } catch (error) {
      console.error('Error deleting sound:', error);
    }
  };

  const getSoundForType = (type) => {
    return sounds?.find(s => s.type === type);
  };

  const playSound = (sound) => {
    if (!sound) return;
    const audio = new Audio(sound.url);
    audio.volume = 0.5;
    audio.play();
  };

  return (
    <div style={{
      background: '#1a1a1a',
      padding: '2rem',
      borderRadius: '8px',
      marginBottom: '2rem'
    }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Sound Effects</h2>
      <p style={{ color: '#888', marginBottom: '2rem', fontSize: '14px' }}>
        Upload audio files for different interactions. Supported formats: MP3, WAV, OGG
      </p>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {soundTypes.map(({ type, label, description }) => {
          const sound = getSoundForType(type);
          
          return (
            <div
              key={type}
              style={{
                background: '#2a2a2a',
                padding: '1.5rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  marginBottom: '0.25rem',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  {label}
                </h3>
                <p style={{ 
                  color: '#888', 
                  fontSize: '13px',
                  marginBottom: '0.5rem' 
                }}>
                  {description}
                </p>
                {sound && (
                  <p style={{ 
                    color: '#aaa', 
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}>
                    {sound.name}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {sound && (
                  <button
                    onClick={() => playSound(sound)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'transparent',
                      color: '#fff',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    ▶ Test
                  </button>
                )}
                
                <label style={{
                  padding: '0.5rem 1rem',
                  background: sound ? 'transparent' : '#fff',
                  color: sound ? '#fff' : '#000',
                  border: sound ? '1px solid #444' : 'none',
                  borderRadius: '4px',
                  cursor: uploading === type ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  opacity: uploading === type ? 0.5 : 1
                }}>
                  {uploading === type ? 'Uploading...' : sound ? 'Replace' : 'Upload'}
                  <input
                    ref={el => fileInputRefs.current[type] = el}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileSelect(type, e)}
                    disabled={uploading === type}
                    style={{ display: 'none' }}
                  />
                </label>

                {sound && (
                  <button
                    onClick={() => handleDelete(sound._id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SoundManager;
