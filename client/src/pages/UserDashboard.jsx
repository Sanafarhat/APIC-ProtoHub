import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  LayoutDashboard, PlusCircle, UploadCloud, FileText, Map, Settings, 
  Moon, Sun, Bell, Download, X, Eye, EyeOff, Activity, CheckCircle, 
  Clock, DollarSign, ArrowRight, Phone, MessageSquare, Star, ArrowUpRight, Shield,
  AlertTriangle, Play, ChevronRight, TrendingUp, Briefcase, ThumbsUp
} from 'lucide-react';
import './Dashboard.css';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hiddenWidgets, setHiddenWidgets] = useState([]);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [aiQuoteModal, setAiQuoteModal] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackData, setFeedbackData] = useState({ bookingId: '', rating: 0, facilityQuality: 'Excellent', timeliness: 'On Time', comment: '' });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  const initialNotifications = [
    { id: 1, title: 'Fabrication Started', text: 'CNC Aluminum block for JOB-001 has started.', time: '2 hrs ago', type: 'milestone' },
    { id: 2, title: 'Quotation Received', text: 'New quote from 3D Printing Studio.', time: '5 hrs ago', type: 'quote' },
    { id: 3, title: 'Reminder', text: 'Your laser cutting slot is tomorrow at 10 AM.', time: '1 day ago', type: 'reminder' }
  ];
  const [activeNotifications, setActiveNotifications] = useState(initialNotifications);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (user) {
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setBookings(sorted);
        })
        .catch(err => console.error(err));
    }
  }, [user?.id]);

  if (!user) return <div className="container mt-4 p-8 text-center bg-gray-50 rounded">Please login to view dashboard.</div>;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleWidget = (widgetId) => {
    if (hiddenWidgets.includes(widgetId)) {
      setHiddenWidgets(hiddenWidgets.filter(id => id !== widgetId));
    } else {
      setHiddenWidgets([...hiddenWidgets, widgetId]);
    }
  };

  const exportToCSV = () => {
    if (bookings.length === 0) return showToast('No bookings to export.', 'danger');
    
    const headers = ['Job ID', 'Facility', 'Date', 'Start Time', 'Duration (hrs)', 'Status', 'Total Cost', 'Attached File'];
    const csvContent = [
      headers.join(','),
      ...bookings.map(b => 
        `"${b._id}","${b.facility?.name || 'Unknown'}","${new Date(b.date).toLocaleDateString()}","${b.startTime}","${b.duration}","${b.status}","${b.totalCost}","${b.attachedFile || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export successful!', 'success');
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackData.bookingId) return showToast('Please select a facility/job to review.', 'danger');
    if (feedbackData.rating === 0) return showToast('Please provide a star rating.', 'danger');

    setIsSubmittingFeedback(true);
    const selectedBookingObj = completedBookings.find(b => b._id === feedbackData.bookingId);
    if (!selectedBookingObj || !selectedBookingObj.facility) {
       setIsSubmittingFeedback(false);
       return showToast('Invalid facility selected.', 'danger');
    }

    try {
      // Also save the detailed feedback to the booking itself so Admin and Operators can see it
      const bookingFeedbackText = `Rating: ${feedbackData.rating || 0}/5. Facility Quality: ${feedbackData.facilityQuality || 'Excellent'}. Timeliness: ${feedbackData.timeliness || 'On Time'}. ${feedbackData.comment ? 'Comments: ' + feedbackData.comment : ''}`;
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/${feedbackData.bookingId}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: bookingFeedbackText })
      });

      if (res.ok) {
        setBookings(bookings.map(b => b._id === feedbackData.bookingId ? { ...b, feedback: bookingFeedbackText } : b));
        showToast('Thank you for your feedback! Rating updated.', 'success');
        setFeedbackData({ bookingId: '', rating: 0, facilityQuality: 'Excellent', timeliness: 'On Time', comment: '' });
        setActiveTab('overview');
      } else {
        showToast('Failed to submit feedback.', 'danger');
      }
    } catch (err) {
      showToast('Error submitting feedback.', 'danger');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // --- STATS CALCULATION ---
  const activeBookings = bookings.filter(b => ['pending', 'in-progress', 'confirmed'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalSpent = bookings.reduce((acc, curr) => acc + curr.totalCost, 0);
  const budget = 10000;
  const budgetUsedPct = (totalSpent / budget) * 100;
  
  // Pipeline counts
  const reqSubmitted = bookings.length;
  const quotesPending = bookings.filter(b => b.status === 'pending_admin' || b.status === 'pending_operator' || b.status === 'pending').length;
  const quotesAccepted = bookings.filter(b => b.status === 'approved').length;
  const inFab = bookings.filter(b => b.status === 'in-progress' || b.status === 'qa-check').length;

  // Mock Recommended
  const recommended = [
    { id: 1, name: 'Precision CNC Works', rating: 4.9, dist: '2.4 km', cap: 'Available Tomorrow' },
    { id: 2, name: 'SLA Prototyping Hub', rating: 4.7, dist: '5.1 km', cap: 'High Capacity' }
  ];

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAiQuoteModal({ status: 'analyzing', file, quoteData: null });
      
      // Simulate AI analysis delay
      setTimeout(async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/estimate-cost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attachedFile: file.name, facility: 'AI Recommended: 5-Axis CNC', equipmentType: 'CNC', duration: 4 })
          });
          const data = await res.json();
          setAiQuoteModal({ 
            status: 'ready', 
            file, 
            quoteData: { 
              materialCost: data.materialCost || Math.floor(Math.random() * 5000) + 1000,
              timeEst: '4-6 Hours',
              machine: 'HAAS UMC-500',
              aiConfidence: '94%'
            } 
          });
        } catch (err) {
          setAiQuoteModal({ 
            status: 'ready', 
            file, 
            quoteData: { materialCost: 3500, timeEst: '4-6 Hours', machine: 'HAAS UMC-500', aiConfidence: '92%' } 
          });
        }
      }, 2500);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      showToast('Booking cancelled.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to cancel booking.', 'danger');
    }
  };

  const payBooking = async (id) => {
    showToast('Redirecting to secure payment gateway...', 'info');
    setTimeout(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in-progress' })
        });
        const data = await res.json();
        setBookings(bookings.map(b => b._id === id ? { ...b, status: 'in-progress' } : b));
        showToast('Payment successful! Job moved to In Fabrication.', 'success');
        if(data.emailDispatched) showToast('Payment Receipt Emailed.', 'info');
        setSelectedBooking(null);
      } catch (err) {
        console.error(err);
        showToast('Payment failed.', 'danger');
      }
    }, 2000);
  };

  const submitFeedback = async (id, feedbackText) => {
    if(!feedbackText.trim()) return showToast('Please enter feedback', 'danger');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/${id}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackText })
      });
      if(res.ok) {
        setBookings(bookings.map(b => b._id === id ? { ...b, feedback: feedbackText } : b));
        setSelectedBooking({...selectedBooking, feedback: feedbackText});
        showToast('Feedback submitted successfully', 'success');
      }
    } catch(err) {
      console.error(err);
      showToast('Failed to submit feedback', 'danger');
    }
  };

  const filteredBookings = filterStatus ? bookings.filter(b => b.status === filterStatus) : bookings;

  const themeClass = isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardClass = isDarkMode ? 'bg-slate-800 border-slate-700/50 shadow-lg shadow-black/20 text-slate-100' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40 text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen ${themeClass} transition-colors duration-300 pb-16 font-sans`}>
      
      {/* HEADER */}
      <header className={`sticky top-0 z-40 border-b ${isDarkMode ? 'bg-slate-900/80 border-slate-700 shadow-md shadow-black/20' : 'bg-white/80 border-slate-200 shadow-sm'} backdrop-blur-md px-6 py-4 flex justify-between items-center transition-all duration-300`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Innovator Portal</h1>
            <p className={`${textMuted} text-sm font-medium`}>Welcome back, <span className="font-bold">{user.name}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-sm font-bold bg-slate-100 dark:bg-slate-800 py-2 px-4 rounded-full border border-slate-200 dark:border-slate-700">
            <span className="flex items-center gap-2"><Activity size={16} className="text-blue-500"/> {activeBookings.length} Active</span>
            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500"/> {completedBookings.length} Completed</span>
          </div>
          <div className="flex gap-3">
            <button className={`p-2.5 rounded-full transition-transform hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}`} onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <div className="relative group">
              <button className={`p-2.5 rounded-full transition-transform hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}`}><Settings size={20}/></button>
              <div className={`absolute right-0 mt-3 w-56 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50 transition-all origin-top-right ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-100 ring-1 ring-slate-900/5'}`}>
                <p className={`text-xs font-black uppercase tracking-wider px-3 py-2 mb-1 border-b ${isDarkMode?'border-slate-700 text-slate-400':'border-slate-100 text-slate-500'}`}>Widget Settings</p>
                {['financial', 'notifications', 'recommended', 'help'].map(w => (
                  <button key={w} className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg flex items-center justify-between mb-1 transition-colors ${isDarkMode?'hover:bg-slate-700 text-slate-200':'hover:bg-slate-50 text-slate-700'}`} onClick={()=>toggleWidget(w)}>
                    <span className="capitalize">{w}</span>
                    {hiddenWidgets.includes(w) ? <EyeOff size={16} className="text-red-500"/> : <Eye size={16} className="text-green-500"/>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex px-4 md:px-6 py-8 max-w-[1600px] mx-auto gap-6 lg:gap-8 flex-row items-start">
        
        {/* LEFT SIDEBAR (Navigation & Actions) */}
        <aside className="w-[280px] lg:w-[320px] flex-shrink-0 flex flex-col gap-2 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto pr-2 pb-4">
          <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 mb-2" onClick={() => navigate('/facilities')}>
            <PlusCircle size={22}/> 
            <span className="text-lg tracking-wide">New Booking</span>
          </button>
          
          <h3 className={`text-xs font-black uppercase tracking-widest pl-2 mb-1 mt-2 ${textMuted}`}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
            <button className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all duration-300 group hover:-translate-y-1 hover:shadow-md ${isDarkMode?'bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200':'bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'}`} onClick={() => fileInputRef.current.click()}>
              <UploadCloud size={20} className="text-blue-500"/>
              <span className="text-[10px] text-center uppercase tracking-wider">CAD Upload</span>
            </button>
            <button className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all duration-300 group hover:-translate-y-1 hover:shadow-md ${isDarkMode?'bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200':'bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'}`} onClick={() => navigate('/facilities', { state: { initialViewMode: 'map' } })}>
              <Map size={20} className="text-emerald-500"/>
              <span className="text-[10px] text-center uppercase tracking-wider">Map</span>
            </button>
          </div>

          <h3 className={`text-xs font-black uppercase tracking-widest pl-2 mb-2 mt-2 ${textMuted}`}>Dashboard</h3>
          
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 hover:-translate-y-1' : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50')}`}>
            <LayoutDashboard size={20} className={activeTab==='overview'?'text-white':'text-blue-500'}/> Overview & Status
          </button>
          
          <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'bookings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 hover:-translate-y-1' : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50')}`}>
            <Briefcase size={20} className={activeTab==='bookings'?'text-white':'text-indigo-500'}/> Recent Bookings
          </button>
          
          <button onClick={() => setActiveTab('financials')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'financials' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 hover:-translate-y-1' : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50')}`}>
            <DollarSign size={20} className={activeTab==='financials'?'text-white':'text-emerald-500'}/> Financial Analytics
          </button>
          
          <button onClick={() => setActiveTab('notifications')} className={`flex items-center justify-between w-full p-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'notifications' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/40 hover:-translate-y-1' : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50')}`}>
            <div className="flex items-center gap-3"><Bell size={20} className={activeTab==='notifications'?'text-white':'text-amber-500'}/> Notifications</div>
            {activeNotifications.length > 0 && <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab==='notifications'?'bg-white text-amber-600':'bg-amber-100 text-amber-700'}`}>{activeNotifications.length}</span>}
          </button>
          
          <button onClick={() => setActiveTab('recommended')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'recommended' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40 hover:-translate-y-1' : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50')}`}>
            <Star size={20} className={activeTab==='recommended'?'text-white':'text-purple-500'}/> Recommended Hubs
          </button>
          
          <button onClick={() => setActiveTab('help')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'help' ? 'bg-slate-600 text-white shadow-lg shadow-slate-500/40 hover:-translate-y-1' : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50')}`}>
            <MessageSquare size={20} className={activeTab==='help'?'text-white':'text-slate-500'}/> Help & Support
          </button>


        </aside>

        {/* MAIN GRID */}
        <div className="flex-1">
          
          {/* TAB 1: OVERVIEW & STATUS */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className={`p-5 rounded-2xl border-t-4 border-t-blue-500 ${cardClass} hover:shadow-2xl transition-shadow`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className={`text-sm font-bold uppercase tracking-wider ${textMuted}`}>Active Projects</p>
                    <Briefcase size={20} className="text-blue-500 opacity-80"/>
                  </div>
                  <h3 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{activeBookings.length}</h3>
                </div>
                
                <div className={`p-5 rounded-2xl border-t-4 border-t-emerald-500 ${cardClass} hover:shadow-2xl transition-shadow`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className={`text-sm font-bold uppercase tracking-wider ${textMuted}`}>Completed</p>
                    <CheckCircle size={20} className="text-emerald-500 opacity-80"/>
                  </div>
                  <h3 className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{completedBookings.length}</h3>
                </div>
                
                <div className={`p-5 rounded-2xl border-t-4 border-t-amber-500 ${cardClass} hover:shadow-2xl transition-shadow`}>
                   <div className="flex justify-between items-start mb-2">
                    <p className={`text-sm font-bold uppercase tracking-wider ${textMuted}`}>Upcoming</p>
                    <Clock size={20} className="text-amber-500 opacity-80"/>
                  </div>
                  <h3 className="text-4xl font-black text-amber-600 dark:text-amber-400">{bookings.filter(b => b.status==='confirmed').length}</h3>
                </div>
                
                <div className={`p-5 rounded-2xl border-t-4 border-t-purple-500 ${cardClass} hover:shadow-2xl transition-shadow`}>
                   <div className="flex justify-between items-start mb-2">
                    <p className={`text-sm font-bold uppercase tracking-wider ${textMuted}`}>Avg Turnaround</p>
                    <TrendingUp size={20} className="text-purple-500 opacity-80"/>
                  </div>
                  <h3 className="text-4xl font-black text-purple-600 dark:text-purple-400">2.4<span className="text-lg font-bold opacity-50 ml-1">d</span></h3>
                </div>
                
                <div className={`p-5 rounded-2xl border-t-4 ${budgetUsedPct > 80 ? 'border-t-red-500' : 'border-t-slate-500'} ${budgetUsedPct > 80 ? (isDarkMode?'bg-red-950/40 border-red-900 shadow-red-900/20':'bg-red-50 border-red-100 shadow-red-200/50') : cardClass} hover:shadow-2xl transition-shadow sm:col-span-2 lg:col-span-1 flex flex-col justify-between`}>
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm font-bold uppercase tracking-wider ${budgetUsedPct > 80 ? 'text-red-500 dark:text-red-400' : textMuted}`}>Budget Used</p>
                      {budgetUsedPct > 80 && <AlertTriangle size={20} className="text-red-500 animate-pulse"/>}
                    </div>
                    <h3 className={`text-2xl font-black ${budgetUsedPct > 80 ? 'text-red-600 dark:text-red-400' : ''}`}>₹{totalSpent.toFixed(0)} <span className="text-sm font-bold opacity-40">/ ₹{budget}</span></h3>
                  </div>
                  <div className={`w-full rounded-full h-2 mt-4 overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div className={`h-full rounded-full ${budgetUsedPct > 80 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} style={{width: `${Math.min(budgetUsedPct, 100)}%`}}></div>
                  </div>
                </div>
              </div>

              {/* PROJECT LIFECYCLE TRACKER */}
              <div className={`p-8 rounded-2xl border ${cardClass} relative overflow-hidden group`}>
                {/* Subtle background gradient effect */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 blur-3xl rounded-full pointer-events-none transition-transform group-hover:scale-110"></div>
                
                <h2 className="font-black text-xl mb-8 flex items-center gap-3"><Activity size={24} className="text-blue-500"/> Project Lifecycle Pipeline</h2>
                
                {/* Pipeline Container */}
                <div className="relative flex justify-between items-start max-w-5xl mx-auto px-4 sm:px-10">
                  {/* Connecting Line */}
                  <div className={`absolute top-8 left-10 right-10 h-1.5 -translate-y-1/2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} z-0`}></div>
                  {/* Active Progress Line */}
                  <div className="absolute top-8 left-10 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-500 via-amber-500 to-purple-500 z-0 transition-all duration-1000" style={{ width: '45%' }}></div>
                  
                  {/* Node 1 */}
                  <div className="relative z-10 flex flex-col items-center group/node cursor-pointer" onClick={() => {setFilterStatus(null); setActiveTab('bookings');}}>
                    <div className={`w-16 h-16 rounded-2xl shadow-lg border-4 flex items-center justify-center text-xl font-black mb-3 transition-transform duration-300 group-hover/node:scale-110 group-hover/node:-translate-y-2 ${isDarkMode ? 'bg-slate-800 border-blue-500 text-blue-400 shadow-blue-900/50' : 'bg-white border-blue-500 text-blue-600 shadow-blue-200'}`}>{reqSubmitted}</div>
                    <span className={`text-sm font-bold text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Requests<br/>Submitted</span>
                  </div>
                  
                  {/* Node 2 */}
                  <div className="relative z-10 flex flex-col items-center group/node cursor-pointer" onClick={()=>{setFilterStatus('pending_operator'); setActiveTab('bookings');}}>
                    <div className={`w-16 h-16 rounded-2xl shadow-lg border-4 flex items-center justify-center text-xl font-black mb-3 transition-transform duration-300 group-hover/node:scale-110 group-hover/node:-translate-y-2 ${quotesPending > 0 ? (isDarkMode ? 'bg-slate-800 border-amber-500 text-amber-400 shadow-amber-900/50' : 'bg-white border-amber-500 text-amber-600 shadow-amber-200') : (isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-500' : 'bg-white border-slate-300 text-slate-400')}`}>{quotesPending}</div>
                    <span className={`text-sm font-bold text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Quotes<br/>Pending</span>
                  </div>
                  
                  {/* Node 3 */}
                  <div className="relative z-10 flex flex-col items-center group/node cursor-pointer" onClick={()=>{setFilterStatus('approved'); setActiveTab('bookings');}}>
                    <div className={`w-16 h-16 rounded-2xl shadow-lg border-4 flex items-center justify-center text-xl font-black mb-3 transition-transform duration-300 group-hover/node:scale-110 group-hover/node:-translate-y-2 ${quotesAccepted > 0 ? (isDarkMode ? 'bg-slate-800 border-indigo-500 text-indigo-400 shadow-indigo-900/50' : 'bg-white border-indigo-500 text-indigo-600 shadow-indigo-200') : (isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-500' : 'bg-white border-slate-300 text-slate-400')}`}>{quotesAccepted}</div>
                    <span className={`text-sm font-bold text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Quotes<br/>Accepted</span>
                  </div>
                  
                  {/* Node 4 */}
                  <div className="relative z-10 flex flex-col items-center group/node cursor-pointer" onClick={()=>{setFilterStatus('in-progress'); setActiveTab('bookings');}}>
                    <div className={`w-16 h-16 rounded-2xl shadow-lg border-4 flex items-center justify-center text-xl font-black mb-3 transition-transform duration-300 group-hover/node:scale-110 group-hover/node:-translate-y-2 ${inFab > 0 ? (isDarkMode ? 'bg-slate-800 border-purple-500 text-purple-400 shadow-purple-900/50' : 'bg-white border-purple-500 text-purple-600 shadow-purple-200') : (isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-500' : 'bg-white border-slate-300 text-slate-400')}`}>{inFab}</div>
                    <span className={`text-sm font-bold text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>In<br/>Fabrication</span>
                  </div>
                  
                  {/* Node 5 */}
                  <div className="relative z-10 flex flex-col items-center group/node">
                    <div className={`w-16 h-16 rounded-2xl shadow-lg border-4 flex items-center justify-center text-xl font-black mb-3 transition-transform duration-300 group-hover/node:scale-110 group-hover/node:-translate-y-2 ${isDarkMode ? 'bg-slate-800 border-emerald-500 text-emerald-400 shadow-emerald-900/50' : 'bg-white border-emerald-500 text-emerald-600 shadow-emerald-200'}`}>{completedBookings.length}</div>
                    <span className={`text-sm font-bold text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Completed<br/>& Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: YOUR BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className={`p-8 rounded-2xl border ${cardClass} min-h-[600px] flex flex-col animate-fade-in`}>
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                <h2 className="font-black text-2xl flex items-center gap-3"><LayoutDashboard size={28} className="text-indigo-500"/> Project Database</h2>
                <div className="flex gap-4">
                  {filterStatus && <button onClick={()=>setFilterStatus(null)} className="text-sm font-bold bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200">Clear Filter</button>}
                  <button className="flex items-center gap-2 text-sm font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors" onClick={exportToCSV}>
                    <Download size={16}/> Export CSV
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1 pr-2 space-y-4">
                {filteredBookings.map(b => (
                  <div key={b._id} className={`p-6 rounded-xl border flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isDarkMode?'bg-slate-800/80 border-slate-700 hover:border-slate-500':'bg-white border-slate-200 hover:border-indigo-200'}`}>
                    <div className="flex flex-col sm:flex-row justify-between gap-4 w-full">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">JOB-{b._id.substring(0,6).toUpperCase()}</span>
                          <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full ${b.status==='completed'?'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400':(b.status==='pending'?'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400':(b.status==='in-progress'?'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400':'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'))}`}>
                            {b.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-xl cursor-pointer hover:text-indigo-500 transition-colors flex items-center gap-2 group" onClick={()=>showToast('Opening Facility Details', 'info')}>
                          {b.facility?.name || 'Precision Milling Center'} 
                          <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500"/>
                        </h4>
                        <p className={`text-sm mt-1 font-medium flex items-center gap-1 ${textMuted}`}><Clock size={14}/> {new Date(b.date).toLocaleDateString()} at {b.startTime}</p>
                      </div>
                      
                      <div className="flex flex-col items-end justify-between min-w-[150px]">
                        <p className="font-black text-3xl text-slate-800 dark:text-white">₹{b.totalCost.toFixed(0)}</p>
                        <div className="flex gap-2 mt-2">
                          {b.status === 'completed' && !b.feedback && (
                            <button className="text-sm font-bold text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 transition-colors bg-pink-50 dark:bg-pink-900/30 px-4 py-2 rounded-lg" onClick={() => {
                              setFeedbackData({...feedbackData, bookingId: b._id});
                              setActiveTab('feedback');
                            }}>
                              Leave Feedback
                            </button>
                          )}
                          {b.status === 'completed' && b.feedback && (
                            <div className="text-sm font-bold text-pink-700 dark:text-pink-300 bg-pink-100 dark:bg-pink-900/40 px-4 py-2 rounded-lg flex items-center gap-2 opacity-90 cursor-default">
                              <CheckCircle size={16} />
                              Feedback Submitted
                            </div>
                          )}
                          <button className="text-sm font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg" onClick={()=>setSelectedBooking(b)}>View Details</button>
                        </div>
                      </div>
                    </div>
                    {b.feedback && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 w-full">
                        <p className="text-[10px] font-bold text-pink-500 uppercase tracking-wider mb-1">Your Feedback:</p>
                        <p className={`text-sm italic ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>"{b.feedback}"</p>
                      </div>
                    )}
                  </div>
                ))}
                {filteredBookings.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full opacity-50 py-20">
                    <FileText size={64} className="mb-4 text-slate-400"/>
                    <p className="text-xl font-bold">No bookings found</p>
                    <p className="text-sm mt-2">Create a new booking to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL DASHBOARD */}
          {activeTab === 'financials' && (
            <div className={`p-8 rounded-2xl border ${cardClass} min-h-[600px] flex flex-col relative overflow-hidden animate-fade-in`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
              
              <h2 className="font-black text-2xl mb-8 flex items-center gap-3"><DollarSign size={28} className="text-emerald-500"/> Financial Analytics</h2>
              
              <div className="flex-1 flex flex-col lg:flex-row gap-8 z-10">
                {/* Bar Chart Section */}
                <div className={`p-6 rounded-xl flex-1 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <h4 className={`text-sm font-black uppercase tracking-wider mb-8 flex justify-between items-center ${textMuted}`}>
                    Spending Trends
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded font-bold">+12% vs last month</span>
                  </h4>
                  <div className="h-64 flex items-end justify-between gap-4 border-b-2 border-slate-300 dark:border-slate-700 pb-2 pl-6 relative">
                    {/* Y-axis labels mock */}
                    <div className={`absolute -left-2 top-0 bottom-0 flex flex-col justify-between text-xs font-bold ${textMuted}`}>
                      <span>₹10k</span><span>₹7.5k</span><span>₹5k</span><span>₹2.5k</span><span>0</span>
                    </div>
                    {/* Bars */}
                    {[30, 45, 20, 80, 65, 90].map((h, i) => (
                      <div key={i} className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg hover:brightness-110 transition-all relative group shadow-md shadow-emerald-500/20" style={{height: `${h}%`}}>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm py-1.5 px-3 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">₹{h*100}</div>
                      </div>
                    ))}
                  </div>
                  <div className={`flex justify-between text-xs font-bold mt-4 px-4 uppercase ${textMuted}`}>
                    <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                  </div>
                </div>

                {/* Modern Donut Chart / Progress Bars Section */}
                <div className="w-full lg:w-1/3">
                   <h4 className={`text-sm font-black uppercase tracking-wider mb-6 ${textMuted}`}>Cost Breakdown</h4>
                   <div className="space-y-6">
                     <div className="group">
                       <div className="flex justify-between text-base font-bold mb-2">
                         <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500"></div>3D Printing (60%)</span> 
                         <span>₹{Math.floor(totalSpent * 0.6)}</span>
                       </div>
                       <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode?'bg-slate-700':'bg-slate-200'}`}>
                         <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full group-hover:brightness-110 transition-all" style={{width: '60%'}}></div>
                       </div>
                     </div>
                     <div className="group">
                       <div className="flex justify-between text-base font-bold mb-2">
                         <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-emerald-500"></div>CNC Machining (30%)</span> 
                         <span>₹{Math.floor(totalSpent * 0.3)}</span>
                       </div>
                       <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode?'bg-slate-700':'bg-slate-200'}`}>
                         <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full group-hover:brightness-110 transition-all" style={{width: '30%'}}></div>
                       </div>
                     </div>
                     <div className="group">
                       <div className="flex justify-between text-base font-bold mb-2">
                         <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-amber-500"></div>Materials (10%)</span> 
                         <span>₹{Math.floor(totalSpent * 0.1)}</span>
                       </div>
                       <div className={`w-full rounded-full h-4 overflow-hidden ${isDarkMode?'bg-slate-700':'bg-slate-200'}`}>
                         <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full group-hover:brightness-110 transition-all" style={{width: '10%'}}></div>
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS & UPDATES */}
          {activeTab === 'notifications' && (
            <div className={`p-8 rounded-2xl border ${cardClass} animate-fade-in`}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-black text-2xl flex items-center gap-3"><Bell size={28} className="text-amber-500"/> Activity & Notifications</h2>
                {activeNotifications.length > 0 && <button className="text-sm font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg transition-colors" onClick={() => setActiveNotifications([])}>Mark all read</button>}
              </div>
              <div className="relative border-l-4 border-slate-200 dark:border-slate-700 ml-4 space-y-8">
                {activeNotifications.length === 0 && <p className="text-lg font-bold text-slate-500 ml-6 py-8">You're all caught up!</p>}
                {activeNotifications.map(n => (
                  <div key={n.id} className="pl-8 relative group">
                    <div className={`absolute -left-[14px] top-1 w-6 h-6 rounded-full border-4 ${isDarkMode?'border-slate-800':'border-white'} ${n.type==='milestone'?'bg-blue-500':(n.type==='quote'?'bg-amber-500':'bg-red-500')} group-hover:scale-125 transition-transform`}></div>
                    <div className={`p-5 rounded-2xl border transition-colors shadow-sm ${isDarkMode?'bg-slate-800/50 border-slate-700 hover:border-slate-500':'bg-slate-50 border-slate-100 hover:border-slate-300'}`}>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">{n.title}</h4>
                      <p className={`text-base mt-2 font-medium ${textMuted}`}>{n.text}</p>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400 mt-3 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: RECOMMENDED FACILITIES */}
          {activeTab === 'recommended' && (
            <div className={`p-8 rounded-2xl border ${cardClass} animate-fade-in`}>
              <h2 className="font-black text-2xl mb-8 flex items-center gap-3"><Star size={28} className="text-amber-500 fill-amber-500"/> Recommended Partner Hubs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommended.map(r => (
                  <div key={r.id} className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${isDarkMode?'bg-slate-800 border-slate-700 hover:border-slate-500':'bg-white border-slate-200 hover:border-indigo-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-xl text-slate-900 dark:text-white">{r.name}</h4>
                      <span className="flex items-center gap-1 text-sm font-black bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg"><Star size={14} className="fill-amber-500"/> {r.rating}</span>
                    </div>
                    <p className={`text-base font-medium mb-6 flex items-center gap-3 ${textMuted}`}><Map size={18}/> {r.dist} away <span className="opacity-30">•</span> <CheckCircle size={18} className="text-emerald-500"/> {r.cap}</p>
                    <button className="w-full py-3 bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-700 dark:hover:bg-indigo-500 text-slate-800 dark:text-white rounded-xl text-base font-bold transition-colors" onClick={()=>showToast('Redirecting to facility...', 'info')}>View Facility Profile</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: HELP & RESOURCES */}
          {activeTab === 'help' && (
            <div className={`p-8 rounded-2xl border ${cardClass} relative overflow-hidden animate-fade-in`}>
              <div className="absolute -bottom-10 -right-10 opacity-5"><Shield size={200}/></div>
              <h2 className="font-black text-2xl mb-8 flex items-center gap-3"><MessageSquare size={28} className="text-blue-500"/> Help & Support</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <button className={`p-6 rounded-xl border text-left hover:-translate-y-2 hover:shadow-xl transition-all ${isDarkMode?'bg-slate-800/80 border-slate-700 hover:border-slate-500':'bg-white border-slate-200 hover:border-blue-300'}`} onClick={()=>showToast('Opening FAQ...', 'info')}>
                  <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400"><FileText size={28}/></div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">Knowledge Base</h4>
                  <p className={`text-sm mt-2 font-medium ${textMuted}`}>Read comprehensive guides, documentation, and FAQs.</p>
                </button>
                <button className={`p-6 rounded-xl border text-left hover:-translate-y-2 hover:shadow-xl transition-all ${isDarkMode?'bg-slate-800/80 border-slate-700 hover:border-slate-500':'bg-white border-slate-200 hover:border-red-300'}`} onClick={()=>showToast('Opening Video...', 'info')}>
                  <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-4 text-red-600 dark:text-red-400"><Play size={28} className="ml-1"/></div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">Video Tutorials</h4>
                  <p className={`text-sm mt-2 font-medium ${textMuted}`}>Watch detailed walkthroughs of the APIC ProtoHub platform.</p>
                </button>
                <button className={`p-6 rounded-xl border text-left hover:-translate-y-2 hover:shadow-xl transition-all col-span-1 md:col-span-2 flex items-center justify-between group ${isDarkMode?'bg-gradient-to-r from-slate-800 to-slate-750 border-slate-700 hover:border-indigo-500':'bg-gradient-to-r from-white to-slate-50 border-slate-200 hover:border-indigo-300'}`} onClick={()=>showToast('Connecting to support...', 'info')}>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Phone size={32}/></div>
                    <div>
                      <h4 className="font-bold text-xl text-slate-900 dark:text-white">Live Support</h4>
                      <p className={`text-sm mt-1 font-medium ${textMuted}`}>Available 24/7 for Innovators. Connect with a human agent.</p>
                    </div>
                  </div>
                  <ChevronRight size={28} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-2 transition-all"/>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl font-bold z-50 animate-fade-in flex items-center gap-3 ${toast.type === 'danger' ? 'bg-red-600 text-white' : (toast.type === 'info' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-emerald-600 text-white')}`}>
          {toast.type === 'info' && <Activity size={18}/>}
          {toast.type === 'success' && <CheckCircle size={18}/>}
          {toast.message}
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black mb-1 text-slate-900 dark:text-white">Booking Details</h3>
                <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                  JOB-{selectedBooking._id.substring(0,6).toUpperCase()}
                </span>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-1 bg-white rounded-lg shadow-sm">
                  <QRCodeSVG value={`${window.location.origin}/track/${selectedBooking._id}`} size={64} />
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <X size={20} className={textMuted} />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>Facility</p>
                <p className="font-bold text-lg">{selectedBooking.facility?.name || 'Precision Milling Center'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>Date & Time</p>
                  <p className="font-bold">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                  <p className={`text-sm ${textMuted}`}>{selectedBooking.startTime}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>Cost & Status</p>
                  <p className="font-black text-xl text-indigo-500">₹{selectedBooking.totalCost.toFixed(2)}</p>
                  <p className="text-sm font-bold capitalize mt-1">{selectedBooking.status}</p>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Attached CAD File</p>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
                  <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"><FileText size={16}/></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{selectedBooking.attachedFile || 'prototype_v2_final.step'}</p>
                    <p className={`text-xs ${textMuted}`}>12.4 MB</p>
                  </div>
                  <button className="text-blue-500 hover:text-blue-600"><Download size={16}/></button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              {selectedBooking.status === 'pending' ? (
                <div className="flex-1 py-3 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                  <Clock size={18}/> Awaiting University Approval
                </div>
              ) : selectedBooking.status === 'approved' ? (
                <button className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2" onClick={() => payBooking(selectedBooking._id)}>
                  <DollarSign size={18}/> Complete Payment
                </button>
              ) : (
                <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors" onClick={() => { showToast('Message sent to facility operator.', 'success'); setSelectedBooking(null); }}>
                  Contact Facility
                </button>
              )}
              {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                <button className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors dark:bg-red-900/30 dark:hover:bg-red-900/50" onClick={() => { cancelBooking(selectedBooking._id); setSelectedBooking(null); }}>
                  Cancel Booking
                </button>
              )}
            </div>
            
            {selectedBooking.status === 'completed' && (
              <div className="mt-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-800">
                <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2">Live Logistics Tracking</p>
                <div className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1"><CheckCircle size={12}/></div>
                    <span>Fabricated</span>
                  </div>
                  <div className="flex-1 h-1 bg-emerald-500 mx-2"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1"><CheckCircle size={12}/></div>
                    <span>Dispatched</span>
                  </div>
                  <div className="flex-1 h-1 bg-emerald-200 dark:bg-emerald-800 mx-2 relative overflow-hidden"><div className="absolute top-0 left-0 h-full bg-emerald-500 w-1/2 animate-pulse"></div></div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-500 dark:bg-emerald-900/50 flex items-center justify-center mb-1 border-2 border-emerald-500"><Map size={12}/></div>
                    <span>In Transit</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* FEEDBACK SECTION */}
            {selectedBooking.status === 'completed' && !selectedBooking.feedback && (
              <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Leave Remarks / Feedback</p>
                <textarea 
                  id={`feedback-${selectedBooking._id}`}
                  className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-indigo-500" 
                  rows="3" 
                  placeholder="Report issues or provide feedback on the fabrication..."
                ></textarea>
                <button 
                  className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-sm"
                  onClick={() => submitFeedback(selectedBooking._id, document.getElementById(`feedback-${selectedBooking._id}`).value)}
                >
                  Submit Feedback
                </button>
              </div>
            )}
            {selectedBooking.status === 'completed' && selectedBooking.feedback && (
              <div className="mt-4 p-4 rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-800 relative group">
                <button 
                  onClick={() => {
                    const content = `Feedback Form\n\nBooking ID: ${selectedBooking._id}\nFacility: ${selectedBooking.facility?.name || 'N/A'}\nDate: ${new Date().toLocaleDateString()}\n\nFeedback Details:\n${selectedBooking.feedback}\n`;
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `feedback_JOB-${selectedBooking._id.substring(0,6).toUpperCase()}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="absolute right-4 top-4 text-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1 text-xs font-bold opacity-80 hover:opacity-100"
                >
                  <Download size={14}/> Download
                </button>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Your Feedback</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium pr-24">"{selectedBooking.feedback}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: REVIEW & FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="space-y-6 animate-fade-in flex-1">
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-6 border-b pb-4 dark:border-slate-700">
              <h2 className="text-xl font-black flex items-center gap-2"><Star className="text-pink-500" /> Review & Feedback</h2>
              <span className={`text-xs font-bold uppercase tracking-widest ${textMuted}`}>Help Us Improve</span>
            </div>

            {completedBookings.length === 0 ? (
              <div className="text-center py-10">
                <p className={`${textMuted}`}>You do not have any completed bookings to review yet.</p>
                <button className="mt-4 text-blue-500 font-bold hover:underline" onClick={() => setActiveTab('overview')}>Back to Dashboard</button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Select Completed Resource/Facility</label>
                  <select 
                    className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'} focus:ring-2 focus:ring-pink-500 focus:outline-none`}
                    value={feedbackData.bookingId}
                    onChange={(e) => setFeedbackData({...feedbackData, bookingId: e.target.value})}
                    required
                  >
                    <option value="">-- Choose a Facility --</option>
                    {completedBookings.map(b => (
                      <option key={b._id} value={b._id}>{b.facility?.name || 'Precision Milling Center'} (Job: {b._id.slice(-6).toUpperCase()})</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-xl border border-pink-100 bg-pink-50/50 dark:border-pink-900/30 dark:bg-pink-900/10">
                  <label className={`block text-sm font-bold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Rate Your Experience</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFeedbackData({...feedbackData, rating: star})}
                        className={`transition-all duration-200 hover:scale-110 ${feedbackData.rating >= star ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'text-slate-300 dark:text-slate-600'}`}
                      >
                        <Star size={32} fill={feedbackData.rating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                  {feedbackData.rating > 0 && <p className="text-xs font-bold mt-2 text-pink-600 dark:text-pink-400">You selected {feedbackData.rating} out of 5 stars.</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Facility Quality</label>
                    <p className={`text-xs mb-3 ${textMuted}`}>How was the equipment and infrastructure?</p>
                    <select 
                      className={`w-full p-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300'} focus:ring-2 focus:ring-pink-500 focus:outline-none`}
                      value={feedbackData.facilityQuality}
                      onChange={(e) => setFeedbackData({...feedbackData, facilityQuality: e.target.value})}
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Average">Average</option>
                      <option value="Needs Improvement">Needs Improvement</option>
                    </select>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Timeliness</label>
                    <p className={`text-xs mb-3 ${textMuted}`}>Was the fabrication completed on time?</p>
                    <select 
                      className={`w-full p-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300'} focus:ring-2 focus:ring-pink-500 focus:outline-none`}
                      value={feedbackData.timeliness}
                      onChange={(e) => setFeedbackData({...feedbackData, timeliness: e.target.value})}
                    >
                      <option value="Faster Than Expected">Faster Than Expected</option>
                      <option value="On Time">On Time</option>
                      <option value="Slightly Delayed">Slightly Delayed</option>
                      <option value="Very Late">Very Late</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Optional Remarks / Comments</label>
                  <textarea 
                    className={`w-full p-3 rounded-xl border min-h-[100px] resize-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'} focus:ring-2 focus:ring-pink-500 focus:outline-none`}
                    placeholder="Tell us what you liked or how we can improve..."
                    value={feedbackData.comment}
                    onChange={(e) => setFeedbackData({...feedbackData, comment: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmittingFeedback}
                    className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 transition-all flex items-center gap-2"
                  >
                    {isSubmittingFeedback ? <Activity size={18} className="animate-spin" /> : <ThumbsUp size={18} />}
                    Submit Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AI QUOTATION MODAL */}
      {aiQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            {aiQuoteModal.status === 'analyzing' ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-500 flex items-center justify-center mb-4 animate-pulse">
                  <Activity size={32} />
                </div>
                <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">AI Processing Geometry</h3>
                <p className={`text-sm text-center ${textMuted}`}>Analyzing volume, structural integrity, and material requirements for {aiQuoteModal.file.name}...</p>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-full rounded-full animate-[pulse_1s_ease-in-out_infinite]" style={{transformOrigin: 'left', animation: 'scaleX 2s infinite alternate'}}></div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black mb-1 text-slate-900 dark:text-white flex items-center gap-2"><CheckCircle className="text-emerald-500"/> AI Quote Ready</h3>
                    <p className={`text-xs ${textMuted}`}>Based on geometry analysis of {aiQuoteModal.file.name}</p>
                  </div>
                  <button onClick={() => setAiQuoteModal(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <X size={20} className={textMuted} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>Est. Cost</p>
                      <p className="font-black text-2xl text-indigo-500">₹{aiQuoteModal.quoteData.materialCost}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>Time</p>
                      <p className="font-black text-xl text-slate-700 dark:text-slate-200">{aiQuoteModal.quoteData.timeEst}</p>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>Optimal Machine Matched</p>
                    <p className="font-bold flex items-center gap-2"><Settings size={16} className="text-indigo-500"/> {aiQuoteModal.quoteData.machine}</p>
                    <p className={`text-xs mt-1 text-emerald-500 font-bold`}>{aiQuoteModal.quoteData.aiConfidence} Match Confidence</p>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                  <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2" onClick={() => { showToast('Redirecting to Payment Gateway...', 'info'); setAiQuoteModal(null); setTimeout(()=>showToast('Payment successful! Job queued.', 'success'), 2000); }}>
                    <DollarSign size={18}/> Accept & Pay
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
