import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Shield, ShieldAlert, ShieldCheck, Sun, CloudRain, Users, UserMinus, Leaf, Clock, Lightbulb, Navigation, Heart, Share2, Edit2, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import { Spot } from '../types/Spot';

export default function SpotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this spot?")) return;
    
    try {
      const response = await fetch(`/api/spot/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete spot. You might not be authorized.');
      navigate('/');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred while deleting');
    }
  };

  useEffect(() => {
    fetchSpot();
  }, [id]);

  const fetchSpot = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/spot/get/${id}`);
      if (!response.ok) throw new Error('Failed to fetch spot details');
      const data = await response.json();
      setSpot(data.spot || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
    </div>
  );

  if (error || !spot) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
        <h2 className="text-xl font-bold mb-2">Spot Not Found</h2>
        <p>{error || "The spot you are looking for doesn't exist."}</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-medium">
          &larr; Back to Explore
        </button>
      </div>
    </div>
  );

  // Styling maps
  const SafetyIcon = spot.safetyLevel === 'Safe' ? ShieldCheck : spot.safetyLevel === 'Caution' ? Shield : ShieldAlert;
  const safetyColors = {
    'Safe': 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
    'Caution': 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
    'High Risk': 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
  };

  const statusConfig = {
    'Crowded': { icon: Users, color: 'text-amber-500 bg-amber-50' },
    'Quiet': { icon: UserMinus, color: 'text-emerald-500 bg-emerald-50' },
    'Rainy': { icon: CloudRain, color: 'text-blue-500 bg-blue-50' },
    'Clear Sky': { icon: Sun, color: 'text-amber-500 bg-amber-50' }
  };
  const StatusIcon = statusConfig[spot.liveStatus]?.icon || Sun;
  const statusColor = statusConfig[spot.liveStatus]?.color || 'text-slate-500 bg-slate-50';

  const gradientSeed = parseInt(spot._id.slice(0, 8), 16) % 360;

  console.log("DEBUG:", { spotCreatedBy: spot.createdBy, loggedInUserId: userId });

  const isOwner = Boolean(
    token && 
    userId && 
    spot.createdBy && 
    (
      spot.createdBy === userId || 
      (spot.createdBy as any)._id === userId || 
      String(spot.createdBy) === String(userId)
    )
  );

  return (
    <div className="max-w-5xl mx-auto w-full pb-20">
      {/* Hero Section */}
      <div 
        className="w-full h-64 md:h-96 relative flex items-end p-6 md:p-12"
        style={{ background: `linear-gradient(135deg, hsl(${gradientSeed}, 80%, 60%), hsl(${(gradientSeed + 60) % 360}, 80%, 40%))` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 md:left-12 bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="absolute top-6 right-6 md:right-12 flex gap-3">
          {isOwner && (
            <>
              <Link to={`/spot/edit/${spot._id}`} className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full text-white transition-colors">
                <Edit2 className="w-5 h-5" />
              </Link>
              <button onClick={handleDelete} className="bg-white/20 hover:bg-red-500/80 backdrop-blur-md p-2 rounded-full text-white transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full text-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="bg-white/20 hover:bg-red-500/80 backdrop-blur-md p-2 rounded-full text-white transition-colors group">
            <Heart className="w-5 h-5 group-hover:fill-current" />
          </button>
        </div>

        <div className="relative z-10 w-full">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {spot.category}
            </span>
            {spot.ecoScore >= 8 && (
              <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Leaf className="w-3 h-3" /> Eco Choice ({spot.ecoScore}/10)
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">{spot.name}</h1>
          <p className="flex items-center gap-2 text-slate-200 text-lg">
            <MapPin className="w-5 h-5" /> {spot.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About this spot</h2>
            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {spot.description}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-500" /> Pro Tips
            </h2>
            <p className="text-slate-600 dark:text-slate-300 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
              {spot.tips}
            </p>
            
            <div className="mt-6 flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Best Time to Visit</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{spot.bestTime}</p>
              </div>
            </div>
          </div>

          {(spot.ecoFriendlyNotes || spot.accessibility) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {spot.ecoFriendlyNotes && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald-500" /> Eco Notes
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{spot.ecoFriendlyNotes}</p>
                </div>
              )}
              {spot.accessibility && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Accessibility</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{spot.accessibility}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Current Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Safety Level</span>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${safetyColors[spot.safetyLevel]}`}>
                  <SafetyIcon className="w-4 h-4" /> {spot.safetyLevel}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Live Vibe</span>
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${statusColor} dark:bg-slate-700`}>
                  <StatusIcon className="w-4 h-4" /> {spot.liveStatus}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Eco Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500" 
                      style={{ width: `${(spot.ecoScore / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{spot.ecoScore}/10</span>
                </div>
              </div>
            </div>
          </div>

          {spot.latitude && spot.longitude && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Location</h3>
              <div className="w-full h-40 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                <div className="flex flex-col items-center gap-2 relative z-10 text-slate-500">
                  <Navigation className="w-8 h-8 text-blue-500" />
                  <span className="text-sm font-medium">{spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}</span>
                </div>
              </div>
              <Link 
                to="/map" 
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" /> View on Map
              </Link>
            </div>
          )}

          {spot.localBusinessHint && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Local Support</h3>
              <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
                {spot.localBusinessHint}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
