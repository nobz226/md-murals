import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../components/Admin/AdminContext';
import LoginScreen from '../components/Admin/LoginScreen';
import ProjectsPanel from '../components/Admin/ProjectsPanel';
import GalleryControls from '../components/Admin/GalleryControls';
import AboutForm from '../components/Admin/AboutForm';
import DevTools from '../components/Admin/DevTools';
import '../styles/admin.css';

const SECTIONS = [
  { id: 'projects', label: 'Projects', description: 'Add, edit and order the work shown in the gallery', component: ProjectsPanel },
  { id: 'gallery', label: 'Gallery Layout', description: 'Grid size, start position and hover effects on the homepage', component: GalleryControls },
  { id: 'about', label: 'About Page', description: 'Photo and bio shown in the About panel', component: AboutForm },
  // Seeding and clearing data is only offered in local development
  ...(import.meta.env.DEV
    ? [{ id: 'dev', label: 'Dev Tools', description: 'Seed sample data or clear the database (development only)', component: DevTools }]
    : [])
];

function getInitialSection() {
  const hash = window.location.hash.slice(1);
  return SECTIONS.some((s) => s.id === hash) ? hash : 'projects';
}

function Dashboard() {
  const { logout } = useAdmin();
  const [sectionId, setSectionId] = useState(getInitialSection);
  const section = SECTIONS.find((s) => s.id === sectionId);
  const Panel = section.component;

  const selectSection = (id) => {
    setSectionId(id);
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-dot" />
          MD Murals
        </div>
        <nav className="admin-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`admin-nav-item ${s.id === sectionId ? 'is-active' : ''}`}
              onClick={() => selectSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-btn admin-btn-ghost admin-btn-block">View site</Link>
          <button className="admin-btn admin-btn-ghost admin-btn-block" onClick={logout}>Log out</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-page-header">
          <h1>{section.label}</h1>
          <p>{section.description}</p>
        </header>
        <Panel />
      </main>
    </div>
  );
}

function AdminGate() {
  const { adminKey } = useAdmin();
  return adminKey ? <Dashboard /> : <LoginScreen />;
}

function Admin() {
  // The public site locks body scrolling; the admin needs a normal page
  useEffect(() => {
    document.body.classList.add('admin-page');
    return () => document.body.classList.remove('admin-page');
  }, []);

  return (
    <div className="admin">
      <AdminProvider>
        <AdminGate />
      </AdminProvider>
    </div>
  );
}

export default Admin;
