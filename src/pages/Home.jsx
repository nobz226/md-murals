import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useState, useEffect, useRef } from 'react';
import { CustomEase } from 'gsap/dist/CustomEase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Preloader from '../components/Preloader';
import Gallery from '../components/Gallery/Gallery';
import AboutDetail from '../components/Gallery/AboutDetail';
import { useSoundSystem } from '../hooks/useSoundSystem';
import gsap from 'gsap';

gsap.registerPlugin(CustomEase);

function Home({ category, showAbout }) {
  const [showPreloader, setShowPreloader] = useState(() => {
    // Only show preloader on first visit
    return !sessionStorage.getItem('hasVisited');
  });
  
  const [aboutOpen, setAboutOpen] = useState(showAbout || false);
  const customEaseRef = useRef(null);
  const { play: playSound } = useSoundSystem();
  
  // Query projects based on category
  const allProjects = useQuery(api.projects.getAllProjects);
  const filteredProjects = useQuery(
    api.projects.getProjectsByCategory,
    category ? { category } : "skip"
  );
  
  const projects = category ? filteredProjects : allProjects;

  // Initialize custom ease
  useEffect(() => {
    customEaseRef.current = CustomEase.create("smooth", ".87,0,.13,1");
  }, []);

  // Handle showAbout prop changes
  useEffect(() => {
    if (showAbout) {
      setAboutOpen(true);
      document.body.classList.add('zoom-mode');
    }
  }, [showAbout]);

  // Close About when category changes (navigation)
  useEffect(() => {
    if (aboutOpen) {
      setAboutOpen(false);
      document.body.classList.remove('zoom-mode');
    }
  }, [category]);

  // Close About with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && aboutOpen) {
        handleCloseAbout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  const handleCloseAbout = () => {
    playSound('close');
    setAboutOpen(false);
    document.body.classList.remove('zoom-mode');
  };

  const handleOpenAbout = () => {
    playSound('open');
    setAboutOpen(true);
    document.body.classList.add('zoom-mode');
  };

  if (showPreloader) {
    return <Preloader />;
  }

  return (
    <>
      <Header currentCategory={category} onAboutClick={handleOpenAbout} />
      <Gallery projects={projects || []} category={category} aboutOpen={aboutOpen} />
      <Footer />
      {aboutOpen && (
        <AboutDetail
          customEase={customEaseRef.current}
          onClose={handleCloseAbout}
        />
      )}
      <div className="page-vignette-container">
        <div className="page-vignette-extreme"></div>
      </div>
    </>
  );
}

export default Home;
