import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Zap, Settings, MousePointerClick, Rocket, Database, Cpu, ShieldCheck, Globe, Star, Users, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Handle initial hash routing
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 overflow-hidden">

      {/* 1. HERO SECTION (GLASSMORPHISM & GRADIENTS) */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4 sm:px-6">
        
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/images/hero_bg.png" alt="Advanced Manufacturing Facility" className="w-full h-full object-cover opacity-60 dark:opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 via-slate-50/70 to-slate-50 dark:from-slate-950/40 dark:via-slate-950/80 dark:to-slate-950"></div>
        </div>

        {/* Dynamic Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/20 dark:bg-purple-600/30 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 dark:bg-indigo-600/30 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        </div>

        <div className={`max-w-5xl mx-auto text-center relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-8 leading-tight">
            The Digital Backbone for <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Prototyping as a Service.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto font-medium leading-relaxed">
            One unified digital platform connecting innovators to Advanced Prototyping & Innovation Centres (APICs) across Andhra Pradesh. From concept submission to prototype delivery.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg">
              Launch Portal <ArrowRight size={20} />
            </Link>
            <Link to="/facilities" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 font-black rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg">
              Explore Facilities
            </Link>
          </div>
        </div>
      </section>


      {/* 3. PLATFORM LIFECYCLE (GLASS PIPELINE) */}
      <section id="about" className="py-24 px-4 sm:px-6 bg-slate-900 relative text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">One Digital Platform for Every Prototype</h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-16 font-medium">
            APIC ProtoHub is a state-wide digital ecosystem designed to democratize access to industrial-grade manufacturing. We bridge the gap between visionary innovators and world-class Advanced Prototyping & Innovation Centres (APICs), accelerating your journey from a simple CAD file to a physical, market-ready product.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            <LifecycleStep icon={<MousePointerClick />} title="1. Concept & CAD" desc="Upload designs and requirements securely." />
            <div className="hidden md:block w-16 h-1 bg-slate-700"></div>
            <LifecycleStep icon={<Database />} title="2. AI Quoting" desc="Instant material & cost estimation." />
            <div className="hidden md:block w-16 h-1 bg-slate-700"></div>
            <LifecycleStep icon={<MapPin />} title="3. Facility Booking" desc="Route to optimal APIC node." />
            <div className="hidden md:block w-16 h-1 bg-slate-700"></div>
            <LifecycleStep icon={<ShieldCheck />} title="4. QA & Dispatch" desc="Fabrication, QA tracking & delivery." />
          </div>
        </div>
      </section>

      {/* 4. EXPECTED OUTCOME (TARGET AUDIENCE & FEATURES) */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Powerful Features for Every Stakeholder</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium mb-8">
                Whether you're a student building a drone, an MSME developing an EV chassis, or a lab operator managing industrial CNCs, ProtoHub caters to your specific needs with specialized digital tools.
              </p>
              <div className="flex flex-wrap gap-3">
                {['DPIIT Startups', 'MSMEs', 'Students', 'Universities', 'Researchers', 'Faculty', 'Incubators', 'Design Firms'].map(tag => (
                  <span key={tag} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                <Rocket className="text-indigo-600 dark:text-indigo-400 mb-4" size={32} />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">Innovator Portal</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Self-service booking & tracking.</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                <Settings className="text-emerald-600 dark:text-emerald-400 mb-4" size={32} />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">Operator ERP</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Machine telemetry & shifts.</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/50">
                <Globe className="text-amber-600 dark:text-amber-400 mb-4" size={32} />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">Statewide Admin</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Macro-level APIC routing.</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-2xl border border-pink-100 dark:border-pink-800/50">
                <Star className="text-pink-600 dark:text-pink-400 mb-4" size={32} />
                <h3 className="font-black text-lg text-slate-900 dark:text-white">AI Capabilities</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Cost estimation & predictive alerts.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="py-20 px-4 sm:px-6 bg-indigo-600 dark:bg-indigo-700 text-center">
        <h2 className="text-4xl font-black text-white mb-6">Ready to Fabricate the Future?</h2>
        <Link to="/login" className="inline-block px-10 py-4 bg-white text-indigo-600 font-black rounded-xl hover:scale-105 transition-transform shadow-2xl text-lg">
          Access ProtoHub Now
        </Link>
      </section>
    </div>
  );
};

/* Helper Components */
const BentoCard = ({ num, label, icon, title, desc, borderColor }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border-y border-r border-l-4 border-y-slate-200 border-r-slate-200 dark:border-y-slate-800 dark:border-r-slate-800 ${borderColor} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}>
    <div className="flex justify-between items-start mb-6">
      <span className="text-xs font-black tracking-widest text-slate-400 uppercase flex gap-2 items-center">
        <span className="text-slate-300 dark:text-slate-600">{num} /</span> {label}
      </span>
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

const LifecycleStep = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center p-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl w-full md:w-64 z-10 hover:bg-slate-800 transition-colors">
    <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30">
      {icon}
    </div>
    <h4 className="font-bold text-lg mb-2">{title}</h4>
    <p className="text-sm text-slate-400">{desc}</p>
  </div>
);



export default LandingPage;
