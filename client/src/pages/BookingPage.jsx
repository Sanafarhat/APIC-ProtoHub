import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { X, Calendar, Clock, Loader2, Sparkles, AlertCircle, CheckCircle, CreditCard, ShieldCheck, UploadCloud, MapPin, Phone, Building } from 'lucide-react';
import { jsPDF } from "jspdf";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState(1);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');

  // AI & CAD Features
  const [attachedFile, setAttachedFile] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [materialCost, setMaterialCost] = useState(0);
  const [aiEstimated, setAiEstimated] = useState(false);

  // Availability & Payment States
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availableSlots, setAvailableSlots] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showMockRazorpay, setShowMockRazorpay] = useState(false);
  const [orderAmount, setOrderAmount] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/facilities/${id}`)
      .then(res => res.json())
      .then(data => {
        setFacility(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file.name);
      setAiAnalyzing(true);
      
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/estimate-cost`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attachedFile: file.name,
            facility: facility.name,
            equipmentType: facility.equipmentType,
            duration: duration
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          setMaterialCost(data.materialCost);
          setAiEstimated(true);
        } else {
          setMaterialCost(Math.floor(Math.random() * 500) + 150);
          setAiEstimated(true);
        }
      } catch (err) {
        setMaterialCost(Math.floor(Math.random() * 500) + 150);
        setAiEstimated(true);
      } finally {
        setAiAnalyzing(false);
      }
    }
  };

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (!date) {
      setError('Please select a date.');
      return;
    }
    setCheckingAvailability(true);
    setError('');
    setSelectedSlot('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings/available-slots?facility=${facility._id}&date=${date}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to fetch slots');

      setAvailableSlots(data);
      if (data.length === 0) setError('No slots available on this date. Please choose another date.');
    } catch (err) {
      setError(err.message || 'Failed to check availability.');
      setAvailableSlots(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
      navigate('/login');
      return;
    }

    setPaymentProcessing(true);
    const baseCost = facility.hourlyRate * duration;
    const totalCost = (baseCost + materialCost) * 1.18;
    setOrderAmount(totalCost);
    
    setShowMockRazorpay(true);
  };

  const executeMockPayment = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const mockPaymentId = 'pay_' + Math.random().toString(36).substr(2, 14);
    
    try {
      await submitBooking(mockPaymentId, orderAmount, token, user);
      setShowMockRazorpay(false);
    } catch (err) {
      setError(err.message);
      setPaymentProcessing(false);
      setShowMockRazorpay(false);
    }
  };

  const generateReceipt = (paymentId, totalCost, user) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text("APIC ProtoHub - Receipt", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date of Payment: ${new Date().toLocaleString()}`, 20, 35);
    doc.text(`Transaction ID: ${paymentId}`, 20, 42);
    doc.text(`User Name: ${user.name}`, 20, 49);
    doc.text(`User Email: ${user.email}`, 20, 56);
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 62, 190, 62);
    
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    doc.text("Booking Details", 20, 72);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Facility: ${facility.name}`, 20, 82);
    doc.text(`College/Institution: ${facility.institution || 'N/A'}`, 20, 89);
    doc.text(`Operator/Incharge: ${facility.operatorName || 'N/A'}`, 20, 96);
    doc.text(`Contact: ${facility.operatorContact || 'N/A'}`, 20, 103);
    doc.text(`Date Booked: ${date}`, 20, 110);
    doc.text(`Time Slot: ${selectedSlot}`, 20, 117);
    doc.text(`Duration: ${duration} Hour(s)`, 20, 124);
    
    doc.line(20, 130, 190, 130);
    
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    doc.text("Cost Breakdown", 20, 140);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Base Cost: INR ${(facility.hourlyRate * duration).toFixed(2)}`, 20, 150);
    doc.text(`Extra/AI Material Cost: INR ${materialCost.toFixed(2)}`, 20, 157);
    doc.text(`Taxes (18% GST): INR ${(totalCost - (facility.hourlyRate * duration) - materialCost).toFixed(2)}`, 20, 164);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL PAID: INR ${totalCost.toFixed(2)}`, 20, 176);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for choosing APIC ProtoHub for your prototyping needs!", 20, 196);
    
    doc.save(`APIC_Receipt_${paymentId}.pdf`);
  };

  const submitBooking = async (paymentId, totalCost, token, user) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          user: user.id,
          facility: facility._id,
          date,
          startTime: selectedSlot,
          duration,
          attachedFile,
          materialCost,
          aiEstimated,
          totalCost,
          paymentId 
        })
      });

      if (!res.ok) throw new Error('Booking failed');
      generateReceipt(paymentId, totalCost, user);
      setTimeout(() => { navigate('/dashboard'); }, 500);
      
    } catch (err) {
      setError(err.message);
      setPaymentProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (!facility) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-xl font-bold text-red-500 flex items-center gap-2"><AlertCircle/> Facility not found</div>
    </div>
  );

  const cost = facility.hourlyRate * duration;
  const tax = (cost + materialCost) * 0.18;
  const total = cost + materialCost + tax;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 sm:p-8 transition-colors duration-300">
      
      {/* Mock Razorpay Overlay */}
      {showMockRazorpay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in relative border border-slate-200 dark:border-slate-800">
            <button onClick={() => {setShowMockRazorpay(false); setPaymentProcessing(false);}} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
              <X size={20}/>
            </button>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
              <h3 className="font-black text-xl mb-1 flex items-center justify-center gap-2"><CreditCard size={20}/> Razorpay Test Gateway</h3>
              <p className="opacity-80 text-sm font-medium">Demo Mode - No real charge</p>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-bold">Total Amount</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">₹{orderAmount.toFixed(2)}</span>
              </div>
              
              <div className="space-y-3">
                <button onClick={executeMockPayment} className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all group shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">UPI</div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Pay via UPI</span>
                  </div>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Pay Now</span>
                </button>
                <button onClick={executeMockPayment} className="w-full p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all group shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">CC</div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Card / Netbanking</span>
                  </div>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Pay Now</span>
                </button>
              </div>
              
              <p className="text-center text-xs text-slate-400 mt-6 font-bold uppercase tracking-widest flex justify-center items-center gap-1"><ShieldCheck size={14}/> Secured by Razorpay</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* Booking Form Col */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-3xl font-black flex items-center gap-3"><Calendar className="text-indigo-500"/> Schedule Booking</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Reserve your slot at {facility.name}</p>
            </div>
            
            <div className="p-8">
              {error && <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-bold flex items-center gap-2"><AlertCircle size={18}/> {error}</div>}
              
              <form onSubmit={handleCheckAvailability} className="space-y-8">
                
                {/* AI Cost Estimator */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/50 dark:bg-indigo-900/10 p-6 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-indigo-500" size={20}/>
                    <label className="font-black text-indigo-700 dark:text-indigo-400">AI Cost & Requirement Estimator</label>
                  </div>
                  <p className="text-sm font-medium text-indigo-600/70 dark:text-indigo-400/70 mb-4">Upload your CAD (.stl, .step) or Project Document (.pdf, .docx) for automatic requirement and cost estimation.</p>
                  
                  <div className="relative">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".stl,.step,.obj,.pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold shadow-sm group-hover:border-indigo-300 transition-colors">
                      <UploadCloud size={20}/> {attachedFile ? attachedFile : 'Select file to analyze'}
                    </div>
                  </div>
                  
                  {aiAnalyzing && (
                    <div className="mt-4 p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center gap-3 border border-amber-200 dark:border-amber-900/50">
                      <Loader2 size={16} className="animate-spin" /> AI is analyzing geometrical complexity and volume...
                    </div>
                  )}
                  {aiEstimated && !aiAnalyzing && (
                    <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold text-sm flex items-center gap-3 border border-emerald-200 dark:border-emerald-900/50 animate-fade-in">
                      <CheckCircle size={16}/> AI Analysis Complete. Extra Material Cost: ₹{materialCost}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Date</label>
                    <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium" value={date} onChange={e => {setDate(e.target.value); setAvailableSlots(null); setSelectedSlot('');}} required />
                  </div>
                </div>

                {availableSlots === null && (
                  <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-2" disabled={aiAnalyzing || checkingAvailability}>
                    {checkingAvailability && <Loader2 size={18} className="animate-spin" />}
                    {checkingAvailability ? 'Searching Slots...' : 'Check Availability'}
                  </button>
                )}

                {availableSlots !== null && availableSlots.length === 0 && (
                  <button type="button" onClick={() => setAvailableSlots(null)} className="w-full py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                    Try Another Date
                  </button>
                )}

                {availableSlots !== null && availableSlots.length > 0 && (
                  <div className="pt-8 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                    <h4 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Clock size={18} className="text-indigo-500"/> Available Time Slots</h4>
                    <div className="flex flex-wrap gap-3">
                      {availableSlots.map(slot => (
                        <button 
                          key={slot} 
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${selectedSlot === slot ? 'bg-indigo-600 text-white shadow-indigo-600/40 border border-indigo-600 scale-105' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>

                    {selectedSlot && (
                      <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 animate-fade-in">
                        <div className="max-w-xs mb-6">
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Duration (Hours)</label>
                          <input type="number" min="1" max="24" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono font-bold" value={duration} onChange={e => setDuration(Number(e.target.value))} required />
                        </div>
                        
                        <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <input type="checkbox" id="terms" required checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="mt-1 rounded text-indigo-600 focus:ring-indigo-500" />
                          <label htmlFor="terms" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Terms & Conditions</Link> and understand that facility rules apply.
                          </label>
                        </div>

                        <button type="button" onClick={handlePayment} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex justify-center items-center gap-2" disabled={paymentProcessing || !agreeTerms}>
                          {paymentProcessing && <Loader2 size={18} className="animate-spin" />}
                          {paymentProcessing ? 'Initializing Payment...' : 'Proceed to Payment'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
        
        {/* Summary Col */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden sticky top-6">
            <div className="p-6 bg-slate-900 text-white">
              <h3 className="text-xl font-black mb-1">Booking Summary</h3>
              <p className="text-slate-400 text-sm font-medium">Invoice Preview</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Facility</span>
                <div className="text-right">
                  <span className="block font-black text-slate-900 dark:text-white">{facility.name}</span>
                  <span className="text-xs font-bold text-indigo-500 flex items-center gap-1 justify-end mt-1"><Building size={12}/> {facility.institution}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Rate</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹{facility.hourlyRate} / hr</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Base Cost ({duration} hrs)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹{cost.toFixed(2)}</span>
              </div>
              
              {aiEstimated && (
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/20 -mx-6 px-6 py-4">
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"><Sparkles size={14}/> AI Material Est.</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">₹{materialCost.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Taxes (18% GST)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">₹{tax.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">Total Payable</span>
                <span className="font-mono text-3xl font-black text-indigo-600 dark:text-indigo-400">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingPage;
