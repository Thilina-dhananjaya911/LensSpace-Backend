import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Spot } from '../types/Spot';
import { Loader2 } from 'lucide-react';

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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] glass px-6 py-2 rounded-full shadow-lg">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white">Map View ({spots.length} Spots)</h2>
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
        
        {spots.map(spot => {
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
