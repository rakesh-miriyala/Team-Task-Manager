import React, { useState, useEffect } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import api from '../lib/api';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  existingMemberIds: string[];
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, onSuccess, projectId, existingMemberIds }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setFetching(true);
        try {
          const res = await api.get('/users');
          // Filter out users who are already members
          const availableUsers = res.data.filter((u: any) => !existingMemberIds.includes(u.id));
          setUsers(availableUsers);
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen, existingMemberIds]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setLoading(true);
    try {
      // In this app, "Invite" just adds them to the project
      // The updateProject endpoint handles member IDs
      const res = await api.get(`/projects/${projectId}`);
      const currentMemberIds = res.data.members.map((m: any) => m.userId);
      
      await api.put(`/projects/${projectId}`, {
        memberIds: [...currentMemberIds, selectedUserId]
      });
      
      onSuccess();
      onClose();
      setSelectedUserId('');
    } catch (err) {
      console.error(err);
      alert('Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Add Team Member</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Select User</label>
            {fetching ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                Finding potential members...
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-slate-500 py-3 italic">No other users available to add.</p>
            ) : (
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Choose a user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            )}
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
              disabled={loading || !selectedUserId}
              type="submit"
              className="flex-2 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
