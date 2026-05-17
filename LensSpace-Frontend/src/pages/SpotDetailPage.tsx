import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Shield, ShieldAlert, ShieldCheck, Clock, Navigation, Heart, Share2, Edit2, Loader2, ArrowLeft, Trash2, Camera, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Spot } from '../types/Spot';

export default function SpotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [communityPhotos, setCommunityPhotos] = useState<any[]>([]);
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadImageFile, setUploadImageFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
    fetchCommunityPhotos();
    if (token) fetchFavoriteStatus();
  }, [id, token]);

  const fetchCommunityPhotos = async () => {
    try {
      const response = await fetch(`/api/spot/${id}/photos`);
      if (response.ok) {
        const data = await response.json();
        setCommunityPhotos(data);
      }
    } catch (err) {
      console.error("Error fetching community photos:", err);
    }
  };

  const fetchFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/users/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const favorites = await response.json();
        const found = favorites.some((fav: any) => fav && fav._id === id);
        setIsFavorited(found);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!token) {
      alert("Please log in to favorite spots.");
      return navigate('/login');
    }
    try {
      const response = await fetch(`/api/users/favorite/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `LensSpace - ${spot?.name || 'Spot'}`,
          text: `Check out this amazing photography spot on LensSpace!`,
          url: shareUrl
        });
      } catch (err) {
        // Fallback to modal if cancelled or failed
        setIsShareModalOpen(true);
      }
    } else {
      setIsShareModalOpen(true);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastMessage('Link copied to clipboard!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert('Failed to copy link to clipboard');
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert('Please log in to upload photos.');
    if (!uploadImageFile) return alert('Image file is required.');

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadImageFile);
      if (uploadCaption) {
        formData.append('caption', uploadCaption);
      }

      const response = await fetch(`/api/spot/${id}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload photo');
      
      setIsUploadModalOpen(false);
      setUploadImageFile(null);
      setUploadCaption('');
      fetchCommunityPhotos(); // Refresh gallery
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleEditPhotoCaption = async (photoId: string, currentCaption: string) => {
    const newCaption = window.prompt("Enter new caption:", currentCaption || "");
    if (newCaption === null || newCaption === currentCaption) return;

    try {
      const response = await fetch(`/api/spot/photos/${photoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ caption: newCaption })
      });
      if (!response.ok) throw new Error('Failed to update caption');
      fetchCommunityPhotos();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed');
    }
  };



  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    try {
      const response = await fetch(`/api/spot/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete photo');
      fetchCommunityPhotos();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

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

  const spotImageUrl = spot?.image || spot?.imageUrl || (spot as any)?.imageUrl;
  const heroImageUrl = spotImageUrl ? (spotImageUrl.startsWith('http') ? spotImageUrl : `http://localhost:8000/${spotImageUrl.replace(/\\/g, '/')}`) : '';

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
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start pb-20">
      
      {/* Left Section (Main Content) */}
      <div className="xl:col-span-7 2xl:col-span-8 space-y-6">
      {/* Hero Section */}
      <div 
        className={`w-full h-64 md:h-96 relative flex items-end p-6 md:p-12 bg-cover bg-center bg-no-repeat ${!heroImageUrl ? 'bg-slate-800' : ''}`}
        style={heroImageUrl ? { backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url('${heroImageUrl}')` } : undefined}
      >
        {!heroImageUrl && <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />}
        
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
          <button 
            onClick={handleShare}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={handleFavoriteToggle}
            className={`bg-white/20 hover:bg-red-500/80 backdrop-blur-md p-2 rounded-full text-white transition-colors group ${isFavorited ? 'bg-red-500/80' : ''}`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-white' : 'group-hover:fill-current'}`} />
          </button>
        </div>

        <div className="relative z-10 w-full">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {spot.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">{spot.title}</h1>
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

          {spot.bestTimeToVisit && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl shrink-0">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-lg">Best Time to Visit</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{spot.bestTimeToVisit}</p>
                </div>
              </div>
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


        </div>
      </div>

      </div>

      {/* Right Section (Community Gallery Sidebar) */}
      <div className="xl:col-span-5 2xl:col-span-4 xl:sticky xl:top-24 h-fit space-y-6">
        <div className="bg-[#151f32] p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Community Gallery</h2>
              <p className="text-xs text-slate-400 mt-1">Inspiration shared by the LensSpace community</p>
            </div>
            {token && (
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0"
              >
                <Camera className="w-3.5 h-3.5" /> Add
              </button>
            )}
          </div>

          {communityPhotos.length === 0 ? (
            <div className="bg-slate-800/50 p-6 rounded-2xl text-center border border-slate-700 mt-4 flex-1 flex flex-col items-center justify-center">
              <p className="text-sm text-slate-400">No photos yet. Be the first!</p>
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-3 mt-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {communityPhotos.map((photo) => (
              <div key={photo._id} className="bg-[#1e293b]/50 p-3 rounded-2xl border border-gray-800 flex flex-col gap-2 h-full justify-between group">
                
                {/* Card Header: User Info */}
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                    {photo.userId?.profilePicture ? (
                      <img src={photo.userId.profilePicture} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">
                        {photo.userId?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-200 truncate">
                    {photo.userId?.name || photo.userId?.username || 'Unknown User'}
                  </span>
                </div>

                {/* Card Image */}
                <div 
                  className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-800"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img 
                    src={photo.imageUrl.startsWith('http') ? photo.imageUrl : `http://localhost:8000/${photo.imageUrl.replace(/\\/g, '/')}`} 
                    alt={photo.caption || "Community photo"} 
                    className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  {/* Hover Action Buttons */}
                  {photo.userId?._id === userId && (
                    <div className="absolute top-1.5 right-1.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleEditPhotoCaption(photo._id, photo.caption)}
                        className="p-1.5 bg-black/60 hover:bg-blue-500 rounded-full text-white backdrop-blur-sm transition-colors"
                        title="Edit Caption"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeletePhoto(photo._id)}
                        className="p-1.5 bg-black/60 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Footer: Caption */}
                {photo.caption && (
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-8"
          style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
        >
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white bg-black/20 hover:bg-black/60 rounded-full p-2.5 transition-all z-[80] backdrop-blur-md"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="bg-transparent w-full max-w-[1400px] h-full md:h-auto md:max-h-[85vh] flex flex-col md:flex-row overflow-hidden rounded-none md:rounded-2xl animate-in fade-in zoom-in-95 duration-200 shadow-2xl border-0 md:border border-slate-800/50">
            
            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center relative min-h-[40vh] md:min-h-0 bg-transparent p-4 md:p-8">
              <img 
                src={selectedPhoto.imageUrl.startsWith('http') ? selectedPhoto.imageUrl : `http://localhost:8000/${selectedPhoto.imageUrl.replace(/\\/g, '/')}`} 
                alt={selectedPhoto.caption}
                className="max-w-full max-h-[80vh] object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-md"
              />
            </div>
            
            {/* Sidebar — User Profile & Caption */}
            <div className="w-full md:w-[360px] bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl shrink-0">

              {/* Author & Caption */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                    {selectedPhoto.userId?.profilePicture ? (
                      <img src={selectedPhoto.userId.profilePicture} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                        {selectedPhoto.userId?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">
                      {selectedPhoto.userId?.name || 'Unknown User'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      @{selectedPhoto.userId?.username || selectedPhoto.userId?.name?.replace(/\s+/g, '').toLowerCase() || 'unknown'}
                    </p>
                  </div>
                </div>
                {selectedPhoto.caption && (
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedPhoto.caption}</p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Upload to Gallery</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadPhoto} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Choose Photo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  required
                  onChange={(e) => setUploadImageFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Caption (Optional)</label>
                <textarea 
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                  placeholder="Tell us about this shot..."
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={uploadingPhoto}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {uploadingPhoto ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Hub Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-[#151f32] rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-bold text-white text-lg mb-2 mt-1">Share this Photography Spot</h3>
            <p className="text-sm text-slate-400 mb-2 px-2">
              Scan this QR code with any mobile device to quickly open this spot on LensSpace.
            </p>
            
            <div className="bg-white p-4 rounded-2xl inline-block mx-auto my-4 shadow-md">
              <QRCodeSVG 
                value={window.location.href} 
                size={160}
                bgColor={"#ffffff"}
                fgColor={"#0f172a"}
                level={"Q"}
                includeMargin={false}
              />
            </div>
            
            <button
              onClick={handleCopyToClipboard}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] mt-2"
            >
              <Share2 className="w-4 h-4" /> Share Link / Copy to Clipboard
            </button>
          </div>
        </div>
      )}
      
      {/* Sleek Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl border border-slate-700 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-sm">{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
}
