import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpotFormData } from '../types/Spot';
import { Loader2, Save, MapPin, Camera, AlertCircle, Search } from 'lucide-react';

export default function SpotFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // 5 visible form fields
  const [formData, setFormData] = useState<SpotFormData>({
    title: '',
    location: '',
    description: '',
    category: '',
    bestTimeToVisit: '',
    safetyLevel: 'Safe',
    image: null,
  });

  // Hidden coords — never shown to user, auto-captured from geocoding
  const [coords, setCoords] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });

  // Location autocomplete state
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (isEditing) fetchSpot();
  }, [id]);

  const fetchSpot = async () => {
    try {
      const response = await fetch(`/api/spot/get/${id}`);
      if (!response.ok) throw new Error('Failed to fetch spot details');
      const data = await response.json();
      const spot = data.spot || data;
      setFormData({
        title: spot.title || '',
        location: spot.location || '',
        description: spot.description || '',
        category: spot.category || '',
        bestTimeToVisit: spot.bestTimeToVisit || '',
        safetyLevel: spot.safetyLevel || 'Safe',
        image: null,
      });
      setCoords({
        latitude: spot.latitude ?? null,
        longitude: spot.longitude ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching spot');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Auto-geocode as user types in location field (debounced)
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, location: value }));
    setCoords({ latitude: null, longitude: null }); // reset coords until new selection
    setShowSuggestions(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&email=hello@lensspace.com`
        );
        const data = await res.json();
        setLocationSuggestions(data);
      } catch {
        setLocationSuggestions([]);
      } finally {
        setIsGeocoding(false);
      }
    }, 500);
  };

  // When user picks a suggestion — capture coords silently
  const handleSelectSuggestion = (suggestion: any) => {
    setFormData(prev => ({ ...prev, location: suggestion.display_name }));
    setCoords({
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    });
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  // GPS button — silently grabs device coordinates
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        // Also reverse-geocode to fill the location text
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&email=hello@lensspace.com`
        )
          .then(r => r.json())
          .then(data => {
            if (data.display_name) {
              setFormData(prev => ({ ...prev, location: data.display_name }));
            }
          })
          .catch(() => {
            setFormData(prev => ({ ...prev, location: 'Current Location' }));
          });
      },
      (err) => alert(`GPS Error: ${err.message}`)
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const url = isEditing ? `/api/spot/update/${id}` : '/api/spot/create';
      const method = isEditing ? 'PUT' : 'POST';

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('location', formData.location);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      if (formData.bestTimeToVisit) submitData.append('bestTimeToVisit', formData.bestTimeToVisit);
      submitData.append('safetyLevel', formData.safetyLevel);
      if (formData.image) submitData.append('image', formData.image);

      // Silently append coords for Map View — user never sees these
      if (coords.latitude !== null) submitData.append('latitude', String(coords.latitude));
      if (coords.longitude !== null) submitData.append('longitude', String(coords.longitude));

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save spot');
      }

      const result = await response.json();
      const savedId = isEditing ? id : result._id;
      navigate(`/spot/${savedId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving spot');
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full text-center border border-slate-800">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Please Login or Register to contribute a photography spot to LensSpace.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/login')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
              Go to Login
            </button>
            <button onClick={() => navigate(-1)} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-colors">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Camera className="w-6 h-6" />
          </div>
          {isEditing ? 'Edit Spot' : 'Share a New Spot'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 ml-14">
          Add details about this amazing photography location.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
      >
        {/* Spot Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Spot Name *
          </label>
          <input
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            placeholder="e.g. Hidden Waterfall"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Category *
          </label>
          <input
            required
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            placeholder="e.g. Nature, Urban, Portrait, Astrophotography"
          />
        </div>

        {/* Safety Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Safety Level *
          </label>
          <select
            required
            name="safetyLevel"
            value={formData.safetyLevel}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
          >
            <option value="Safe">✅ Safe</option>
            <option value="Caution">⚠️ Caution</option>
            <option value="High Risk">🔴 High Risk</option>
          </select>
        </div>

        {/* Location — with hidden geocoding */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Location *
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              {isGeocoding && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
              )}
              <input
                required
                name="location"
                value={formData.location}
                onChange={handleLocationChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="Search for a place..."
                autoComplete="off"
              />
              {/* Autocomplete dropdown */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                  {locationSuggestions.map((sug, i) => (
                    <li
                      key={i}
                      onMouseDown={() => handleSelectSuggestion(sug)}
                      className="px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700 last:border-0 flex items-start gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{sug.display_name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* GPS Button */}
            <button
              type="button"
              onClick={handleUseGPS}
              title="Use my current location"
              className="px-3 py-2.5 bg-slate-100 hover:bg-blue-50 dark:bg-slate-700 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap text-sm font-medium border border-slate-200 dark:border-slate-600"
            >
              🎯 GPS
            </button>
          </div>
          {/* Subtle coord confirmation — just a pin icon, no numbers shown */}
          {coords.latitude !== null && (
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location pinned for Map View
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Description *
          </label>
          <textarea
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
            placeholder="What makes this spot special for photography?"
          />
        </div>

        {/* Best Time to Visit */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Best Time to Visit
          </label>
          <input
            name="bestTimeToVisit"
            value={formData.bestTimeToVisit}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            placeholder="e.g. Golden hour, Early morning, Winter sunsets"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Spot Image {!isEditing && '*'}
          </label>
          <input
            type="file"
            accept="image/*"
            required={!isEditing}
            onChange={handleFileChange}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100 cursor-pointer text-slate-500 dark:text-slate-400"
          />
          {isEditing && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Leave empty to keep the existing image.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Spot'}
          </button>
        </div>
      </form>
    </div>
  );
}
