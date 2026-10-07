import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Award, BookOpen, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-blue-50/40 min-h-[calc(100vh-4rem)]">
      
      {/* Subtle Bright Ambient Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-blue-100/60 via-indigo-100/40 to-transparent blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-blue-800">
              Full-Featured Student & Internship Platform
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-slate-900">
            Student Attendance, Reporting & Examination Portal
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A unified platform featuring Admin verification, live Clock-In/Clock-Out time tracking with pause logs,
            hourly daily work reports, auto-generated PDF offer letters and certificates, MCQ exams, and subject-allocated study materials.
          </p>
          
          <div className="flex justify-center gap-4 pt-3">
            <button
              onClick={() => navigate('/login')}
              className="group bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-blue-600/25 transition transform hover:-translate-y-0.5 flex items-center gap-2.5 text-sm"
            >
              <span>Sign In or Register</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Feature Cards matching the 3 Voice Parts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Part 1 Feature Card */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-300 transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Voice Note 1</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Clock-In & Daily Reports
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Students register with College, University, and Technology. Admin approves before login. Daily Clock-In timer, pause for lunch/water, and evening hourly task reporting.
            </p>
            <div className="pt-2 text-xs font-semibold text-blue-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Filtered by Month & Student</span>
            </div>
          </div>

          {/* Part 2 Feature Card */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-300 transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Voice Note 2</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                PDF Letters & MCQ Exams
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Auto-generates official <strong>Offer Letters</strong> and <strong>Completion Certificates</strong> in PDF format upon Admin approval. Plus an interactive category-wise MCQ testing engine.
            </p>
            <div className="pt-2 text-xs font-semibold text-amber-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Instant PDF & Score Evaluation</span>
            </div>
          </div>

          {/* Part 3 Feature Card */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Voice Note 3</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Allocated Study Notes
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Admin uploads study notes subject-wise. Students can <strong>only view</strong> notes for the specific subjects that have been allocated/assigned to them by the Admin.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Subject-Based Access Control</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
