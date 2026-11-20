import React, { useState } from 'react';
import { 
  Wind, 
  AlertTriangle, 
  ShieldCheck, 
  Key, 
  MapPin, 
  RefreshCw, 
  FileText, 
  User,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { AQIData, UserSession } from '../services/api';
import { toggleSound, getSoundEnabled, playTactileClick } from './AudioEffects';

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
  const [soundOn, setSoundOn] = useState<boolean>(getSoundEnabled());

  const handleSoundToggle = () => {
    const nextState = toggleSound();
    setSoundOn(nextState);
    if (nextState) {
      playTactileClick(900, 0.05);
    }
  };

  const getBadgeColor = (level: string = '') => {
    switch (level) {
      case 'Good':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
      case 'Moderate':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
      case 'Unhealthy for Sensitive Groups':
        return 'bg-orange-950/80 text-orange-300 border-orange-500/50';
      case 'Unhealthy':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/50';
      case 'Very Unhealthy':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/50';
      case 'Hazardous':
      default:
        return 'bg-red-950/90 text-red-200 border-red-500/70 animate-pulse';
    }
  };

  return (
    <header className="bg-[#090c10]/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 px-4 lg:px-8 py-3 transition-all shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand with Scientific HUD identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <Wind className="w-5 h-5 text-slate-950" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-lg tracking-tight text-white">
                BREATHE<span className="text-emerald-400 font-extrabold">SMART</span>
              </span>
              <span className="text-[9px] font-mono uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                WINTER SMOG COPILOT
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">Atmospheric Air Navigation & Mitigation System</p>
          </div>
        </div>

        {/* Location & AQI Status Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {/* City selector */}
          <div className="flex items-center bg-slate-950/80 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-mono focus-within:ring-2 focus-within:ring-emerald-500">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 mr-1.5" aria-hidden="true" />
            <select
              id="city-select"
              aria-label="Select City for Air Quality Data"
              value={selectedCity}
              onChange={(e) => {
                playTactileClick(700, 0.02);
                onCityChange(e.target.value);
              }}
              className="bg-transparent text-slate-200 outline-none font-mono cursor-pointer text-xs"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => {
              playTactileClick(850, 0.02);
              onRefresh();
            }}
            disabled={isLoading}
            aria-label="Refresh Air Quality Data"
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-850 text-slate-300 border border-white/10 transition active:scale-95 disabled:opacity-50 min-h-[38px] min-w-[38px] flex items-center justify-center"
            title="Refresh AQI data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Real-time AQI Pill */}
          {aqiData && (
            <div 
              role="status" 
              aria-live="polite"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold shadow-sm ${getBadgeColor(aqiData.level)}`}
            >
              <span>AQI {aqiData.aqi}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
              <span className="text-[11px] font-medium hidden sm:inline">{aqiData.level}</span>
            </div>
          )}

          {/* Inversion Alert Pill if detected */}
          {aqiData?.isInversionLikely && (
            <div 
              role="alert"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono font-semibold"
              title="Ground-level winter smog inversion trapped by warm boundary air layer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" aria-hidden="true" />
              <span className="hidden sm:inline">Inversion Trapped</span>
            </div>
          )}

          {/* Audio Feedback Toggle */}
          <button
            onClick={handleSoundToggle}
            aria-label="Toggle tactile UI feedback audio"
            className={`p-2 rounded-xl border transition min-h-[38px] min-w-[38px] flex items-center justify-center ${
              soundOn 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title={soundOn ? 'Tactile Audio Feedback: ON' : 'Tactile Audio Feedback: MUTED'}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* Traceability Matrix Button */}
          <button
            onClick={() => {
              playTactileClick(750, 0.02);
              onOpenTraceabilityModal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-xs font-mono text-slate-300 border border-white/10 transition min-h-[38px]"
            title="View Problem-to-Feature Traceability Matrix"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
            <span className="hidden md:inline">Matrix</span>
          </button>

          {/* Custom API Key Button */}
          <button
            onClick={() => {
              playTactileClick(750, 0.02);
              onOpenKeyModal();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-xs font-mono text-slate-300 border border-white/10 transition min-h-[38px]"
            title="Configure Gemini Flash API Key"
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            <span className="hidden md:inline">Key</span>
          </button>

          {/* Auth / Account Button */}
          <button
            onClick={() => {
              playTactileClick(750, 0.02);
              onOpenAuthModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/40 transition min-h-[38px]"
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
