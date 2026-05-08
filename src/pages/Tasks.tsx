import { useEffect, useState } from 'react';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  MoreVertical,
  Plus,
  Loader2,
  AlertCircle,
  Settings,
  Trash2
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import CreateTaskModal from '../components/CreateTaskModal';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const { user } = useAuthStore();

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks', { params: filter });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const updateStatus = async (taskId: string, status: string) => {
     try {
        await api.put(`/tasks/${taskId}`, { status });
        setTasks((prev: any) => prev.map((t: any) => t.id === taskId ? { ...t, status } : t));
     } catch (err) {
        console.error(err);
     }
  };

  const deleteTask = async (taskId: string) => {
     if (!window.confirm('Are you sure you want to delete this task?')) return;
     try {
        await api.delete(`/tasks/${taskId}`);
        setTasks((prev: any) => prev.filter((t: any) => t.id !== taskId));
     } catch (err) {
        console.error(err);
     }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage your tasks across all projects.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select 
             className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
             onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
           <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
              />
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tasks.length} total tasks</span>
           </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-20 text-blue-500">
             <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : tasks.length > 0 ? (
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4 border-b border-slate-50">Task Info</th>
                  <th className="px-6 py-4 border-b border-slate-50">Project</th>
                  <th className="px-6 py-4 border-b border-slate-50">Priority</th>
                  <th className="px-6 py-4 border-b border-slate-50">Status</th>
                  <th className="px-6 py-4 border-b border-slate-50">Due Date</th>
                  <th className="px-6 py-4 border-b border-slate-50"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.map((task: any) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={task.status === 'COMPLETED'}
                            onChange={(e) => updateStatus(task.id, e.target.checked ? 'COMPLETED' : 'TODO')}
                            className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer"
                          />
                          <div>
                             <p className={`text-sm font-bold text-slate-900 ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>{task.title}</p>
                             <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{task.description}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">{task.project.title}</span>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                             task.priority === 'HIGH' ? 'bg-red-500' : 
                             task.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${
                             task.priority === 'HIGH' ? 'text-red-500' : 
                             task.priority === 'MEDIUM' ? 'text-blue-500' : 'text-green-500'
                          }`}>
                             {task.priority}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <select 
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1 border-none focus:ring-0 cursor-pointer ${
                          task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                          task.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}
                       >
                         <option value="TODO">To Do</option>
                         <option value="IN_PROGRESS">In Progress</option>
                         <option value="COMPLETED">Completed</option>
                       </select>
                    </td>
                    <td className="px-6 py-5 text-xs text-slate-500 font-bold whitespace-nowrap">
                       {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {user?.role === 'ADMIN' && (
                           <>
                             <button 
                               onClick={() => {
                                 setEditingTask(task);
                                 setIsTaskModalOpen(true);
                               }}
                               className="p-2 text-slate-300 hover:text-blue-600 rounded-lg transition-colors"
                             >
                                <Settings className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => deleteTask(task.id)}
                               className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                           </>
                         )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-slate-400 font-bold italic tracking-tight">No tasks matching your current filters.</p>
          </div>
        )}
      </div>

      <CreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => {
           setIsTaskModalOpen(false);
           setEditingTask(null);
        }} 
        onSuccess={fetchTasks} 
        task={editingTask}
      />
    </div>
  );
};

export default Tasks;
