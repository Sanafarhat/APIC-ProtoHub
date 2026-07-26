import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Settings, Wrench, Package, AlertTriangle, Calendar, CheckCircle, 
  Activity, Clock, Thermometer, Zap, ShieldAlert, Cpu, 
  Search, PlayCircle, ClipboardCheck, QrCode, UserCog, Sun, Moon,
  ArrowUpRight, TrendingUp, DollarSign, Database, Download
} from 'lucide-react';
import './Dashboard.css';

const OperatorDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('telemetry');
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  // Ensure theme sync on mount in case it was toggled elsewhere
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (user && user.role === 'operator') {
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings?operatorOrg=${encodeURIComponent(user.organization || '')}`)
        .then(res => res.json())
        .then(data => {
          const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
          setBookings(sorted);
        })
        .catch(err => console.error(err));
    }
  }, [userString]);

  if (!user || user.role !== 'operator') return <div className="container mt-4 p-8 text-center bg-slate-50 text-slate-800 font-bold rounded-xl shadow">Unauthorized. Operator access only.</div>;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const advanceJobStatus = async (id, currentStatus) => {
    let nextStatus = 'completed';
    if (currentStatus === 'pending_operator' || currentStatus === 'pending') nextStatus = 'approved';
    if (currentStatus === 'approved') nextStatus = 'in-progress';
    if (currentStatus === 'in-progress') nextStatus = 'qa-check';
    if (currentStatus === 'qa-check') nextStatus = 'completed';
    
    // Update frontend optimistically
    setBookings(bookings.map(b => b._id === id ? { ...b, status: nextStatus } : b));
    showToast(`Job ${id.substring(0,6)} advanced to ${nextStatus.toUpperCase()}`, 'info');

    // Persist to backend
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (err) {
      console.error('Failed to update status', err);
      console.error('Failed to update status', err);
    }
  };

  const rejectJob = async (id) => {
    if (!window.confirm("Are you sure you want to reject this booking?")) return;
    setBookings(bookings.map(b => b._id === id ? { ...b, status: 'rejected' } : b));
    showToast(`Job ${id.substring(0,6)} has been REJECTED`, 'warning');
    try {
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
    } catch (err) {
      console.error('Failed to reject', err);
    }
  };

  // Mock Telemetry Data
  const machines = [
    { id: 'M-CNC-01', name: 'HAAS UMC-500 5-Axis CNC', status: 'running', job: 'JOB-9A2F41', progress: 68, temp: '42°C', rpm: '12,000', operator: 'Rajesh K.' },
    { id: 'M-3DP-02', name: 'Stratasys F370 FDM', status: 'running', job: 'JOB-3B8C11', progress: 92, temp: '260°C', rpm: 'N/A', operator: 'Priya S.' },
    { id: 'M-SLA-01', name: 'Formlabs Form 3+', status: 'idle', job: 'None', progress: 0, temp: '30°C', rpm: 'N/A', operator: 'Unassigned' },
    { id: 'M-LSR-01', name: 'Epilog Fusion Pro 48', status: 'error', job: 'JOB-7C91D2', progress: 14, temp: '68°C', rpm: 'N/A', operator: 'Vikram M.' }
  ];

  const pendingBookings = bookings.filter(b => b.status === 'pending_operator' || b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'in-progress' || b.status === 'qa-check');

  const themeClass = isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardClass = isDarkMode ? 'bg-slate-800 border-slate-700/50 shadow-lg shadow-black/20 text-slate-100' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40 text-slate-800';
  const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen ${themeClass} transition-colors duration-300 pb-16 font-sans`}>
      
      {/* HEADER */}
      <header className={`sticky top-0 z-40 border-b ${isDarkMode ? 'bg-slate-900/80 border-slate-700 shadow-md shadow-black/20' : 'bg-white/80 border-slate-200 shadow-sm'} backdrop-blur-md px-6 py-4 flex justify-between items-center transition-all duration-300`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Cpu size={24} />
          </div>
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>APIC Operations <span className="text-indigo-500">ERP</span></h1>
            <p className={`${textMuted} text-sm font-bold uppercase tracking-widest`}>Facility Control Center</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button className={`p-2.5 rounded-full transition-transform hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-slate-800 text-yellow-400 border border-slate-700' : 'bg-white text-slate-700 border border-slate-200 shadow-sm'}`} onClick={toggleTheme}>
             {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
           </button>
           <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-bold">{user.name}</p>
               <p className={`text-xs ${textMuted} uppercase tracking-wider`}>Lead Facility Operator</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-indigo-500 text-slate-600 dark:text-slate-300 font-bold">
               {user.name.charAt(0).toUpperCase()}
             </div>
           </div>
        </div>
      </header>

      <div className="flex px-4 md:px-6 py-8 max-w-[1600px] mx-auto gap-8 flex-col lg:flex-row">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-2">
          <h3 className={`text-xs font-black uppercase tracking-widest pl-2 mb-2 ${textMuted}`}>Digital Backbone</h3>
          
          <button onClick={() => setActiveTab('telemetry')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'telemetry' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 hover:-translate-y-1' : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50')}`}>
            <Activity size={20} className={activeTab==='telemetry'?'text-white':'text-indigo-500'}/> Machine Telemetry
          </button>
          
          <button onClick={() => setActiveTab('jobs')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'jobs' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 hover:-translate-y-1' : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50')}`}>
            <ClipboardCheck size={20} className={activeTab==='jobs'?'text-white':'text-blue-500'}/> Job Queue & QA
          </button>
          
          <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 hover:-translate-y-1' : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50')}`}>
            <Package size={20} className={activeTab==='inventory'?'text-white':'text-emerald-500'}/> Inventory Engine
          </button>
          
          <button onClick={() => setActiveTab('maintenance')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'maintenance' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/40 hover:-translate-y-1' : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50')}`}>
            <AlertTriangle size={20} className={activeTab==='maintenance'?'text-white':'text-amber-500'}/> Predictive Alerts
          </button>
          
          <button onClick={() => setActiveTab('shifts')} className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'shifts' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40 hover:-translate-y-1' : (isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50')}`}>
            <UserCog size={20} className={activeTab==='shifts'?'text-white':'text-purple-500'}/> Operator Shifts
          </button>
        </aside>

        {/* MAIN ERP CONTENT AREA */}
        <div className="flex-1">
          
          {/* TAB 1: MACHINE TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-2xl border-l-4 border-l-indigo-500 ${cardClass}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>OEE (Efficiency)</p>
                  <h3 className="text-3xl font-black text-indigo-500">84.2%</h3>
                </div>
                <div className={`p-5 rounded-2xl border-l-4 border-l-blue-500 ${cardClass}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>Active Fabrications</p>
                  <h3 className="text-3xl font-black text-blue-500">{activeBookings.length}</h3>
                </div>
                <div className={`p-5 rounded-2xl border-l-4 border-l-emerald-500 ${cardClass}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>Pending QA</p>
                  <h3 className="text-3xl font-black text-emerald-500">{bookings.filter(b=>b.status==='qa-check').length}</h3>
                </div>
                <div className={`p-5 rounded-2xl border-l-4 border-l-red-500 ${isDarkMode?'bg-red-950/30 border-red-900':'bg-red-50 border-red-200'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 text-red-500`}>Machine Alerts</p>
                  <h3 className="text-3xl font-black text-red-600 dark:text-red-400 flex items-center gap-2">1 <ShieldAlert size={24}/></h3>
                </div>
              </div>

              <h2 className="text-xl font-black flex items-center gap-2 mt-8 mb-4"><Database size={24} className="text-indigo-500"/> Live Equipment Telemetry</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {machines.map((m, i) => (
                  <div key={i} className={`p-6 rounded-2xl border relative overflow-hidden group ${isDarkMode?'bg-slate-800/80 border-slate-700':'bg-white border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all'}`}>
                    <div className={`absolute top-0 right-0 w-2 h-full ${m.status==='running'?'bg-emerald-500':(m.status==='error'?'bg-red-500':'bg-amber-500')}`}></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600 mr-2">{m.id}</span>
                        <h3 className="text-lg font-black mt-2">{m.name}</h3>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${m.status==='running'?'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400':(m.status==='error'?'bg-red-100 text-red-700 animate-pulse dark:bg-red-900/40 dark:text-red-400':'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400')}`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${isDarkMode?'bg-slate-900/50':'bg-slate-50'}`}>
                        <Thermometer size={16} className={`mb-1 ${m.status==='error'?'text-red-500':textMuted}`}/>
                        <p className={`text-xs font-bold uppercase ${textMuted}`}>Core Temp</p>
                        <p className={`font-black ${m.status==='error'?'text-red-500':''}`}>{m.temp}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode?'bg-slate-900/50':'bg-slate-50'}`}>
                        <Zap size={16} className={`mb-1 ${textMuted}`}/>
                        <p className={`text-xs font-bold uppercase ${textMuted}`}>RPM / Laser</p>
                        <p className="font-black">{m.rpm}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode?'bg-slate-900/50':'bg-slate-50'}`}>
                        <UserCog size={16} className={`mb-1 text-indigo-500`}/>
                        <p className={`text-xs font-bold uppercase ${textMuted}`}>Operator</p>
                        <p className="font-bold text-sm text-indigo-500">{m.operator}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>Current Job: {m.job}</span>
                        <span>{m.progress}%</span>
                      </div>
                      <div className={`w-full rounded-full h-2 overflow-hidden ${isDarkMode?'bg-slate-700':'bg-slate-200'}`}>
                        <div className={`h-full rounded-full ${m.status==='error'?'bg-red-500':(m.status==='idle'?'bg-amber-500':'bg-gradient-to-r from-emerald-500 to-emerald-400')}`} style={{width: `${m.progress}%`}}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: JOB QUEUE & QA */}
          {activeTab === 'jobs' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/30 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-20"><QrCode size={160}/></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-black flex items-center gap-3"><QrCode size={28}/> Digital Job Traveler Scanner</h2>
                  <p className="font-medium mt-1 text-indigo-100">Scan physical docket QR codes to instantly retrieve and update job status on the shop floor.</p>
                </div>
                <button className="relative z-10 bg-white text-indigo-600 font-black px-6 py-3 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-xl" onClick={()=>showToast('Camera activated. Awaiting scan...', 'info')}>
                  <Search size={20}/> Scan Job QR
                </button>
              </div>

              <div className={`rounded-2xl border ${cardClass} overflow-hidden`}>
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="text-xl font-black">Active Fabrication Queue</h3>
                  <div className="flex gap-2">
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg text-xs font-bold uppercase">Pending Approval: {pendingBookings.length}</span>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-xs font-bold uppercase">Active Jobs: {activeBookings.length}</span>
                  </div>
                </div>
                
                <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                  {bookings.filter(b=>b.status !== 'cancelled').map(b => (
                    <div key={b._id} className={`p-6 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80`}>
                      <div className="flex items-start gap-4 w-full sm:w-auto">
                        <div className={`p-3 rounded-xl border ${b.status==='completed'?'bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-900/50 dark:border-emerald-800 dark:text-emerald-400':(b.status==='qa-check'?'bg-amber-100 border-amber-200 text-amber-600 dark:bg-amber-900/50 dark:border-amber-800 dark:text-amber-400':(b.status==='in-progress'?'bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-900/50 dark:border-blue-800 dark:text-blue-400':'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'))}`}>
                          {b.status === 'pending' ? <Clock size={24}/> : (b.status === 'qa-check' ? <ShieldAlert size={24}/> : (b.status==='completed' ? <CheckCircle size={24}/> : <PlayCircle size={24}/>))}
                        </div>
                        <div className="p-1 bg-white rounded-lg shadow-sm">
                          <QRCodeSVG value={`${window.location.origin}/operator-track/${b._id}`} size={48} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono font-black text-indigo-500">JOB-{b._id.substring(0,6).toUpperCase()}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${b.status==='completed'?'bg-emerald-100 text-emerald-700':(b.status==='qa-check'?'bg-amber-100 text-amber-700':(b.status==='approved'?'bg-purple-100 text-purple-700':(b.status==='in-progress'?'bg-blue-100 text-blue-700':'bg-slate-200 text-slate-700')))}`}>
                              {b.status.replace('-', ' ')}
                            </span>
                          </div>
                          <p className="font-bold text-lg">{b.facility?.name}</p>
                          <p className={`text-xs font-medium mt-1 ${textMuted}`}>
                            Innovator: <span className="font-bold text-slate-700 dark:text-slate-300">{b.user?.name}</span> • 
                            CAD: {b.attachedFile || 'design_v2.step'} • 
                            Booked: {new Date(b.createdAt).toLocaleString()}
                          </p>
                          {b.equipment && <p className={`text-xs font-bold mt-1 text-indigo-500`}>Requested Resource: {b.equipment}</p>}
                          {b.feedback && (
                            <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800 relative group">
                              <button 
                                onClick={() => {
                                  const content = `Feedback Form\n\nBooking ID: ${b._id}\nFacility: ${b.facility?.name || 'N/A'}\nInnovator: ${b.user?.name || 'N/A'}\nDate: ${new Date(b.createdAt).toLocaleString()}\n\nFeedback Details:\n${b.feedback}\n`;
                                  const blob = new Blob([content], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `feedback_JOB-${b._id.substring(0,6).toUpperCase()}.txt`;
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                }}
                                className="absolute right-2 top-2 text-[10px] font-bold text-indigo-500/70 hover:text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Download size={12}/> Download
                              </button>
                              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Innovator Feedback:</p>
                              <p className="text-sm italic text-slate-700 dark:text-slate-300 pr-20">"{b.feedback}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="w-full lg:w-auto mt-4 sm:mt-0 flex flex-col items-end gap-2">
                        {b.status === 'rejected' ? (
                          <span className="text-red-500 font-bold flex items-center gap-2 px-4 py-2"><ShieldAlert size={20}/> Rejected</span>
                        ) : b.status === 'completed' ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-2 px-4 py-2"><CheckCircle size={20}/> Dispatched</span>
                        ) : (
                          <div className="flex items-center bg-slate-50 dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-inner">
                            {[
                              { label: 'Accept', s: 'pending_operator' },
                              { label: 'Start Fab', s: 'approved' },
                              { label: 'Send QA', s: 'in-progress' },
                              { label: 'Dispatch', s: 'qa-check' }
                            ].map((step, idx) => {
                              const stepIdx = ['pending_admin'].includes(b.status) ? -1 : ['pending', 'pending_operator'].includes(b.status) ? 0 : ['approved'].includes(b.status) ? 1 : ['in-progress'].includes(b.status) ? 2 : ['qa-check'].includes(b.status) ? 3 : 4;
                              return (
                                <div key={idx} className="flex items-center">
                                  <button 
                                    disabled={stepIdx !== idx} 
                                    onClick={() => stepIdx === idx && advanceJobStatus(b._id, b.status)}
                                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                                      idx < stepIdx 
                                        ? 'text-emerald-500' 
                                        : idx === stepIdx 
                                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg scale-105' 
                                          : 'text-slate-400 opacity-50 cursor-not-allowed'
                                    }`}
                                  >
                                    {idx < stepIdx ? <CheckCircle size={16}/> : (idx === stepIdx ? <PlayCircle size={16}/> : <div className="w-4 h-4 rounded-full border-2 border-current"></div>)}
                                    <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">{step.label}</span>
                                  </button>
                                  {idx < 3 && <div className={`w-3 sm:w-6 h-[2px] mx-1 ${idx < stepIdx ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>}
                                </div>
                              );
                            })}
                            
                            {(b.status === 'pending' || b.status === 'pending_operator') && (
                              <button onClick={()=>rejectJob(b._id)} className="ml-4 px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg flex flex-col items-center transition-colors">
                                <ShieldAlert size={16}/>
                                <span className="text-[10px] uppercase font-black tracking-wider">Reject</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && <div className="p-10 text-center font-bold text-slate-400">No jobs in queue.</div>}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className={`p-8 rounded-2xl border ${cardClass} animate-fade-in`}>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Package className="text-emerald-500" size={28}/> Dynamic Inventory Engine</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                      <th className={`p-4 text-xs font-black uppercase tracking-wider ${textMuted}`}>Material / Consumable</th>
                      <th className={`p-4 text-xs font-black uppercase tracking-wider ${textMuted}`}>Current Stock</th>
                      <th className={`p-4 text-xs font-black uppercase tracking-wider ${textMuted}`}>Depletion Metric</th>
                      <th className={`p-4 text-xs font-black uppercase tracking-wider ${textMuted}`}>Status</th>
                      <th className={`p-4 text-xs font-black uppercase tracking-wider ${textMuted} text-right`}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-lg">PLA Filament (White)</td>
                      <td className="p-4 font-mono font-black text-lg">45 <span className="text-sm font-bold text-slate-400">kg</span></td>
                      <td className="p-4 w-48">
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full bg-emerald-500" style={{width:'80%'}}></div></div>
                      </td>
                      <td className="p-4"><span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center w-max gap-1"><CheckCircle size={12}/> Healthy</span></td>
                      <td className="p-4 text-right"><button className="text-sm font-bold text-indigo-500 hover:underline">Restock Log</button></td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-lg">CNC Aluminum 6061 Blocks</td>
                      <td className="p-4 font-mono font-black text-lg text-amber-500">12 <span className="text-sm font-bold text-slate-400">units</span></td>
                      <td className="p-4 w-48">
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full bg-amber-500" style={{width:'25%'}}></div></div>
                      </td>
                      <td className="p-4"><span className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center w-max gap-1"><AlertTriangle size={12}/> Low Stock</span></td>
                      <td className="p-4 text-right"><button className="text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded hover:bg-amber-100">Order Now</button></td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors bg-red-50/50 dark:bg-red-900/10">
                      <td className="p-4 font-bold text-lg text-red-600 dark:text-red-400 flex items-center gap-2">SLA Resin (Tough) <ShieldAlert size={16}/></td>
                      <td className="p-4 font-mono font-black text-lg text-red-600 dark:text-red-400">2 <span className="text-sm font-bold opacity-50">Liters</span></td>
                      <td className="p-4 w-48">
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full bg-red-500" style={{width:'10%'}}></div></div>
                      </td>
                      <td className="p-4"><span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center w-max gap-1"><ShieldAlert size={12}/> Critical (Auto-Reordered)</span></td>
                      <td className="p-4 text-right"><button className="text-sm font-bold text-indigo-500 hover:underline">Track PO</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/30 flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm"><AlertTriangle size={32}/></div>
                <div>
                  <h2 className="text-xl font-black mb-1">AI Predictive Maintenance Alert</h2>
                  <p className="font-medium text-amber-50">Telemetry data from <strong>Epilog Laser (Unit #2)</strong> indicates a 14% drop in CO2 tube efficiency over the last 48 hours.</p>
                  <p className="font-bold mt-2">AI Model Prediction: Tube failure within 12-14 days if heavily utilized.</p>
                  <button className="mt-4 bg-white text-amber-600 font-black px-6 py-2 rounded-lg hover:scale-105 transition-transform shadow-lg">Schedule Offline Maintenance</button>
                </div>
              </div>

              <div className={`p-8 rounded-2xl border ${cardClass}`}>
                <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Wrench className="text-indigo-500"/> Equipment Health Logs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-5 rounded-xl border ${isDarkMode?'bg-slate-750 border-slate-700':'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
                    <div>
                      <h4 className="font-black text-lg">HAAS UMC-500 (5-Axis)</h4>
                      <p className={`text-sm mt-1 font-medium ${textMuted}`}>Spindle bearing vibration metrics nominal. Coolant levels optimal.</p>
                    </div>
                    <div className="mt-6 flex justify-between items-end">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Next Service: 45 Days</span>
                      <span className="text-emerald-500 font-black flex items-center gap-1"><CheckCircle size={16}/> Optimal</span>
                    </div>
                  </div>
                  
                  <div className={`p-5 rounded-xl border ${isDarkMode?'bg-slate-750 border-slate-700':'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
                    <div>
                      <h4 className="font-black text-lg">Electronics PCB Fab</h4>
                      <p className={`text-sm mt-1 font-medium ${textMuted}`}>Exhaust filter airflow restricted. Approaching 85% capacity block.</p>
                    </div>
                    <div className="mt-6 flex justify-between items-end">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Next Service: ASAP</span>
                      <span className="text-amber-500 font-black flex items-center gap-1"><Wrench size={16}/> Review Needed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* TAB 5: SHIFTS */}
          {activeTab === 'shifts' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/30">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-3"><UserCog size={28}/> Operator Roster & Shifts</h2>
                  <p className="font-medium mt-1 text-purple-100">Manage facility personnel, machine allocations, and shift schedules.</p>
                </div>
                <button className="bg-white text-purple-600 font-black px-6 py-3 rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-xl">
                  + Assign Operator
                </button>
              </div>

              <div className={`p-8 rounded-2xl border ${cardClass}`}>
                <h3 className="text-xl font-black mb-6">Current Shift: Morning (08:00 - 16:00)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Rajesh K.', role: 'Senior CNC Machinist', machine: 'HAAS UMC-500', status: 'Active', hours: '4h 12m' },
                    { name: 'Priya S.', role: 'Additive Tech Lead', machine: 'Stratasys F370', status: 'Active', hours: '3h 45m' },
                    { name: 'Vikram M.', role: 'Laser Systems Tech', machine: 'Epilog Fusion', status: 'On Break', hours: '2h 10m' },
                    { name: 'Anita R.', role: 'QA Inspector', machine: 'Inspection Station', status: 'Active', hours: '4h 05m' }
                  ].map((staff, i) => (
                    <div key={i} className={`p-5 rounded-xl border ${isDarkMode?'bg-slate-750 border-slate-700':'bg-slate-50 border-slate-200'} flex flex-col justify-between hover:shadow-lg transition-shadow`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold border border-purple-200 dark:border-purple-800">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{staff.name}</h4>
                            <p className="text-[10px] uppercase font-black tracking-wider text-purple-500">{staff.role}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${staff.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {staff.status}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className={`text-xs font-bold ${textMuted} mb-1`}>Assigned Station:</p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200">{staff.machine}</p>
                        <p className={`text-[10px] mt-2 font-mono ${textMuted}`}>Shift Time Logged: {staff.hours}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl font-bold z-50 animate-fade-in flex items-center gap-3 ${toast.type === 'danger' ? 'bg-red-600 text-white' : (toast.type === 'info' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-emerald-600 text-white')}`}>
          {toast.type === 'info' && <Activity size={18}/>}
          {toast.type === 'success' && <CheckCircle size={18}/>}
          {toast.message}
        </div>
      )}

    </div>
  );
};

export default OperatorDashboard;
