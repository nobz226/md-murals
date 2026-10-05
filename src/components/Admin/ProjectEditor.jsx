import { useEffect, useState } from 'react';
import { api } from '../../../convex/_generated/api';
import { errorMessage, useAdmin, useAdminMutation } from './AdminContext';
import { CATEGORIES } from './categories';
import ImageManager from './ImageManager';

// Side drawer for creating a project (details first) or editing one (details + images)
function ProjectEditor({ project, defaultCategory, onCreated, onClose }) {
  const isNew = !project;
  const createProject = useAdminMutation(api.projects.createProject);
  const updateProject = useAdminMutation(api.projects.updateProject);
  const { toast } = useAdmin();

  const initial = {
    title: project?.title || '',
    description: project?.description || '',
    category: project?.category || defaultCategory
  };
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const isDirty = form.title !== initial.title ||
    form.description !== initial.description ||
    form.category !== initial.category;

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const requestClose = () => {
    if (isDirty && !confirm('Discard unsaved changes?')) return;
    onClose();
  };

  // Close with Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fields = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category
      };
      if (isNew) {
        const id = await createProject(fields);
        toast('Project created. Now add some images.');
        onCreated(id);
      } else {
        await updateProject({ id: project._id, ...fields });
        toast('Project saved');
      }
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && requestClose()}>
      <aside className="admin-drawer" role="dialog" aria-modal="true" aria-label={isNew ? 'New project' : 'Edit project'}>
        <div className="admin-drawer-header">
          <h2>{isNew ? 'New project' : 'Edit project'}</h2>
          <button className="admin-icon-btn" onClick={requestClose} aria-label="Close">✕</button>
        </div>

        <div className="admin-drawer-body">
          <form className="admin-card" onSubmit={handleSubmit}>
            <h3 className="admin-card-title">Details</h3>
            <label className="admin-field">
              <span className="admin-label">Title</span>
              <input
                className="admin-input"
                value={form.title}
                onChange={setField('title')}
                required
                autoFocus={isNew}
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Description</span>
              <textarea
                className="admin-input"
                rows={4}
                value={form.description}
                onChange={setField('description')}
                required
              />
            </label>
            <label className="admin-field">
              <span className="admin-label">Category</span>
              <select className="admin-input" value={form.category} onChange={setField('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
            <div className="admin-actions">
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={saving || (!isNew && !isDirty)}
              >
                {saving ? 'Saving…' : isNew ? 'Create project' : 'Save details'}
              </button>
              {!isNew && isDirty && <span className="admin-hint">Unsaved changes</span>}
            </div>
          </form>

          {isNew ? (
            <div className="admin-card admin-card-muted">
              <h3 className="admin-card-title">Images</h3>
              <p className="admin-hint">Create the project first, then you can upload its images here.</p>
            </div>
          ) : (
            <ImageManager projectId={project._id} />
          )}
        </div>
      </aside>
    </div>
  );
}

export default ProjectEditor;
