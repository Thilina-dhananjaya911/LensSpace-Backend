import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Map as MapIcon, PlusCircle, Search, LogOut, User } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const navLinks = [
    { name: 'Explore', path: '/', icon: Search },
    { name: 'Map View', path: '/map', icon: MapIcon },
    { name: 'Add Spot', path: '/spot/new', icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 transition-colors duration-300">
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 hover-lift">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
                LensSpace
              </span>
            </Link>

            <nav className="hidden md:flex gap-1 items-center">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-700 pl-4 ml-2">
                {token ? (
                  <>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" /> {userName}
                    </span>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Log in</Link>
                    <Link to="/signup" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Sign up</Link>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile menu button (Simplified for demo) */}
            <div className="md:hidden flex items-center">
              <Link to="/spot/new" className="text-blue-600 dark:text-blue-400 p-2">
                <PlusCircle className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden sticky bottom-0 glass border-t border-slate-200/50 dark:border-slate-800/50 flex justify-around p-3 z-50">
        {navLinks.slice(0, 2).map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
