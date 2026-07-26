import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Star, Search, Plus, Map, List, Building, Zap, X } from 'lucide-react';

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1610419286824-c1e19488da15?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1565439399815-5674c5d263b5?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1504917595217-d4bf597a1f6a?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1580982333069-7a56113b8606?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1517420704952-d9f39740e38f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1620021966453-6258f79fbc95?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1563804868000-8488258e7724?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1631427962232-803d4f30c64f?auto=format&fit=crop&q=80&w=800"
];

const getDeterministicImage = (name) => {
  if (!name) return DEFAULT_IMAGES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_IMAGES[Math.abs(hash) % DEFAULT_IMAGES.length];
};

const isValidImageUrl = (url) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase().trim();
  if (lowerUrl === "/images/default.jpg" || lowerUrl === "null" || lowerUrl === "undefined" || lowerUrl === "n/a" || lowerUrl === "na" || lowerUrl === "-" || lowerUrl.includes("no image")) {
    return false;
  }
  return true;
};

const FacilitiesPage = () => {
  const location = useLocation();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedEquipment, setSelectedEquipment] = useState('All Equipment Types');
  const [selectedSoftware, setSelectedSoftware] = useState('All Software Types');
  const [viewMode, setViewMode] = useState(location.state?.initialViewMode || 'list');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newFacilityData, setNewFacilityData] = useState({
    name: '', description: '', location: '', institution: '', equipmentType: '', softwareType: '', hourlyRate: 0, status: 'available'
  });

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isOperator = user?.role === 'operator';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/facilities`)
      .then(async res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setFacilities(data);
        else setFacilities([]);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setFacilities([]);
        setLoading(false);
      });
  }, []);

  const handleAddFacility = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newFacilityData };
      if (isOperator) {
        payload.institution = user.organization;
        payload.location = user.location;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/facilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const addedFacility = await res.json();
        setFacilities([...facilities, addedFacility]);
        setShowAddModal(false);
        setNewFacilityData({ name: '', description: '', location: '', institution: '', equipmentType: '', softwareType: '', hourlyRate: 0, status: 'available' });
      } else {
        alert('Failed to add facility');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding facility');
    }
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/facilities/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFacilities(facilities.filter(f => f._id !== id));
      } else {
        alert('Failed to delete facility');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting facility');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  const locations = ['All Locations', ...new Set(facilities.map(f => f.location))];
  const equipmentTypes = ['All Equipment Types', ...new Set(facilities.map(f => f.equipmentType))];
  const softwareTypes = ['All Software Types', ...new Set(facilities.map(f => f.softwareType).filter(Boolean))];

  const filteredFacilities = facilities.filter(fac => {
    const nameStr = String(fac.name || '');
    const descStr = String(fac.description || '');
    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'All Locations' || fac.location === selectedLocation;
    const matchesEquipment = selectedEquipment === 'All Equipment Types' || fac.equipmentType === selectedEquipment;
    const matchesSoftware = selectedSoftware === 'All Software Types' || fac.softwareType === selectedSoftware;

    return matchesSearch && matchesLocation && matchesEquipment && matchesSoftware;
  });

  const groupedFacilities = filteredFacilities.reduce((acc, fac) => {
    if (!acc[fac.location]) acc[fac.location] = [];
    acc[fac.location].push(fac);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">Discover Facilities</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Browse state-of-the-art equipment across Andhra Pradesh</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {(isOperator || isAdmin) && (
              <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all">
                <Plus size={18} /> Add Facility
              </button>
            )}
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                <List size={18} /> List
              </button>
              <button onClick={() => setViewMode('map')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                <Map size={18} /> Map
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search facilities..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 font-medium outline-none transition-all shadow-sm" />
          </div>
          <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium outline-none shadow-sm appearance-none cursor-pointer">
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <select value={selectedEquipment} onChange={(e) => setSelectedEquipment(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium outline-none shadow-sm appearance-none cursor-pointer">
            {equipmentTypes.map(eq => <option key={eq} value={eq}>{eq}</option>)}
          </select>
          <select value={selectedSoftware} onChange={(e) => setSelectedSoftware(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium outline-none shadow-sm appearance-none cursor-pointer">
            {softwareTypes.map(sw => <option key={sw} value={sw}>{sw}</option>)}
          </select>
        </div>

        {/* Content Area */}
        {viewMode === 'map' ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-sm animate-fade-in">
            <iframe
              title="APIC University Nodes Map"
              width="100%"
              height="600"
              className="rounded-xl border-0 grayscale dark:invert-[.9]"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=Universities+in+Andhra+Pradesh&t=&z=6&ie=UTF8&iwloc=&output=embed`}
            ></iframe>
            <div className="p-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl mt-2">
              Interactive Map View: Displaying APIC Nodes & Partner Universities across the region.
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-fade-in">
            {Object.keys(groupedFacilities).length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Search className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                <h3 className="text-xl font-bold">No facilities found</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              Object.entries(groupedFacilities).map(([location, locationFacilities]) => (
                <div key={location} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black flex items-center gap-2"><MapPin className="text-indigo-500" /> {location}</h2>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {locationFacilities.map(fac => (
                      <div key={fac._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="h-48 overflow-hidden relative">
                          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-black shadow flex items-center gap-1 z-10 text-slate-800 dark:text-slate-200">
                            <Star size={12} className="text-amber-500 fill-amber-500" /> {fac.rating}
                          </div>
                          <img
                            src={isValidImageUrl(fac.imageUrl) ? fac.imageUrl : getDeterministicImage(fac.name)}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getDeterministicImage(fac.name);
                            }}
                            alt={fac.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-black text-lg line-clamp-1" title={fac.name}>{fac.name}</h3>
                          </div>
                          {fac.institution && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3 bg-indigo-50 dark:bg-indigo-900/30 w-max px-2.5 py-1 rounded-md">
                              <Building size={12} /> {fac.institution}
                            </div>
                          )}
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">{fac.description}</p>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                            <div className="font-mono">
                              <span className="text-xl font-black">₹{fac.hourlyRate}</span>
                              <span className="text-xs text-slate-400 font-medium">/hr</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {!isOperator && !isAdmin && (
                                <Link to={`/booking/${fac._id}`} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-sm">
                                  Book
                                </Link>
                              )}
                              {(isOperator || isAdmin) && (
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">Innovators Only</span>
                              )}
                              {(isAdmin || (isOperator && fac.institution === user.organization)) && (
                                <button onClick={() => handleDeleteFacility(fac._id)} className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg text-sm font-bold transition-colors">
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* Add Facility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-2xl font-black flex items-center gap-2"><Plus className="text-indigo-500" /> Add Facility</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddFacility} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Facility Name</label>
                    <input type="text" name="name" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={newFacilityData.name} onChange={(e) => setNewFacilityData({ ...newFacilityData, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Institution / Partner</label>
                    <input type="text" name="institution" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={isOperator ? user.organization : newFacilityData.institution} onChange={(e) => !isOperator && setNewFacilityData({ ...newFacilityData, institution: e.target.value })} disabled={isOperator} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1.5">Description</label>
                  <textarea name="description" rows="3" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={newFacilityData.description} onChange={(e) => setNewFacilityData({ ...newFacilityData, description: e.target.value })} required></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Location</label>
                    <input type="text" name="location" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={isOperator ? user.location : newFacilityData.location} onChange={(e) => !isOperator && setNewFacilityData({ ...newFacilityData, location: e.target.value })} disabled={isOperator} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Equipment Type</label>
                    <input type="text" name="equipmentType" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={newFacilityData.equipmentType} onChange={(e) => setNewFacilityData({ ...newFacilityData, equipmentType: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1.5">Software Type</label>
                    <input type="text" name="softwareType" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={newFacilityData.softwareType} onChange={(e) => setNewFacilityData({ ...newFacilityData, softwareType: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1.5">Hourly Rate (₹)</label>
                  <input type="number" name="hourlyRate" min="0" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono" value={newFacilityData.hourlyRate} onChange={(e) => setNewFacilityData({ ...newFacilityData, hourlyRate: Number(e.target.value) })} required />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-3 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all">
                    Publish Facility
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitiesPage;
