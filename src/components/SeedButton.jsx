import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

function SeedButton() {
  const seedData = useMutation(api.seed.seedData);
  const clearData = useMutation(api.seed.clearData);

  const handleSeed = async () => {
    try {
      const result = await seedData();
      alert(JSON.stringify(result, null, 2));
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to delete all projects and images?')) return;
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
      border: '2px solid #000'
    }}>
      <h3 style={{ color: '#000', marginBottom: '10px' }}>Dev Tools</h3>
      <button onClick={handleClear} style={{ marginRight: '10px', padding: '5px 10px', background: '#ff4444', color: '#fff', border: 'none', cursor: 'pointer' }}>Clear Data</button>
      <button onClick={handleSeed} style={{ padding: '5px 10px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>Seed Database</button>
    </div>
  );
}

export default SeedButton;
