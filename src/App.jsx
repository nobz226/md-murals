import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SoundProvider } from './hooks/useSoundSystem';
import Home from './pages/Home';
import About from './pages/About';
import Admin from './pages/Admin';

function App() {
  return (
    <SoundProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interior" element={<Home category="interior" />} />
          <Route path="/exterior" element={<Home category="exterior" />} />
          <Route path="/canvas" element={<Home category="canvas" />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </SoundProvider>
  );
}

export default App;
