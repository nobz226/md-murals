import { useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { errorMessage, uploadFile, useAdmin, useAdminMutation } from './AdminContext';

// Upload, order, feature and delete a project's images
function ImageManager({ projectId }) {
  const images = useQuery(api.images.getProjectImages, { projectId });
  const generateUploadUrl = useAdminMutation(api.images.generateUploadUrl);
  const saveImage = useAdminMutation(api.images.saveImage);
  const deleteImage = useAdminMutation(api.images.deleteImage);
  const reorderImages = useAdminMutation(api.images.reorderImages);
  const setFeaturedImage = useAdminMutation(api.projects.setFeaturedImage);
  const { toast } = useAdmin();

  const fileInputRef = useRef(null);
  const [progress, setProgress] = useState(null); // { done, total } while uploading
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      toast('Please choose image files', 'error');
      return;
    }

    setProgress({ done: 0, total: files.length });
    let uploaded = 0;
    try {
      for (const file of files) {
        const uploadUrl = await generateUploadUrl();
        const storageId = await uploadFile(uploadUrl, file);
        await saveImage({ projectId, storageId });
        uploaded++;
        setProgress({ done: uploaded, total: files.length });
      }
      toast(`Uploaded ${uploaded} image${uploaded === 1 ? '' : 's'}`);
    } catch (error) {
      toast(`${errorMessage(error)}${uploaded ? ` (${uploaded} uploaded before the error)` : ''}`, 'error');
    } finally {
      setProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (progress) return;
    uploadFiles(e.dataTransfer.files);
  };

  const run = async (action, successMessage) => {
    try {
      await action();
      if (successMessage) toast(successMessage);
    } catch (error) {
      toast(errorMessage(error), 'error');
    }
  };

  const handleMove = (index, direction) => {
    const ids = images.map((img) => img._id);
    const target = index + direction;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(() => reorderImages({ imageIds: ids }));
  };

  const handleDelete = (image) => {
    if (!confirm('Delete this image? This can\'t be undone.')) return;
    run(() => deleteImage({ imageId: image._id }), 'Image deleted');
  };

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title">Images</h3>
        {images && <span className="admin-hint">{images.length} total · the cover image is shown in the gallery grid</span>}
      </div>

      <div
        className={`admin-dropzone ${dragOver ? 'is-over' : ''} ${progress ? 'is-busy' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !progress && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !progress && fileInputRef.current?.click()}
      >
        {progress ? (
          <>
            <strong>Uploading {Math.min(progress.done + 1, progress.total)} of {progress.total}…</strong>
            <div className="admin-progress"><div style={{ width: `${(progress.done / progress.total) * 100}%` }} /></div>
          </>
        ) : (
          <>
            <strong>Drop images here or click to browse</strong>
            <span className="admin-hint">JPG, PNG or WebP · you can select several at once</span>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>

      {images === undefined ? (
        <p className="admin-hint">Loading images…</p>
      ) : images.length > 0 && (
        <ul className="admin-image-grid">
          {images.map((image, index) => (
            <li key={image._id} className={`admin-image-tile ${image.isFeatured ? 'is-featured' : ''}`}>
              <img src={image.url} alt={`Image ${index + 1}`} loading="lazy" />
              {image.isFeatured && <span className="admin-image-badge">Cover</span>}
              <div className="admin-image-actions">
                <button
                  className="admin-icon-btn"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  title="Move earlier"
                  aria-label="Move image earlier"
                >←</button>
                <button
                  className="admin-icon-btn"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === images.length - 1}
                  title="Move later"
                  aria-label="Move image later"
                >→</button>
                {!image.isFeatured && (
                  <button
                    className="admin-icon-btn admin-icon-btn-text"
                    onClick={() => run(() => setFeaturedImage({ projectId, imageId: image._id }), 'Cover image updated')}
                    title="Use as cover image"
                  >Set cover</button>
                )}
                <button
                  className="admin-icon-btn admin-icon-btn-danger"
                  onClick={() => handleDelete(image)}
                  title="Delete image"
                  aria-label="Delete image"
                >✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ImageManager;
