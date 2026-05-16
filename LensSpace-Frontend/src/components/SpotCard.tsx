import { Link } from 'react-router-dom';
import { MapPin, ShieldAlert, ShieldCheck, Shield, CloudRain, Sun, Users, UserMinus, Leaf, Camera } from 'lucide-react';
import { Spot } from '../types/Spot';

export default function SpotCard({ spot }: { spot: Spot }) {
  // Safety Badge
  const safetyColors = {
    'Safe': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
    'Caution': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    'High Risk': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  const SafetyIcon = spot.safetyLevel === 'Safe' ? ShieldCheck : spot.safetyLevel === 'Caution' ? Shield : ShieldAlert;

  // Status Badge
  const statusConfig = {
    'Crowded': { icon: Users, color: 'text-amber-500' },
    'Quiet': { icon: UserMinus, color: 'text-emerald-500' },
    'Rainy': { icon: CloudRain, color: 'text-blue-500' },
    'Clear Sky': { icon: Sun, color: 'text-amber-400' }
  };
  const StatusIcon = statusConfig[spot.liveStatus]?.icon || Sun;
  const statusColor = statusConfig[spot.liveStatus]?.color || 'text-slate-500';

  // Fallback image using unsplash source if no image provided (Spot model doesn't have image field per prompt, so we use a placeholder gradient or random pattern based on ID)
  const gradientSeed = spot._id ? parseInt(spot._id.slice(0, 8), 16) % 360 : 0;

  return (
    <Link 
      to={`/spot/${spot._id}`}
      className="group block bg-white dark:bg-slate-800 rounded-2xl overflow-hidden hover-lift border border-slate-200 dark:border-slate-700 shadow-sm"
    >
      <div 
        className="h-48 w-full relative overflow-hidden bg-slate-900"
      >
        {spot.image ? (
          <img 
            src={`http://localhost:8000/${spot.image.replace(/\\/g, '/')}`} 
            alt={spot.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center text-slate-700">
            <Camera className="w-10 h-10 mb-2 opacity-30" />
            <span className="text-xs font-medium uppercase tracking-widest opacity-30">LensSpace</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
        
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md ${safetyColors[spot.safetyLevel]} bg-white/90`}>
            <SafetyIcon className="w-3 h-3" />
            {spot.safetyLevel}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-sm">
            <StatusIcon className={`w-3 h-3 ${statusColor}`} />
            {spot.liveStatus}
          </span>
        </div>
        
        {spot.ecoScore > 7 && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white p-1.5 rounded-full backdrop-blur-md shadow-sm" title="High Eco Score">
            <Leaf className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{spot.name}</h3>
            <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">{spot.location}</span>
            </p>
          </div>
          <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap">
            {spot.category}
          </span>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mt-3 mb-4">
          {spot.description}
        </p>
        
        <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center justify-between text-sm">
          <span className="text-blue-600 dark:text-blue-400 font-medium">View Details &rarr;</span>
          <span className="text-slate-400 text-xs font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
            Score: {spot.ecoScore}/10
          </span>
        </div>
      </div>
    </Link>
  );
}
