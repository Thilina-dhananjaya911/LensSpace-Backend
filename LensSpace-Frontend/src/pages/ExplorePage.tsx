import { useState, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import SpotCard from '../components/SpotCard';
import { Spot } from '../types/Spot';

export default function ExplorePage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [safetyFilter, setSafetyFilter] = useState('');

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/spot/getall');
      if (!response.ok) throw new Error('Failed to fetch spots');
      const data = await response.json();
      // Assume API returns an array or { data: [...] }
      setSpots(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpots = spots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          spot.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? spot.category === categoryFilter : true;
    const matchesSafety = safetyFilter ? spot.safetyLevel === safetyFilter : true;
    
    return matchesSearch && matchesCategory && matchesSafety;
  });

  const categories = Array.from(new Set(spots.map(s => s.category))).filter(Boolean);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div 
        className="text-white relative py-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=1920")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-slate-900 dark:to-slate-900" />
        
        <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Capture the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Unseen</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10">
            Discover breathtaking, hidden locations shared by a community of passionate photographers and explorers.
          </p>
          
          <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-3 shadow-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search spots by name or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400 transition-all"
              />
            </div>
            
            <div className="flex gap-3 md:w-auto w-full">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 md:w-48 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white [&>option]:text-slate-900 appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select 
                value={safetyFilter}
                onChange={(e) => setSafetyFilter(e.target.value)}
                className="flex-1 md:w-48 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white [&>option]:text-slate-900 appearance-none cursor-pointer"
              >
                <option value="">All Safety Levels</option>
                <option value="Safe">Safe</option>
                <option value="Caution">Caution</option>
                <option value="High Risk">High Risk</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-500">Loading amazing spots...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-100 dark:border-red-900/50 text-center">
          <p className="font-medium">{error}</p>
          <button onClick={fetchSpots} className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Try Again
          </button>
        </div>
      ) : filteredSpots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
            <Filter className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No spots found</h3>
          <p className="text-slate-500 max-w-md mt-2">We couldn't find any spots matching your current filters. Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSpots.map(spot => (
            <SpotCard key={spot._id} spot={spot} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
