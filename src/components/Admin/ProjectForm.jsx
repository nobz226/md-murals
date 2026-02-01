import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ImageUploader from './ImageUploader';

function ProjectForm({ project, onClose }) {
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [category, setCategory] = useState(project?.category || 'interior');
  const [uploading, setUploading] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(project?._id || null);

  const createProject = useMutation(api.projects.createProject);
  const updateProject = useMutation(api.projects.updateProject);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (project) {
        // Update existing project
        await updateProject({
          id: project._id,
          title,
          description,
          category
        });
      } else {
        // Create new project
        const projectId = await createProject({
          title,
          description,
          category
        });
        setCurrentProjectId(projectId);
      }
      
      if (!currentProjectId) {
        // If this was a new project, keep form open for image upload
        return;
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project');
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
      <h2 style={{ marginBottom: '1.5rem' }}>
        {project ? 'Edit Project' : 'Create New Project'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
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
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
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
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: 'white',
              fontSize: '16px'
            }}
          >
            <option value="interior">Interior Murals</option>
            <option value="exterior">Exterior Murals</option>
            <option value="canvas">Canvas</option>
          </select>
        </div>

        {currentProjectId && (
          <div style={{ marginBottom: '1.5rem' }}>
            <ImageUploader projectId={currentProjectId} />
          </div>
        )}

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
            {uploading ? 'Saving...' : 'Save Project'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.75rem 2rem',
              background: 'transparent',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectForm;
