import React from 'react';
import { 
  Wind, 
  AlertTriangle, 
  ShieldCheck, 
  Key, 
  MapPin, 
  RefreshCw, 
  FileText, 
  User 
} from 'lucide-react';
import { AQIData, UserSession } from '../services/api';

interface NavbarProps {
  aqiData: AQIData | null;
  selectedCity: string;
  onCityChange: (city: string) => void;
  onRefresh: () => void;
  onOpenKeyModal: () => void;
  onOpenTraceabilityModal: () => void;
  onOpenAuthModal: () => void;
  currentUser: UserSession | null;
  isLoading: boolean;
}

export const CITIES = [
  'Delhi NCR',
  'Beijing',
  'Lahore',
  'Salt Lake City',
  'London',
  'Milan',
  'Kathmandu',
  'New York',
  'Mumbai'
];

export const Navbar: React.FC<NavbarProps> = ({
  aqiData,
  selectedCity,
  onCityChange,
  onRefresh,
  onOpenKeyModal,
  onOpenTraceabilityModal,
  onOpenAuthModal,
  currentUser,
  isLoading
}) => {
  const getBadgeColor = (level: string = '') => {
    switch (level) {
      case 'Good':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Moderate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Unhealthy for Sensitive Groups':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'Unhealthy':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'Very Unhealthy':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Hazardous':
      default:
        return 'bg-red-950/80 text-red-300 border-red-600 animate-soft-pulse';
    }
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <Wind className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                BreatheSmart<span className="text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Winter Smog Copilot
              </span>
            </div>
            <p className="text-xs text-slate-400">Family & Community Clean Air Companion</p>
          </div>
        </div>

        {/* Location & AQI Status Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {/* City selector */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs md:text-sm focus-within:ring-2 focus-within:ring-emerald-500">
            <MapPin className="w-4 h-4 text-emerald-400 mr-1.5" aria-hidden="true" />
            <select
              id="city-select"
              aria-label="Select City for Air Quality Data"
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
              className="bg-transparent text-slate-200 outline-none font-medium cursor-pointer text-xs md:text-sm"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-slate-800 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh Air Quality Data"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 disabled:opacity-50 min-h-[38px] min-w-[38px] flex items-center justify-center"
            title="Refresh AQI data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Real-time AQI Pill */}
          {aqiData && (
            <div 
              role="status" 
              aria-live="polite"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs md:text-sm font-semibold shadow-sm ${getBadgeColor(aqiData.level)}`}
            >
              <span>AQI {aqiData.aqi}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              <span className="text-xs font-medium hidden sm:inline">{aqiData.level}</span>
            </div>
          )}

          {/* Inversion Alert Pill if detected */}
          {aqiData?.isInversionLikely && (
            <div 
              role="alert"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-medium"
              title="Ground-level winter smog inversion trapped by warm air layer aloft"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" aria-hidden="true" />
              <span className="hidden sm:inline">Inversion Active</span>
            </div>
          )}

          {/* Traceability Matrix Button */}
          <button
            onClick={onOpenTraceabilityModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition min-h-[38px]"
            title="View Problem-to-Feature Traceability Matrix"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
            <span className="hidden md:inline">Traceability</span>
          </button>

          {/* Custom API Key Button */}
          <button
            onClick={onOpenKeyModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition min-h-[38px]"
            title="Configure Gemini API Key (Optional)"
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span className="hidden md:inline">AI Key</span>
          </button>

          {/* Auth / Account Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-xs font-semibold text-emerald-300 border border-emerald-500/40 transition min-h-[38px]"
            title="User Account & Privacy"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span>{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
