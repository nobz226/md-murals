import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

function SeedButton() {
  const seedData = useMutation(api.seed.seedData);

  const handleSeed = async () => {
    try {
      const result = await seedData();
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
      <h3>Development Tools</h3>
      <button onClick={handleSeed}>Seed Database</button>
    </div>
  );
}

export default SeedButton;
