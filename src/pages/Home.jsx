import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Preloader from '../components/Preloader';
import Gallery from '../components/Gallery/Gallery';
import AboutDetail from '../components/Gallery/AboutDetail';

// Stable empty list so the gallery doesn't rebuild on every render while loading
const NO_PROJECTS = [];

function Home({ category }) {
  const [showPreloader, setShowPreloader] = useState(() => {
    // Only show preloader on first visit
    return !sessionStorage.getItem('hasVisited');
  });

  const [aboutOpen, setAboutOpen] = useState(false);

  // Only subscribe to the query this page actually shows
  const allProjects = useQuery(api.projects.getAllProjects, category ? "skip" : {});
  const filteredProjects = useQuery(
    api.projects.getProjectsByCategory,
    category ? { category } : "skip"
  );
  const projects = (category ? filteredProjects : allProjects) ?? NO_PROJECTS;

  // Close About when category changes (navigation)
  useEffect(() => {
    setAboutOpen(false);
  }, [category]);

  // Body switches to zoom mode while About is open
  useEffect(() => {
    if (!aboutOpen) return;
    document.body.classList.add('zoom-mode');
    return () => document.body.classList.remove('zoom-mode');
  }, [aboutOpen]);

  useEffect(() => {
    if (showPreloader) {
      sessionStorage.setItem('hasVisited', 'true');
      const timer = setTimeout(() => {
        setShowPreloader(false);
      }, 2800); // 2s animation + 0.8s fade

      return () => clearTimeout(timer);
    }
  }, [showPreloader]);

  if (showPreloader) {
    return <Preloader />;
  }

  return (
    <>
      <Header onAboutClick={() => setAboutOpen(true)} />
      <Gallery projects={projects} category={category} aboutOpen={aboutOpen} />
      <Footer />
      {aboutOpen && <AboutDetail onClose={() => setAboutOpen(false)} />}
      <div className="page-vignette-container">
        <div className="page-vignette-extreme"></div>
      </div>
    </>
  );
}

export default Home;
