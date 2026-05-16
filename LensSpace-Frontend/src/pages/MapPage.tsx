import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Spot } from '../types/Spot';
import { Loader2, Heart } from 'lucide-react';

// Fix for default marker icons in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteSpotIds, setFavoriteSpotIds] = useState<string[]>([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const response = await fetch('/api/spot/getall');
      if (response.ok) {
        const data = await response.json();
        setSpots(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorites = async () => {
    if (!token) return alert('Please login to filter your favorites');
    
    if (!showFavoritesOnly && favoriteSpotIds.length === 0) {
      try {
        const response = await fetch('/api/users/favorites', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setFavoriteSpotIds(data.map((fav: any) => fav._id));
        }
      } catch (err) {
        console.error("Failed to fetch favorites", err);
      }
    }
    setShowFavoritesOnly(!showFavoritesOnly);
  };

  const displayedSpots = showFavoritesOnly 
    ? spots.filter(spot => favoriteSpotIds.includes(spot._id))
    : spots;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  // Default center (can be dynamic based on spots, but using a generic fallback)
  const defaultCenter: [number, number] = spots.length > 0 && spots[0].latitude && spots[0].longitude 
    ? [spots[0].latitude, spots[0].longitude] 
    : [37.7749, -122.4194]; // San Francisco as fallback

  return (
    <div className="flex-1 flex flex-col relative z-0">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 glass px-6 py-2 rounded-full shadow-lg">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white">Map View ({displayedSpots.length} Spots)</h2>
        
        {token && (
          <>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
            <button 
              onClick={handleToggleFavorites}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-colors ${showFavoritesOnly ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favorites Only
            </button>
          </>
        )}
      </div>
      
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        style={{ height: '100%', width: '100%', flex: 1 }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {displayedSpots.map(spot => {
          if (spot.latitude && spot.longitude) {
            return (
              <Marker key={spot._id} position={[spot.latitude, spot.longitude]}>
                <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
                  <div className="p-1 min-w-[200px]">
                    <h3 className="font-bold text-slate-900 mb-1">{spot.name}</h3>
                    <p className="text-xs text-slate-500 mb-3">{spot.category}</p>
                    <Link 
                      to={`/spot/${spot._id}`}
                      className="block w-full text-center bg-blue-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}
