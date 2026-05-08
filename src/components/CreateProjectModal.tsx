import React, { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Layout } from 'lucide-react';
import api from '../lib/api';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: any; // Add project prop for editing
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSuccess, project }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    memberIds: [] as string[]
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData({
          title: project.title || '',
          description: project.description || '',
          dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
          memberIds: project.members?.map((m: any) => m.userId) || []
        });
      } else {
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          memberIds: []
        });
      }

      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const res = await api.get('/users');
          setUsers(res.data);
        } catch (err) {
          console.error('Failed to fetch users', err);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (project) {
        await api.put(`/projects/${project.id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save project', err);
      alert('Failed to save project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Layout className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{project ? 'Edit Project' : 'Create New Project'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Project Title</label>
            <input
              required
              type="text"
              placeholder="e.g. Website Redesign"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Tell us about the project goals..."
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Team Members</label>
              <select
                multiple
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-medium min-h-[100px]"
                value={formData.memberIds}
                onChange={(e) => {
                  const options = e.target.options;
                  const values = [];
                  for (let i = 0; i < options.length; i++) {
                    if (options[i].selected) {
                      values.push(options[i].value);
                    }
                  }
                  setFormData({ ...formData, memberIds: values });
                }}
              >
                {loadingUsers ? (
                  <option disabled>Loading users...</option>
                ) : (
                  users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))
                )}
              </select>
              <p className="text-[10px] text-slate-400 mt-1 italic">Hold Ctrl/Cmd to select multiple members.</p>
            </div>
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
              className="flex-3 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (project ? 'Save Changes' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
