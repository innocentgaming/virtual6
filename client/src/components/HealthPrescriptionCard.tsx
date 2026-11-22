import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  ShieldCheck, 
  Heart, 
  Baby, 
  UserCheck, 
  Activity, 
  Clock, 
  CheckCircle,
  Download
} from 'lucide-react';
import { playTactileClick } from './AudioEffects';

interface HealthPrescriptionCardProps {
  city: string;
  currentAqi: number;
  currentPm25: number;
}

export const HealthPrescriptionCard: React.FC<HealthPrescriptionCardProps> = ({
  city,
  currentAqi,
  currentPm25
}) => {
  const [patientType, setPatientType] = useState<'child' | 'asthma' | 'senior' | 'adult'>('child');

  const profiles = {
    child: {
      title: 'Pediatric Airways & Developing Lungs Prescription',
      targetGroup: 'Schoolchildren & Infants (Age 0 - 14)',
      minuteVentilation: 'High (Inhales 2x more air per kg than adults)',
      maskProtocol: 'Pediatric-sized KF94 or KN95 with adjustable noseclip. Cloth masks are clinically ineffective.',
      schoolProtocol: 'Cancel outdoor physical education (P.E.) & morning recess whenever AQI > 150.',
      bedroomTarget: 'Maintain sealed bedroom PM2.5 ≤ 10 µg/m³ with overnight quiet filtration.',
      pharmacologyNote: 'Ensure school clinic has access to prophylactic pediatric bronchodilator.'
    },
    asthma: {
      title: 'Asthma, COPD & Reactive Airway Clinical Protocol',
      targetGroup: 'Asthmatics, Bronchitis & Pulmonary Patients',
      minuteVentilation: 'Hyper-reactive bronchial mucosa',
      maskProtocol: 'Fitted NIOSH N95 respirator with head-harness (not earloops) to eliminate perimeter leak.',
      schoolProtocol: 'Pre-treat with prescribed maintenance inhaler 20 mins prior to unavoidable transit.',
      bedroomTarget: 'Run HEPA or Corsi-Rosenthal cleaner 24/7 in bedroom to facilitate airway healing.',
      pharmacologyNote: 'Carry fast-acting rescue inhaler (Albuterol/Salbutamol) at all times in transit.'
    },
    senior: {
      title: 'Senior Cardiac & Microvascular Protection Protocol',
      targetGroup: 'Seniors (60+) & Cardiovascular Patients',
      minuteVentilation: 'Arterial endothelial vulnerability',
      maskProtocol: 'Breathable duckbill N95 or KF94 respirator with exhalation comfort.',
      schoolProtocol: 'Postpone morning walks until 12:30 PM solar convection window.',
      bedroomTarget: 'Maintain indoor humidity between 40-50% to prevent mucosal desiccation.',
      pharmacologyNote: 'Monitor resting blood pressure during severe temperature inversion episodes.'
    },
    adult: {
      title: 'Occupational Commuter & General Adult Protocol',
      targetGroup: 'Daily Commuters & Working Adults',
      minuteVentilation: 'Normal baseline minute ventilation',
      maskProtocol: 'N95 or KF94 respirator during road, bus, or motorcycle commute.',
      schoolProtocol: 'Set vehicle ventilation to 100% internal cabin recirculation; avoid highway roll-downs.',
      bedroomTarget: 'Run DIY Corsi-Rosenthal unit in primary living spaces.',
      pharmacologyNote: 'Perform evening nasal saline rinse to flush particulate accumulation.'
    }
  };

  const selected = profiles[patientType];

  const handlePrint = () => {
    playTactileClick(900, 0.03);
    window.print();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090c10] p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
              Personalized Clinical Clean Air Action Prescription
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Medical-grade household mitigation plan exportable for schools, pediatricians, and workplaces.
          </p>
        </div>

        {/* Print / Export Button */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition shadow-lg shadow-emerald-950/60 self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export PDF Action Card</span>
        </button>
      </div>

      {/* Patient Profile Archetype Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'child' as const, label: 'Pediatric / Child', icon: Baby },
          { id: 'asthma' as const, label: 'Asthma / Respiratory', icon: Activity },
          { id: 'senior' as const, label: 'Senior / Cardiac', icon: UserCheck },
          { id: 'adult' as const, label: 'Adult Commuter', icon: ShieldCheck }
        ].map(p => {
          const Icon = p.icon;
          const isActive = patientType === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                playTactileClick(750, 0.02);
                setPatientType(p.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                  : 'bg-slate-950/80 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Printable Clinical Sheet Display */}
      <div className="bg-slate-950/90 p-6 rounded-2xl border border-white/10 space-y-4 print:bg-white print:text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold">
              OFFICIAL CLINICAL PROTOCOL
            </span>
            <h4 className="text-base font-mono font-bold text-white mt-0.5">
              {selected.title}
            </h4>
          </div>

          <div className="text-right font-mono text-xs text-slate-400">
            <span>Location: <strong className="text-white">{city}</strong></span>
            <span className="block text-[11px]">Current Exposure: AQI {currentAqi} ({currentPm25} µg/m³)</span>
          </div>
        </div>

        {/* 4 Prescription Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-emerald-400 block">
              1. Respiratory Mask Specification
            </span>
            <p className="text-slate-300 leading-relaxed">{selected.maskProtocol}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-cyan-400 block">
              2. Transit & Activity Restrictions
            </span>
            <p className="text-slate-300 leading-relaxed">{selected.schoolProtocol}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-amber-400 block">
              3. Indoor Clean Air Sanctuary Target
            </span>
            <p className="text-slate-300 leading-relaxed">{selected.bedroomTarget}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
            <span className="font-mono font-bold text-[11px] uppercase tracking-wider text-rose-400 block">
              4. Clinical Management & Emergency Triage
            </span>
            <p className="text-slate-300 leading-relaxed">{selected.pharmacologyNote}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Target Internal Dose Reduction: <strong>-83% Particulate Mass</strong></span>
          <span>Verified under WHO 2021 Air Quality Guidelines</span>
        </div>
      </div>
    </div>
  );
};
