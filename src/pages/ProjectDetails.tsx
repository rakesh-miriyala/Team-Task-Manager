import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users as UsersIcon, 
  Plus, 
  ArrowLeft,
  Settings,
  X,
  Loader2,
  Trash2
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import CreateTaskModal from '../components/CreateTaskModal';
import InviteMemberModal from '../components/InviteMemberModal';
import CreateProjectModal from '../components/CreateProjectModal';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const { user } = useAuthStore();

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error(err);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id, navigate]);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
     try {
        await api.put(`/tasks/${taskId}`, { status: newStatus });
        // Optimistic update
        setProject((prev: any) => ({
           ...prev,
           tasks: prev.tasks.map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t)
        }));
     } catch (err) {
        console.error(err);
     }
  };

  const deleteProject = async () => {
     if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
     try {
        await api.delete(`/projects/${id}`);
        navigate('/projects');
     } catch (err) {
        console.error(err);
     }
  };

  const deleteTask = async (taskId: string) => {
     if (!window.confirm('Are you sure you want to delete this task?')) return;
     try {
        await api.delete(`/tasks/${taskId}`);
        setProject((prev: any) => ({
           ...prev,
           tasks: prev.tasks.filter((t: any) => t.id !== taskId)
        }));
     } catch (err) {
        console.error(err);
     }
  };

  const removeMember = async (userId: string) => {
     if (!window.confirm('Remove this member from the project?')) return;
     try {
        const currentMemberIds = project.members.map((m: any) => m.userId);
        const newMemberIds = currentMemberIds.filter((id: string) => id !== userId);
        
        await api.put(`/projects/${id}`, { memberIds: newMemberIds });
        fetchProject();
     } catch (err) {
        console.error(err);
     }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="space-y-8 pb-12 font-sans">
      <div className="flex flex-col gap-4">
        <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{project.title}</h1>
            <p className="text-gray-500 leading-relaxed">{project.description || 'No description provided for this project.'}</p>
            
            <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                   <Calendar className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                   <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Due Date</p>
                   <p className="text-sm font-bold text-gray-700">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 rounded-lg">
                   <UsersIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                   <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Team Size</p>
                   <p className="text-sm font-bold text-gray-700">{project.members.length} Members</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
             {user?.role === 'ADMIN' && (
                <>
                   <button onClick={deleteProject} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 className="w-5 h-5" />
                   </button>
                   <button 
                      onClick={() => setIsEditProjectModalOpen(true)}
                      className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-gray-200 hover:bg-black transition-all"
                   >
                      <Settings className="w-4 h-4" />
                      Project Settings
                   </button>
                </>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                 Tasks
                 <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-md">{project.tasks.length}</span>
              </h2>
              {user?.role === 'ADMIN' && (
                 <button 
                  onClick={() => setIsTaskModalOpen(true)}
                  className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all flex items-center gap-1 font-bold text-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Task
                 </button>
              )}
           </div>

           <div className="space-y-4">
              {project.tasks.map((task: any) => (
                 <div key={task.id} className={`group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 ${task.status === 'COMPLETED' ? 'opacity-70' : ''}`}>
                    <div className="w-5 h-5 shrink-0">
                       <input 
                        type="checkbox" 
                        checked={task.status === 'COMPLETED'}
                        onChange={(e) => updateTaskStatus(task.id, e.target.checked ? 'COMPLETED' : 'TODO')}
                        className="w-5 h-5 rounded-lg border-2 border-gray-200 text-indigo-600 focus:ring-indigo-500/20 transition-all cursor-pointer"
                       />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className={`text-sm font-bold text-gray-900 truncate ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>{task.title}</h4>
                       <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                             task.priority === 'HIGH' ? 'text-rose-500' : 
                             task.priority === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'
                          }`}>
                             {task.priority}
                          </span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          <span className="text-xs text-gray-400 font-medium">Assigned to: {task.assignedTo?.name || 'Unassigned'}</span>
                       </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                       <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-indigo-100">
                          {task.assignedTo?.name?.charAt(0) || '?'}
                       </div>
                       {user?.role === 'ADMIN' && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={(e) => {
                                  e.preventDefault();
                                  setEditingTask(task);
                                  setIsTaskModalOpen(true);
                               }}
                               className="p-2 text-gray-300 hover:text-indigo-600 rounded-lg transition-colors"
                             >
                                <Settings className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={(e) => {
                                  e.preventDefault();
                                  deleteTask(task.id);
                               }}
                               className="p-2 text-gray-300 hover:text-rose-500 rounded-lg transition-colors"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       )}
                    </div>
                 </div>
              ))}

              {project.tasks.length === 0 && (
                 <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium italic">No tasks created for this project yet.</p>
                 </div>
              )}
           </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-xl font-black text-gray-900 tracking-tight">Team Members</h2>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              {project.members.map((m: any) => (
                 <div key={m.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-100">
                          {m.user.name.charAt(0).toUpperCase()}
                       </div>
                       <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{m.user.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{m.user.email}</p>
                       </div>
                    </div>
                    {user?.role === 'ADMIN' && m.userId !== user.id && (
                       <button 
                        onClick={() => removeMember(m.userId)}
                        className="p-1.5 text-gray-300 hover:text-rose-500 rounded-lg transition-colors"
                      >
                          <X className="w-4 h-4" />
                       </button>
                    )}
                 </div>
              ))}
              {user?.role === 'ADMIN' && (
                 <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="w-full mt-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Invite Member
                 </button>
              )}
           </div>
        </div>
      </div>

      <CreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => {
           setIsTaskModalOpen(false);
           setEditingTask(null);
        }} 
        onSuccess={fetchProject} 
        projectId={id}
        task={editingTask}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchProject}
        projectId={id!}
        existingMemberIds={project.members.map((m: any) => m.userId)}
      />

      <CreateProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        onSuccess={fetchProject}
        project={project}
      />
    </div>
  );
};

export default ProjectDetails;
