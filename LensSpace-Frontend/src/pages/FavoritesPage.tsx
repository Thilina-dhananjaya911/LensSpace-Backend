import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import SpotCard from '../components/SpotCard';
import { Spot } from '../types/Spot';

export default function FavoritesPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch favorite spots');
      const data = await response.json();
      setSpots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-2xl">
          <Heart className="w-8 h-8 text-rose-500 fill-current" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Favorites</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Spots you've saved for later.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center">
          {error}
        </div>
      )}

      {!loading && !error && spots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
          <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-full mb-6">
            <Heart className="w-12 h-12 text-slate-300 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No favorites yet</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
            You haven't saved any spots yet. Start exploring and click the heart icon on spots you love!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((spot) => (
            <SpotCard key={spot._id} spot={spot} />
          ))}
        </div>
      )}
    </div>
  );
}
