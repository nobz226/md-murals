import { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import { errorMessage, useAdmin, useAdminMutation } from './AdminContext';

// Development-only: seed sample content or wipe the database
function DevTools() {
  const seedData = useAdminMutation(api.seed.seedData);
  const seedSounds = useAdminMutation(api.seed.seedSounds);
  const clearData = useAdminMutation(api.seed.clearData);
  const { toast } = useAdmin();
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    setBusy(true);
    try {
      const result = await action();
      toast(result.message, result.success ? 'success' : 'error');
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleClear = () => {
    if (!confirm('Delete ALL projects, images and sounds? This can\'t be undone.')) return;
    run(clearData);
  };

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <h3 className="admin-card-title">Sample data</h3>
        <p className="admin-hint admin-card-intro">
          Adds 39 placeholder projects (13 per category) with Unsplash images. Only runs on an empty database.
        </p>
        <div className="admin-actions">
          <button className="admin-btn admin-btn-primary" onClick={() => run(seedData)} disabled={busy}>Seed projects</button>
          <button className="admin-btn" onClick={() => run(seedSounds)} disabled={busy}>Seed sounds</button>
        </div>
      </section>

      <section className="admin-card admin-card-danger">
        <h3 className="admin-card-title">Danger zone</h3>
        <p className="admin-hint admin-card-intro">Permanently deletes every project, image and sound, including uploaded files.</p>
        <button className="admin-btn admin-btn-danger" onClick={handleClear} disabled={busy}>Clear all data</button>
      </section>
    </div>
  );
}

export default DevTools;
