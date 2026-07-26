import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Building, Loader2, Eye, EyeOff, X, Info } from 'lucide-react';
import Terms from './Terms';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', confirmPassword: '', role: 'innovator',
    phone: '', category: 'Student', organization: '', location: '',
    recentDegree: '', dpiitNo: '', gstNo: '', designation: '', facilityName: '',
    govIdProof: '', studentIdProof: '', facilityProof: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Mock file upload by just storing the file name or a mock URL
      setFormData({ ...formData, [e.target.name]: `/mock-storage/${e.target.files[0].name}` });
    }
  };

  const handleRoleChange = (role) => {
    setFormData({ 
      ...formData, 
      role, 
      category: role === 'innovator' ? 'Student' : 'University'
    });
  };

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
        
        if (data.user.role === 'admin') {
          await auth.signOut();
          setLoading(false);
          return setError('Admins must log in through the secure Admin Portal.');
        } else if (data.user.role === 'operator') {
          navigate('/operator-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        firebaseUser = userCredential.user;
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: firebaseUser.uid, ...formData })
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
                  onClick={() => handleRoleChange('innovator')}
                >
                  <GraduationCap size={16} /> Innovator
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${formData.role === 'operator' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  onClick={() => handleRoleChange('operator')}
                >
                  <Building size={16} /> Operator
                </button>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none">
                    {formData.role === 'innovator' ? (
                      <>
                        <option value="Student">Student</option>
                        <option value="Professional">Professional</option>
                        <option value="Startup/MSME">Startup/MSME</option>
                      </>
                    ) : (
                      <>
                        <option value="University">University/College</option>
                        <option value="Govt Department">Govt Department</option>
                        <option value="Incubator">Incubator</option>
                        <option value="Private Manufacturing">Private Manufacturing</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                    <input type="text" name="name" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                    <input type="tel" name="phone" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>

                {formData.role === 'innovator' && formData.category === 'Student' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">College Name</label>
                        <input type="text" name="organization" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Institute of Technology" value={formData.organization} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Recent Degree</label>
                        <input type="text" name="recentDegree" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="B.Tech Computer Science" value={formData.recentDegree} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Student ID Proof</label>
                        <input type="file" name="studentIdProof" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gov ID Proof</label>
                        <input type="file" name="govIdProof" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
                      </div>
                    </div>
                  </>
                )}

                {formData.role === 'innovator' && formData.category === 'Professional' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Organization</label>
                        <input type="text" name="organization" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Company Name" value={formData.organization} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Designation</label>
                        <input type="text" name="designation" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Senior Engineer" value={formData.designation} onChange={handleChange} required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gov ID Proof</label>
                      <input type="file" name="govIdProof" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
                    </div>
                  </>
                )}

                {formData.role === 'innovator' && formData.category === 'Startup/MSME' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
                        <input type="text" name="organization" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Startup Inc." value={formData.organization} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">DPIIT Registration No</label>
                        <input type="text" name="dpiitNo" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="DIPPXXXX" value={formData.dpiitNo} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">GST No</label>
                        <input type="text" name="gstNo" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="22AAAAA0000A1Z5" value={formData.gstNo} onChange={handleChange} required />
                      </div>
                    </div>
                    
                    <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Uploads & Supporting Documents</h3>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Concept Note/ Product Brochure <span className="text-red-500">*</span></label>
                        <input type="file" name="conceptNote" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
                        <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Info size={12} /> Max file size: 5MB • Allowed types: pdf, doc, docx
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Solution Technical proposal</label>
                        <input type="file" name="technicalProposal" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Info size={12} /> Max file size: 5MB • Allowed types: pdf, jpg, jpeg, png, doc, docx
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {formData.role === 'operator' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Organization / College Name</label>
                        <input type="text" name="organization" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Aditya University" value={formData.organization} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Location / City</label>
                        <input type="text" name="location" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Surampalem" value={formData.location} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Facility Name</label>
                        <input type="text" name="facilityName" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Advanced Prototyping Lab" value={formData.facilityName} onChange={handleChange} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Designation</label>
                        <input type="text" name="designation" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" placeholder="Lab In-charge" value={formData.designation} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Facility Reg. Proof</label>
                        <input type="file" name="facilityProof" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gov ID Proof</label>
                        <input type="file" name="govIdProof" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
                      </div>
                    </div>
                  </>
                )}
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
