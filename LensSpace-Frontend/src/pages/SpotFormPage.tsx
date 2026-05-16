import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpotFormData } from '../types/Spot';
import { Loader2, Save, MapPin, Camera, AlertCircle } from 'lucide-react';

export default function SpotFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<SpotFormData>({
    name: '',
    location: '',
    description: '',
    category: '',
    bestTime: '',
    tips: '',
    safetyLevel: 'Safe',
    liveStatus: 'Clear Sky',
    ecoFriendlyNotes: '',
    accessibility: '',
    localBusinessHint: '',
    ecoScore: 5,
    latitude: 0,
    longitude: 0,
    image: null
  });

  useEffect(() => {
    if (isEditing) {
      fetchSpot();
    }
  }, [id]);

  const fetchSpot = async () => {
    try {
      const response = await fetch(`/api/spot/get/${id}`);
      if (!response.ok) throw new Error('Failed to fetch spot details');
      const data = await response.json();
      const spot = data.spot || data;
      
      // Filter out _id, createdAt, updatedAt
      const { _id, createdAt, updatedAt, __v, ...rest } = spot as any;
      setFormData(rest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching spot');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
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
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          submitData.append(key, value as string | Blob);
        }
      });
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save spot');
      }
      
      const result = await response.json();
      const savedId = isEditing ? id : (result.spot?._id || result._id);
      
      navigate(`/spot/${savedId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving spot');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto w-full px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Camera className="w-6 h-6" />
          </div>
          {isEditing ? 'Edit Spot' : 'Share a New Spot'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 ml-14">
          Add details about this amazing location to share with the community.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        
        {/* Basic Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Basic Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Spot Name *</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="e.g. Hidden Waterfall"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category *</label>
              <input 
                required
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="e.g. Nature, Urban, Portrait"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Location Name *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  placeholder="City, Region, or exact address"
                />
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description *</label>
              <textarea 
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
                placeholder="What makes this spot special?"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Spot Image *</label>
              <input 
                type="file"
                accept="image/*"
                required={!isEditing}
                onChange={handleFileChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 cursor-pointer text-slate-500 dark:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Status & Safety */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Status & Environment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Safety Level *</label>
              <select 
                required
                name="safetyLevel"
                value={formData.safetyLevel}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              >
                <option value="Safe">Safe</option>
                <option value="Caution">Caution</option>
                <option value="High Risk">High Risk</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Vibe (Live Status) *</label>
              <select 
                required
                name="liveStatus"
                value={formData.liveStatus}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              >
                <option value="Clear Sky">Clear Sky</option>
                <option value="Quiet">Quiet</option>
                <option value="Crowded">Crowded</option>
                <option value="Rainy">Rainy</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Best Time to Visit</label>
              <input 
                name="bestTime"
                value={formData.bestTime}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="e.g. Golden hour, Early morning"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Eco Score (1-10)</label>
              <input 
                type="number"
                min="1" max="10"
                name="ecoScore"
                value={formData.ecoScore}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Details & Location */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Coordinates & Extra Info</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Latitude *</label>
              <input 
                type="number" step="any" required
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Longitude *</label>
              <input 
                type="number" step="any" required
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pro Tips</label>
              <textarea 
                name="tips"
                value={formData.tips}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
                placeholder="What should visitors bring or know?"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Accessibility</label>
              <input 
                name="accessibility"
                value={formData.accessibility}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="Wheelchair accessible, steep climb, etc."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Local Business Hint</label>
              <input 
                name="localBusinessHint"
                value={formData.localBusinessHint}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="Recommend a nearby cafe or shop"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Eco-Friendly Notes</label>
              <input 
                name="ecoFriendlyNotes"
                value={formData.ecoFriendlyNotes}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                placeholder="Pack in, pack out, stay on trail, etc."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
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
