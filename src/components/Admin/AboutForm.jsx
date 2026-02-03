import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

function AboutForm() {
  const about = useQuery(api.about.getAbout);
  const [title, setTitle] = useState('');
  const [bioTitle, setBioTitle] = useState('');
  const [bio, setBio] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const updateAbout = useMutation(api.about.updateAbout);
  const generateUploadUrl = useMutation(api.about.generateUploadUrl);
  const saveFeaturedImage = useMutation(api.about.saveFeaturedImage);

  // Populate form when about data loads
  useEffect(() => {
    if (about) {
      setTitle(about.title || '');
      setBioTitle(about.bioTitle || '');
      setBio(about.bio || '');
    }
  }, [about]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      await updateAbout({
        title,
        bioTitle,
        bio,
      });
      alert('About page updated successfully!');
    } catch (error) {
      console.error('Error updating about page:', error);
      alert('Error updating about page');
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

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
      
      // Save image record
      await saveFeaturedImage({ storageId });

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

  return (
    <div style={{
      background: '#1a1a1a',
      padding: '2rem',
      borderRadius: '8px',
      marginBottom: '2rem'
    }}>
      <h2 style={{ marginBottom: '1.5rem' }}>About Page Settings</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Featured Image
          </label>
          {about?.imageUrl && (
            <div style={{ 
              marginBottom: '1rem',
              aspectRatio: '16/9',
              maxWidth: '400px',
              overflow: 'hidden',
              borderRadius: '8px'
            }}>
              <img 
                src={about.imageUrl} 
                alt="Featured" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
              />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
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
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Title (appears in overlay)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Mihai Darvasa"
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

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Bio Title
          </label>
          <input
            type="text"
            value={bioTitle}
            onChange={(e) => setBioTitle(e.target.value)}
            placeholder="e.g., About the Artist"
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
            Bio Text
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell your story..."
            rows={8}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: 'white',
              fontSize: '16px',
              fontFamily: 'inherit',
              lineHeight: '1.6'
            }}
          />
        </div>

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
          {uploading ? 'Saving...' : 'Save About Page'}
        </button>
      </form>
    </div>
  );
}

export default AboutForm;
