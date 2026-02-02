import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

function SeedButton() {
  const seedData = useMutation(api.seed.seedData);
  const seedSounds = useMutation(api.seed.seedSounds);
  const clearData = useMutation(api.seed.clearData);

  const handleSeed = async () => {
    try {
      const result = await seedData();
      alert(JSON.stringify(result, null, 2));
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleSeedSounds = async () => {
    try {
      const result = await seedSounds();
      alert(JSON.stringify(result, null, 2));
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to delete all projects, images, and sounds?')) return;
    try {
      const result = await clearData();
      alert(JSON.stringify(result, null, 2));
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      zIndex: 100000,
      background: '#fff',
      padding: '20px',
      border: '2px solid #000',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <h3 style={{ color: '#000', marginBottom: '10px' }}>Dev Tools</h3>
      <button onClick={handleClear} style={{ padding: '5px 10px', background: '#ff4444', color: '#fff', border: 'none', cursor: 'pointer' }}>Clear All Data</button>
      <button onClick={handleSeed} style={{ padding: '5px 10px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>Seed Projects</button>
      <button onClick={handleSeedSounds} style={{ padding: '5px 10px', background: '#4444ff', color: '#fff', border: 'none', cursor: 'pointer' }}>Seed Sounds</button>
    </div>
  );
}

export default SeedButton;
