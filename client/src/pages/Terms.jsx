import React from 'react';
import { Shield, CheckCircle, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-8 py-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 text-indigo-500/20">
            <Scale size={200} />
          </div>
          <div className="relative z-10 flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <Shield size={24} className="text-blue-300" />
            </div>
            <h1 className="text-3xl font-black tracking-wide">Terms & Conditions</h1>
          </div>
          <p className="relative z-10 text-indigo-200 max-w-2xl font-medium">
            Please read these terms and conditions carefully before using the APIC ProtoHub platform for your rapid prototyping and manufacturing needs.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12 space-y-8 text-slate-700">
          
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckCircle size={20} className="text-blue-600"/> 1. Acceptance of Terms
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              By accessing and using the APIC ProtoHub platform ("Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions, you must not use our services. The Platform acts as a bridge between Innovators (Users) and Facilities (Universities/Operators).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckCircle size={20} className="text-blue-600"/> 2. User Roles and Responsibilities
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-1">2.1 Innovators (Users)</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Innovators are responsible for ensuring the accuracy of CAD files and job specifications submitted. You agree not to submit requests for the manufacturing of illegal, hazardous, or weaponized materials.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-1">2.2 Universities (Operators)</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  Facilities operating as nodes within the APIC ecosystem reserve the right to accept or reject any booking proposal based on machine availability, material constraints, or policy violations.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckCircle size={20} className="text-blue-600"/> 3. Booking and Payment
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              All bookings are considered "Proposals" until explicitly approved by the respective University/Facility. 
              Once approved, the Innovator must complete payment to transition the job into the "Fabrication" phase. 
              Refunds are only issued if the Facility fails to deliver the prototype within the agreed SLAs.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckCircle size={20} className="text-blue-600"/> 4. Intellectual Property
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Innovators retain full ownership of the intellectual property (IP) contained within their CAD files. 
              Facilities agree to use these files solely for the purpose of fulfilling the requested booking and will securely delete the files upon job completion.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckCircle size={20} className="text-blue-600"/> 5. Liability and Disclaimer
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              The APIC platform is provided "as is". We are not liable for any manufacturing defects, delays caused by hardware failure at the facility level, or discrepancies in the final physical prototype compared to the digital CAD model.
            </p>
          </section>

          {/* Action Buttons */}
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row gap-4 justify-end">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Go Back
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
