import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { errorMessage, useAdmin, useAdminMutation } from './AdminContext';
import ProjectEditor from './ProjectEditor';
import { CATEGORIES, categoryLabel } from './categories';

function ProjectsPanel() {
  const projects = useQuery(api.projects.getAdminProjects);
  const deleteProject = useAdminMutation(api.projects.deleteProject);
  const reorderProjects = useAdminMutation(api.projects.reorderProjects);
  const { toast } = useAdmin();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  // null = closed, 'new' = creating, otherwise the project id being edited
  const [editing, setEditing] = useState(null);

  const counts = useMemo(() => {
    const result = { all: projects?.length || 0 };
    for (const c of CATEGORIES) {
      result[c.value] = projects?.filter((p) => p.category === c.value).length || 0;
    }
    return result;
  }, [projects]);

  const visible = useMemo(() => {
    if (!projects) return [];
    const query = search.trim().toLowerCase();
    return projects.filter((p) =>
      (filter === 'all' || p.category === filter) &&
      (!query || p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query))
    );
  }, [projects, filter, search]);

  // Swap a project with its neighbour in the current (filtered) list
  const handleMove = async (index, direction) => {
    const a = visible[index];
    const b = visible[index + direction];
    if (!a || !b) return;
    const ids = projects.map((p) => p._id);
    const ia = ids.indexOf(a._id);
    const ib = ids.indexOf(b._id);
    [ids[ia], ids[ib]] = [ids[ib], ids[ia]];
    try {
      await reorderProjects({ projectIds: ids });
    } catch (error) {
      toast(errorMessage(error), 'error');
    }
  };

  const handleDelete = async (project) => {
    const imageNote = project.imageCount ? ` and its ${project.imageCount} image${project.imageCount === 1 ? '' : 's'}` : '';
    if (!confirm(`Delete "${project.title}"${imageNote}? This can't be undone.`)) return;
    try {
      await deleteProject({ id: project._id });
      toast(`Deleted "${project.title}"`);
    } catch (error) {
      toast(errorMessage(error), 'error');
    }
  };

  const editingProject = editing && editing !== 'new'
    ? projects?.find((p) => p._id === editing)
    : null;

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-chips" role="tablist">
          {[{ value: 'all', label: 'All' }, ...CATEGORIES].map((c) => (
            <button
              key={c.value}
              role="tab"
              aria-selected={filter === c.value}
              className={`admin-chip ${filter === c.value ? 'is-active' : ''}`}
              onClick={() => setFilter(c.value)}
            >
              {c.label} <span className="admin-chip-count">{counts[c.value]}</span>
            </button>
          ))}
        </div>
        <div className="admin-toolbar-right">
          <input
            type="search"
            className="admin-input admin-search"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="admin-btn admin-btn-primary" onClick={() => setEditing('new')}>
            + New project
          </button>
        </div>
      </div>

      {projects === undefined ? (
        <div className="admin-empty">Loading projects…</div>
      ) : visible.length === 0 ? (
        <div className="admin-empty">
          {projects.length === 0
            ? 'No projects yet. Click "New project" to add the first one.'
            : 'No projects match this filter.'}
        </div>
      ) : (
        <ul className="admin-project-list">
          {visible.map((project, index) => (
            <li key={project._id} className="admin-project-row">
              <div className="admin-order-buttons">
                <button
                  className="admin-icon-btn"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${project.title} up`}
                  title="Move up"
                >↑</button>
                <button
                  className="admin-icon-btn"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === visible.length - 1}
                  aria-label={`Move ${project.title} down`}
                  title="Move down"
                >↓</button>
              </div>

              <button className="admin-project-thumb" onClick={() => setEditing(project._id)} aria-label={`Edit ${project.title}`}>
                {project.featuredImage
                  ? <img src={project.featuredImage.url} alt="" loading="lazy" />
                  : <span>No image</span>}
              </button>

              <div className="admin-project-info">
                <div className="admin-project-title">{project.title}</div>
                <div className="admin-project-desc">{project.description}</div>
                <div className="admin-project-meta">
                  <span className={`admin-badge admin-badge-${project.category}`}>{categoryLabel(project.category)}</span>
                  <span>{project.imageCount} image{project.imageCount === 1 ? '' : 's'}</span>
                  {project.imageCount === 0 && (
                    <span className="admin-warning">Hidden from gallery until it has an image</span>
                  )}
                </div>
              </div>

              <div className="admin-project-actions">
                <button className="admin-btn" onClick={() => setEditing(project._id)}>Edit</button>
                <button className="admin-btn admin-btn-danger-ghost" onClick={() => handleDelete(project)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (editing === 'new' || editingProject) && (
        <ProjectEditor
          key={editing}
          project={editingProject}
          defaultCategory={filter === 'all' ? 'interior' : filter}
          onCreated={(id) => setEditing(id)}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

export default ProjectsPanel;
