import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Preloader from '../components/Preloader';
import FashionGallery from '../components/Gallery/FashionGallery';

function Home({ category }) {
  const [showPreloader, setShowPreloader] = useState(() => {
    // Only show preloader on first visit
    return !sessionStorage.getItem('hasVisited');
  });
  
  // Query projects based on category
  const allProjects = useQuery(api.projects.getAllProjects);
  const filteredProjects = useQuery(
    api.projects.getProjectsByCategory,
    category ? { category } : "skip"
  );
  
  const projects = category ? filteredProjects : allProjects;

  // Debug logging
  useEffect(() => {
    console.log('Home - category:', category);
    console.log('Home - allProjects:', allProjects);
    console.log('Home - filteredProjects:', filteredProjects);
    console.log('Home - projects (final):', projects);
  }, [category, allProjects, filteredProjects, projects]);

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
      <Header currentCategory={category} />
      <FashionGallery projects={projects || []} category={category} />
      <Footer />
      <div className="page-vignette-container">
        <div className="page-vignette-extreme"></div>
      </div>
    </>
  );
}

export default Home;
