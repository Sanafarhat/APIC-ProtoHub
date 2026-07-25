import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <Rocket size={16} />
              </div>
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">APIC ProtoHub</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
              Empowering innovators with access to world-class prototyping facilities across Andhra Pradesh. Building the future, one prototype at a time.
            </p>
          </div>
          
          <div>
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold transition-colors">Home</Link></li>
              <li><Link to="/facilities" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold transition-colors">Facilities</Link></li>
              <li><Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold transition-colors">Sign In</Link></li>
              <li><Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold transition-colors">Get Started</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold transition-colors">Terms of Service</Link></li>
              <li><Link to="/terms" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold transition-colors">Support Center</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 dark:text-slate-500 text-sm font-bold">
            &copy; {currentYear} APIC ProtoHub. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-400 dark:text-slate-500">
            <span>Powered by APIC</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
