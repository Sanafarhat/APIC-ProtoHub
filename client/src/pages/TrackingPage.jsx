import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Clock, CheckCircle, Map, PlayCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

const TrackingPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/${id}`);
        if (!res.ok) throw new Error('Tracking ID not found');
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center font-sans transition-colors duration-300">
        <Shield size={64} className="text-indigo-500 animate-pulse mb-6" />
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase">Locating Job...</h2>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center font-sans p-6 transition-colors duration-300">
        <AlertTriangle size={64} className="text-red-500 mb-6" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Invalid Tracking ID</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">We couldn't find a prototype job with this QR code.</p>
        <Link to="/" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 transition-all">Return to Home</Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50';
      case 'qa-check': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800/50';
      case 'in-progress': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50';
      case 'cancelled': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800/50';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} />;
      case 'qa-check': return <AlertTriangle size={20} />;
      case 'in-progress': return <PlayCircle size={20} />;
      case 'cancelled': return <AlertTriangle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 font-sans flex flex-col items-center transition-colors duration-300">
      <div className="w-full max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-8 hover:underline">
          <ArrowLeft size={20} /> Back to ProtoHub
        </Link>
        
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 relative z-10">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Live Tracking</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">JOB-{booking._id.substring(0, 6).toUpperCase()}</h1>
            </div>
            <div className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 border ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              {booking.status.replace('-', ' ')}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Innovator / Client</p>
              <p className="font-black text-lg text-slate-900 dark:text-white">{booking.user?.name}</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Facility Location</p>
              <p className="font-black text-lg text-slate-900 dark:text-white">{booking.facility?.name || 'ProtoHub APIC Center'}</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1"><Map size={14} /> {booking.facility?.location || 'Andhra Pradesh'}</p>
            </div>
          </div>

          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl mb-12 relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-2">Job Details</p>
              <p className="font-black text-lg text-slate-900 dark:text-white">{booking.attachedFile || 'CAD_Design.step'}</p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">Resource: {booking.equipment}</p>
            </div>
            <div className="md:text-right pt-4 md:pt-0 border-t border-indigo-100 dark:border-indigo-800/50 md:border-0 mt-4 md:mt-0">
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">₹{booking.totalCost.toFixed(2)}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">Total Cost</p>
            </div>
          </div>

          {/* Simple Timeline */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-10 relative z-10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Production Timeline</h3>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-slate-200 dark:before:bg-slate-800">
              
              {/* Step 1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-lg">
                  <CheckCircle size={16} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
                  <h4 className="font-black text-slate-900 dark:text-white">Booking Placed</h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{new Date(booking.date).toLocaleDateString()} at {booking.startTime}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-lg transition-colors ${(booking.status === 'in-progress' || booking.status === 'qa-check' || booking.status === 'completed') ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                  <PlayCircle size={16} />
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl shadow-sm border transition-colors ${(booking.status === 'in-progress' || booking.status === 'qa-check' || booking.status === 'completed') ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800/50' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                  <h4 className={`font-black ${(booking.status === 'in-progress' || booking.status === 'qa-check' || booking.status === 'completed') ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-600'}`}>In Fabrication</h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{(booking.status === 'in-progress' || booking.status === 'qa-check' || booking.status === 'completed') ? 'Job sent to machine.' : 'Awaiting start.'}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-lg transition-colors ${(booking.status === 'completed') ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                  <CheckCircle size={16} />
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl shadow-sm border transition-colors ${(booking.status === 'completed') ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800/50' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                  <h4 className={`font-black ${(booking.status === 'completed') ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-600'}`}>Completed & Dispatched</h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{(booking.status === 'completed') ? 'Prototype finished.' : 'Pending fabrication.'}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
