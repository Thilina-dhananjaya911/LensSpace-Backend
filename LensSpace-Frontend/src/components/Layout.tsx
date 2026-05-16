import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Map as MapIcon, PlusCircle, Search, LogOut, User, Heart, ChevronDown } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    setDropdownOpen(false);
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
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{userName}</span>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                        <Link 
                          to="/favorites" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          <Heart className="w-4 h-4 text-rose-500" />
                          My Favorites
                        </Link>
                        <hr className="my-1 border-slate-200 dark:border-slate-700" />
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
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
