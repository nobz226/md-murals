import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import ProjectForm from '../components/Admin/ProjectForm';
import ProjectList from '../components/Admin/ProjectList';
import SoundManager from '../components/Admin/SoundManager';
import AboutForm from '../components/Admin/AboutForm';
import SeedButton from '../components/SeedButton';

function Admin() {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const projects = useQuery(api.projects.getAllProjects);
  const deleteProject = useMutation(api.projects.deleteProject);
  const createProject = useMutation(api.projects.createProject);

  // Allow scrolling on admin page
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.body.style.cursor = 'default';
    
    return () => {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.cursor = 'grab';
    };
  }, []);

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async (projectId) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject({ id: projectId });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleNewProject = async () => {
    // Create a draft project immediately
    const projectId = await createProject({
      title: 'New Project',
      description: 'Enter description here',
      category: 'interior'
    });
    
    // Open form in edit mode with the new project
    const newProject = projects?.find(p => p._id === projectId) || {
      _id: projectId,
      title: 'New Project',
      description: 'Enter description here',
      category: 'interior'
    };
    setEditingProject(newProject);
    setShowForm(true);
  };

  return (
    <div style={{ 
      padding: '2rem', 
      color: 'white',
      minHeight: '100vh',
      background: '#000'
    }}>
      <SeedButton />
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1>Admin Dashboard</h1>
          <button 
            onClick={handleNewProject}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            + New Project
          </button>
        </div>

        {showForm && (
          <ProjectForm 
            project={editingProject}
            onClose={handleFormClose}
          />
        )}

        <AboutForm />

        <SoundManager />

        <ProjectList 
          projects={projects || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default Admin;
