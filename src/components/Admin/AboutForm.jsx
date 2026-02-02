import { useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

function AboutForm() {
  const aboutData = useQuery(api.about.getAbout);
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [uploading, setUploading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const fileInputRef = useRef(null);
  
  const generateUploadUrl = useMutation(api.about.generateUploadUrl);
  const updateAbout = useMutation(api.about.updateAbout);

  // Set form values when data loads
  useState(() => {
    if (aboutData) {
      setTitle(aboutData.title || '');
      setBio(aboutData.bio || '');
      setCurrentImageUrl(aboutData.url || '');
    }
  }, [aboutData]);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

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
      
      // Update about data with new image
      await updateAbout({
        title: title || 'Artist Name',
        bio: bio || 'Artist bio goes here...',
        storageId
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      await updateAbout({
        title,
        bio,
        ...(aboutData?.storageId && { storageId: aboutData.storageId })
      });
      alert('About section updated successfully');
    } catch (error) {
      console.error('Error updating about:', error);
      alert('Error updating about section');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      background: '#1a1a1a',
      padding: '2rem',
      borderRadius: '8px',
      marginBottom: '2rem'
    }}>
      <h2 style={{ marginBottom: '1.5rem' }}>About Section</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Artist Name / Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter artist name or title"
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: 'white',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Bio / Description
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Enter artist bio..."
            rows={6}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: 'white',
              fontSize: '16px',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Featured Image
          </label>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: 'white',
              marginBottom: '1rem'
            }}
          />

          {aboutData?.url && (
            <div style={{ 
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
              aspectRatio: '1',
              background: '#2a2a2a',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <img
                src={aboutData.url}
                alt="About featured"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          {uploading && (
            <p style={{ color: '#888', fontSize: '14px', marginTop: '0.5rem' }}>
              Uploading image...
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={uploading}
            style={{
              padding: '0.75rem 2rem',
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: uploading ? 0.5 : 1
            }}
          >
            {uploading ? 'Saving...' : 'Save About Section'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AboutForm;
