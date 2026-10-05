import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { errorMessage, useAdmin, useAdminMutation } from './AdminContext';

const FIELDS = ['tileSize', 'rows', 'cols', 'startPosition', 'enableTileHoverZoom', 'enableImageHoverZoom'];

const pickSettings = (source) => Object.fromEntries(FIELDS.map((key) => [key, source[key]]));

const NUMBER_LIMITS = {
  tileSize: [100, 800],
  rows: [1, 10],
  cols: [1, 30]
};

// Bring a typed number into its allowed range ('' or invalid becomes the minimum)
const clampField = (key, value) => {
  const [min, max] = NUMBER_LIMITS[key];
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? min : Math.min(max, Math.max(min, n));
};

function GalleryControls() {
  const settings = useQuery(api.gallerySettings.getGallerySettings);
  const updateSettings = useAdminMutation(api.gallerySettings.updateGallerySettings);
  const resetSettings = useAdminMutation(api.gallerySettings.resetGallerySettings);
  const { toast } = useAdmin();

  const [local, setLocal] = useState(null);
  const [saving, setSaving] = useState(false);

  // Sync local settings with server settings
  useEffect(() => {
    if (settings) setLocal(pickSettings(settings));
  }, [settings]);

  if (!local) return <div className="admin-empty">Loading settings…</div>;

  const isDirty = FIELDS.some((key) => local[key] !== settings[key]);
  const set = (key, value) => setLocal((s) => ({ ...s, [key]: value }));
  // Number inputs keep whatever is typed and are clamped when they lose focus
  const numberProps = (key) => ({
    type: 'number',
    className: 'admin-input',
    min: NUMBER_LIMITS[key][0],
    max: NUMBER_LIMITS[key][1],
    value: local[key],
    onChange: (e) => set(key, e.target.value === '' ? '' : parseInt(e.target.value, 10)),
    onBlur: () => set(key, clampField(key, local[key]))
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const clamped = { ...local };
      for (const key of Object.keys(NUMBER_LIMITS)) clamped[key] = clampField(key, local[key]);
      setLocal(clamped);
      await updateSettings(clamped);
      toast('Gallery settings saved. The homepage updates right away.');
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all gallery settings to their defaults?')) return;
    try {
      await resetSettings();
      toast('Settings reset to defaults');
    } catch (error) {
      toast(errorMessage(error), 'error');
    }
  };

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h3 className="admin-card-title">Grid</h3>
        <p className="admin-hint admin-card-intro">
          Projects fill the grid row by row. If there are more projects than rows × columns,
          extra columns are added automatically so nothing is hidden. On phones, columns are
          always calculated automatically.
        </p>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">Tile size (px)</span>
            <input {...numberProps('tileSize')} step="10" />
            <span className="admin-hint">100–800 before the gallery's 60% zoom</span>
          </label>
          <label className="admin-field">
            <span className="admin-label">Rows</span>
            <input {...numberProps('rows')} />
          </label>
          <label className="admin-field">
            <span className="admin-label">Columns</span>
            <input {...numberProps('cols')} />
          </label>
        </div>
      </section>

      <section className="admin-card">
        <h3 className="admin-card-title">Start position</h3>
        <p className="admin-hint admin-card-intro">Where the grid sits when the page loads.</p>
        <div className="admin-segmented" role="radiogroup" aria-label="Start position">
          {['left', 'center', 'right'].map((position) => (
            <button
              key={position}
              role="radio"
              aria-checked={local.startPosition === position}
              className={local.startPosition === position ? 'is-active' : ''}
              onClick={() => set('startPosition', position)}
            >
              {position[0].toUpperCase() + position.slice(1)}
            </button>
          ))}
        </div>
      </section>

      <section className="admin-card">
        <h3 className="admin-card-title">Hover effects</h3>
        <label className="admin-toggle">
          <input type="checkbox" checked={local.enableTileHoverZoom}
            onChange={(e) => set('enableTileHoverZoom', e.target.checked)} />
          <span className="admin-toggle-track" />
          <span>
            <strong>Tile zoom</strong>
            <span className="admin-hint">The tile grows slightly under the cursor</span>
          </span>
        </label>
        <label className="admin-toggle">
          <input type="checkbox" checked={local.enableImageHoverZoom}
            onChange={(e) => set('enableImageHoverZoom', e.target.checked)} />
          <span className="admin-toggle-track" />
          <span>
            <strong>Slow image zoom</strong>
            <span className="admin-hint">After 3 seconds of hovering, the image slowly zooms in</span>
          </span>
        </label>
      </section>

      <div className="admin-sticky-actions">
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={!isDirty || saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {isDirty && (
          <button className="admin-btn admin-btn-ghost" onClick={() => setLocal(pickSettings(settings))}>
            Discard changes
          </button>
        )}
        <button className="admin-btn admin-btn-ghost admin-push-right" onClick={handleReset}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

export default GalleryControls;
