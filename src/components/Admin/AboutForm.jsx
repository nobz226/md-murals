import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { errorMessage, uploadFile, useAdmin, useAdminMutation } from './AdminContext';

const EMPTY = { title: '', bioTitle: '', bio: '' };

function AboutForm() {
  const about = useQuery(api.about.getAbout);
  const updateAbout = useAdminMutation(api.about.updateAbout);
  const generateUploadUrl = useAdminMutation(api.about.generateUploadUrl);
  const saveFeaturedImage = useAdminMutation(api.about.saveFeaturedImage);
  const { toast } = useAdmin();

  const fileInputRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const saved = {
    title: about?.title || '',
    bioTitle: about?.bioTitle || '',
    bio: about?.bio || ''
  };

  // Populate form when about data loads
  useEffect(() => {
    if (about !== undefined) setForm(saved);
  }, [about]);

  if (about === undefined) return <div className="admin-empty">Loading About page…</div>;

  const isDirty = Object.keys(EMPTY).some((key) => form[key] !== saved[key]);
  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAbout(form);
      toast('About page saved');
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file', 'error');
      return;
    }

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const storageId = await uploadFile(uploadUrl, file);
      await saveFeaturedImage({ storageId });
      toast('Photo updated');
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="admin-two-col">
      <section className="admin-card">
        <h3 className="admin-card-title">Photo</h3>
        <p className="admin-hint admin-card-intro">Shown on the left half of the About panel. The new photo is live as soon as it uploads.</p>
        <div className="admin-about-photo">
          {about?.imageUrl
            ? <img src={about.imageUrl} alt="About" />
            : <span className="admin-hint">No photo yet</span>}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-block"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : about?.imageUrl ? 'Replace photo' : 'Upload photo'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageSelect} />
      </section>

      <form className="admin-card" onSubmit={handleSubmit}>
        <h3 className="admin-card-title">Text</h3>
        <label className="admin-field">
          <span className="admin-label">Name</span>
          <input className="admin-input" value={form.title} onChange={setField('title')} placeholder="Mihai Darvasa" />
          <span className="admin-hint">Large title in the overlay. Defaults to "Mihai Darvasa".</span>
        </label>
        <label className="admin-field">
          <span className="admin-label">Bio heading</span>
          <input className="admin-input" value={form.bioTitle} onChange={setField('bioTitle')} placeholder="About the Artist" />
        </label>
        <label className="admin-field">
          <span className="admin-label">Bio</span>
          <textarea className="admin-input" rows={10} value={form.bio} onChange={setField('bio')} placeholder="Tell your story…" />
          <span className="admin-hint">Line breaks are kept.</span>
        </label>
        <div className="admin-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={!isDirty || saving}>
            {saving ? 'Saving…' : 'Save text'}
          </button>
          {isDirty && (
            <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setForm(saved)}>
              Discard changes
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default AboutForm;
