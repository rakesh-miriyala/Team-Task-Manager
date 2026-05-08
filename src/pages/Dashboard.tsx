import { useEffect, useState } from 'react';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CreateProjectModal from '../components/CreateProjectModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Stats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  tasksByStatus: { status: string; count: number }[];
  recentActivity: any[];
}

const StatCard = ({ title, value, color, trend, accentColor }: any) => {
  const isRed = accentColor === 'red';
  return (
    <div className={cn(
      "p-6 rounded-2xl shadow-sm border transition-all",
      isRed ? "bg-red-50 border-red-100" : "bg-white border-slate-100"
    )}>
      <p className={cn("text-sm font-medium", isRed ? "text-red-600" : "text-slate-500")}>{title}</p>
      <p className={cn("text-3xl font-bold mt-1", isRed ? "text-red-700" : "text-slate-900")}>{value}</p>
      {trend && (
        <p className={cn("text-xs mt-2 font-semibold", isRed ? "text-red-500" : (accentColor === 'blue' ? "text-blue-600" : "text-green-600"))}>
          {trend}
        </p>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  const COLORS = ['#2563eb', '#818cf8', '#fbbf24', '#f87171'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor project health and team productivity.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
          >
            + Create Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value={stats?.totalProjects} trend="+2 since last month" accentColor="green" />
        <StatCard title="Active Tasks" value={stats?.totalTasks} trend={`${stats?.pendingTasks} in progress`} accentColor="blue" />
        <StatCard title="Completed" value={stats?.completedTasks} trend="94% success rate" accentColor="green" />
        <StatCard title="Overdue" value={stats?.overdueTasks} trend="Requires attention" accentColor="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800">Recent Tasks</h2>
            <button className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 bg-slate-50/50">
                  <th className="px-6 py-3">Task Description</th>
                  <th className="px-6 py-3 text-center">Priority</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3">Project</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats?.recentActivity.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={cn(
                          "text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase",
                          task.priority === 'HIGH' ? "bg-red-100 text-red-700" :
                          task.priority === 'MEDIUM' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                        )}>
                          {task.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={cn(
                          "text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase",
                          task.status === 'COMPLETED' ? "bg-green-100 text-green-700" :
                          task.status === 'IN_PROGRESS' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                        )}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {task.project.title}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h2 className="font-bold text-slate-800 mb-6">Tasks by Status</h2>
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="relative h-32 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.tasksByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={64}
                    paddingAngle={5}
                    dataKey="count"
                    stroke="none"
                  >
                    {stats?.tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-800">{stats?.totalTasks}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Tasks</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              {stats?.tasksByStatus.map((item, idx) => (
                <div key={item.status} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-slate-600 capitalize">{item.status.replace('_', ' ').toLowerCase()}</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {Math.round((item.count / (stats.totalTasks || 1)) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 italic leading-relaxed text-center">
                "Velocity is up 12% compared to last week. Keep up the momentum!"
              </p>
            </div>
          </div>
        </div>
      </div>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchStats} 
      />
    </div>
  );
};

export default Dashboard;
