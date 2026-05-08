import { Bell, Search, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Navbar = () => {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks or projects..."
            className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</span>
        </button>
        
        <div className="flex items-center space-x-3 border-l pl-6 border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-blue-700 font-bold text-sm">
            {user?.name.charAt(0).toUpperCase()}{user?.name.split(' ')[1]?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
