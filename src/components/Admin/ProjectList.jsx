function ProjectList({ projects, onEdit, onDelete }) {
  if (!projects || projects.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem', 
        color: '#888' 
      }}>
        <p>No projects yet. Create your first project!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Projects</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {projects.map((project) => (
          <div
            key={project._id}
            style={{
              background: '#1a1a1a',
              padding: '1.5rem',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{project.title}</h3>
              <p style={{ 
                color: '#888', 
                fontSize: '14px',
                marginBottom: '0.5rem' 
              }}>
                {project.description}
              </p>
              <span style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                background: '#2a2a2a',
                borderRadius: '4px',
                fontSize: '12px',
                textTransform: 'uppercase',
                color: '#aaa'
              }}>
                {project.category}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => onEdit(project)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(project._id)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectList;
