import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Building, Loader2, Eye, EyeOff, X } from 'lucide-react';
import Terms from './Terms';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'innovator' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }
    
    setLoading(true);

    try {
      let firebaseUser;
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        firebaseUser = userCredential.user;
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, uid: firebaseUser.uid })
        });
        
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text.includes('{') ? JSON.parse(text).message : 'Backend Error: Failed to connect to the database. Check Render logs.');
        }
        
        const data = await res.json();
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role === 'admin') navigate('/admin');
        else if (data.user.role === 'operator') navigate('/operator-dashboard');
        else navigate('/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        firebaseUser = userCredential.user;
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: firebaseUser.uid, name: formData.name, email: formData.email, role: formData.role })
        });
        
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text.includes('{') ? JSON.parse(text).message : 'Backend Error: Failed to connect to the database. Check Render logs.');
        }
        
        const data = await res.json();
        
        await auth.signOut();
        setIsLogin(true);
        setSuccess('Account created successfully! Please log in.');
        setFormData({ ...formData, password: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('Email is already registered.');
      else if (err.code === 'auth/invalid-credential') setError('Invalid email or password.');
      else setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white transition-colors duration-300 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 dark:bg-indigo-600/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 dark:bg-purple-600/20 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-10 overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Join ProtoHub'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {isLogin ? 'Sign in to your APIC dashboard' : 'Create an account to start prototyping'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-bold text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 text-sm font-bold text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${formData.role === 'innovator' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  onClick={() => setFormData({ ...formData, role: 'innovator' })}
                >
                  <GraduationCap size={16} /> Innovator
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${formData.role === 'operator' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  onClick={() => setFormData({ ...formData, role: 'operator' })}
                >
                  <Building size={16} /> Operator
                </button>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input type="text" name="name" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <input type="email" name="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium pr-10" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium pr-10" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start gap-2 pt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <input type="checkbox" id="terms" required className="mt-1 rounded text-indigo-600 focus:ring-indigo-500" />
                <label htmlFor="terms">
                  I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Terms & Conditions</button>
                </label>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex justify-center items-center gap-2">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
        
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="text-indigo-600 dark:text-indigo-400 font-black hover:underline ml-1" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
      
      {showTerms && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm p-4 sm:p-8 flex items-start justify-center">
          <div className="relative w-full max-w-4xl mx-auto mt-10">
            <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors">
              <X size={24} className="text-slate-600 dark:text-slate-300"/>
            </button>
            <Terms isModal={true} onClose={() => setShowTerms(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
