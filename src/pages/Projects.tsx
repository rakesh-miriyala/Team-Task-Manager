import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Calendar, 
  Users as UsersIcon, 
  Plus, 
  MoreVertical,
  Search,
  Loader2
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import CreateProjectModal from '../components/CreateProjectModal';

import { Settings, Trash2 } from 'lucide-react';

const ProjectCard = ({ project, onEdit, onDelete, isAdmin }: any) => {
  return (
    <Link to={`/projects/${project.id}`} className="block group">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-600 transition-colors">
            <FolderKanban className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
          </div>
          {isAdmin && (
            <div className="flex gap-1" onClick={(e) => e.preventDefault()}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project.id);
                }}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2 truncate">{project.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-6 h-10">{project.description || 'No description provided.'}</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Calendar className="w-4 h-4" />
              {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
            </div>
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <UsersIcon className="w-4 h-4 text-blue-500" />
              {project._count.members}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
               <span className="text-slate-500">Progress</span>
               <span className="text-blue-600">{project._count.tasks} Tasks</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
               <div 
                className="h-full bg-blue-500 transition-all duration-1000" 
                style={{ width: '60%' }} // Placeholder for progress visual
               ></div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const { user } = useAuthStore();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track your ongoing projects.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
              />
           </div>
           {user?.role === 'ADMIN' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </button>
           )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
           <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((p: any) => (
            <ProjectCard 
              key={p.id} 
              project={p} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={user?.role === 'ADMIN'}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-8 h-8 text-slate-400" />
           </div>
           <h3 className="text-lg font-bold text-slate-900">No projects yet</h3>
           <p className="text-slate-500 mt-1 max-w-xs mx-auto">Get started by creating your first team project.</p>
           {user?.role === 'ADMIN' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 text-blue-600 font-bold hover:underline"
              >
                Create First Project
              </button>
           )}
        </div>
      )}

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }} 
        onSuccess={fetchProjects}
        project={editingProject}
      />
    </div>
  );
};

export default Projects;
