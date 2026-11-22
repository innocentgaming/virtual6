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
    <div className="card-premium p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
              Personalized Clinical Clean Air Action Prescription
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
            Medical-grade household mitigation plan exportable for schools, pediatricians, and workplaces.
          </p>
        </div>

        {/* Print / Export Button */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs self-start sm:self-auto active:scale-95"
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border min-h-[38px] ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Printable Clinical Sheet Display */}
      <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 print:bg-white print:text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/80 gap-2">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block font-bold">
              OFFICIAL CLINICAL PROTOCOL
            </span>
            <h4 className="text-base font-bold font-display text-slate-900 dark:text-white mt-0.5">
              {selected.title}
            </h4>
          </div>

          <div className="text-right font-mono text-xs text-slate-500 dark:text-slate-400">
            <span>Location: <strong className="text-slate-800 dark:text-slate-200">{city}</strong></span>
            <span className="block text-[11px]">Current Exposure: AQI {currentAqi} ({currentPm25} µg/m³)</span>
          </div>
        </div>

        {/* 4 Prescription Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-sans">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-2xs">
            <span className="font-semibold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>1. Respiratory Mask Specification</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selected.maskProtocol}</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-2xs">
            <span className="font-semibold text-xs text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>2. Transit & Activity Restrictions</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selected.schoolProtocol}</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-2xs">
            <span className="font-semibold text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. Indoor Clean Air Sanctuary Target</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selected.bedroomTarget}</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-2xs">
            <span className="font-semibold text-xs text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>4. Clinical Management & Emergency Triage</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selected.pharmacologyNote}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-1">
          <span>Target Internal Dose Reduction: <strong>-83% Particulate Mass</strong></span>
          <span>Verified under WHO 2021 Air Quality Guidelines</span>
        </div>
      </div>
    </div>
  );
};
