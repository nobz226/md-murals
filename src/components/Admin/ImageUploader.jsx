import { useState, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

function ImageUploader({ projectId }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const saveImage = useMutation(api.images.saveImage);
  const setFeaturedImage = useMutation(api.projects.setFeaturedImage);
  const projectImages = useQuery(api.images.getProjectImages, { projectId });

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
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
        const imageId = await saveImage({
          projectId,
          storageId,
          order: (projectImages?.length || 0) + i
        });

        // Set first image as featured if no featured image yet
        if (i === 0 && (!projectImages || projectImages.length === 0)) {
          await setFeaturedImage({ projectId, imageId });
        }
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  const handleSetFeatured = async (imageId) => {
    try {
      await setFeaturedImage({ projectId, imageId });
    } catch (error) {
      console.error('Error setting featured image:', error);
    }
  };

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem' }}>
        Project Images
      </label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
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

      {uploading && (
        <p style={{ color: '#888', fontSize: '14px' }}>Uploading images...</p>
      )}

      {projectImages && projectImages.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          {projectImages.map((image) => (
            <div
              key={image._id}
              style={{
                position: 'relative',
                aspectRatio: '1',
                background: '#2a2a2a',
                borderRadius: '4px',
                overflow: 'hidden',
                border: image.isFeatured ? '2px solid #fff' : '2px solid transparent'
              }}
            >
              <img
                src={image.url}
                alt="Project"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {!image.isFeatured && (
                <button
                  onClick={() => handleSetFeatured(image._id)}
                  style={{
                    position: 'absolute',
                    bottom: '0.5rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Set Featured
                </button>
              )}
              {image.isFeatured && (
                <div
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    background: 'rgba(255,255,255,0.9)',
                    color: 'black',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}
                >
                  FEATURED
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
