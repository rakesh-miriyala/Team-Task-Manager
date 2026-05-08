import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, CheckSquare } from 'lucide-react';
import api from '../lib/api';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId?: string;
  task?: any; // Add task prop for editing
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSuccess, projectId, task }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    assignedToId: '',
    projectId: projectId || ''
  });
  
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          priority: task.priority || 'MEDIUM',
          status: task.status || 'TODO',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          assignedToId: task.assignedToId || '',
          projectId: task.projectId || projectId || ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          status: 'TODO',
          dueDate: '',
          assignedToId: '',
          projectId: projectId || ''
        });
      }

      if (!projectId && !task) {
        api.get('/projects').then(res => setProjects(res.data));
      }
      api.get('/users').then(res => setUsers(res.data));
    }
  }, [isOpen, projectId, task]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (task) {
        await api.put(`/tasks/${task.id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save task', err);
      alert('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{task ? 'Edit Task' : 'Create New Task'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Task Title</label>
            <input
              required
              type="text"
              placeholder="e.g. Design homepage hero section"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {!projectId && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Project</label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              >
                <option value="">Select a project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea
              rows={2}
              placeholder="Provide some details about the task..."
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Priority</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Assign To</label>
            <select
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
              value={formData.assignedToId}
              onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="flex-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (task ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
