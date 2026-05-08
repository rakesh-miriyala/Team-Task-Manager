import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Settings, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const { logout, user } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Users, label: 'Team', path: '/team' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col h-full border-r border-slate-800 shrink-0">
      <div className="p-6 flex items-center space-x-3 text-white shrink-0">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">T</div>
        <span className="text-xl font-bold tracking-tight">TeamTask</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-3 rounded-xl transition-all font-medium text-sm',
                isActive
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 shrink-0 border-t border-slate-800 space-y-4">
        <div className="bg-slate-800 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider">Project Status</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Q4 Goals</span>
            <span className="text-xs font-bold text-blue-400">78%</span>
          </div>
          <div className="relative w-full bg-slate-700 rounded-full h-1.5 mt-2">
            <div 
              className="absolute left-0 top-0 bg-blue-500 h-1.5 rounded-full transition-all duration-1000" 
              style={{ width: '78%' }}
            ></div>
          </div>
        </div>

        <div className="space-y-1">
          <button className="flex w-full items-center px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition-all">
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center px-4 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
