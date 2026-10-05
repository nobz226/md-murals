import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

// Admin is loaded on demand so visitors never download it
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interior" element={<Home category="interior" />} />
        <Route path="/exterior" element={<Home category="exterior" />} />
        <Route path="/canvas" element={<Home category="canvas" />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <Admin />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
