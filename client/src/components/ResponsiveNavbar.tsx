import React, { useState } from 'react';
import { 
  Wind, 
  MapPin, 
  RefreshCw, 
  FileText, 
  Key, 
  User, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Activity,
  Layers,
  HeartPulse,
  Calendar,
  Home,
  Bot,
  Users
} from 'lucide-react';
import { AQIData, UserSession } from '../services/api';
import { toggleSound, getSoundEnabled, playTactileClick, toggleAmbientSoundscape, getAmbientPlaying } from './AudioEffects';

export interface NavTabItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_TABS: NavTabItem[] = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Overview', icon: Activity },
  { id: 'air-quality', label: 'Air Quality', shortLabel: 'Telemetry', icon: Layers },
  { id: 'health', label: 'Health Insights', shortLabel: 'Clinical', icon: HeartPulse },
  { id: 'routine', label: 'Routine Planner', shortLabel: 'Planner', icon: Calendar },
  { id: 'indoor-air', label: 'Indoor Air', shortLabel: 'IAQ & DIY', icon: Home },
  { id: 'ai-assistant', label: 'AI Assistant', shortLabel: 'Copilot', icon: Bot },
  { id: 'community', label: 'Community', shortLabel: 'Action', icon: Users },
];

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

interface ResponsiveNavbarProps {
  aqiData: AQIData | null;
  selectedCity: string;
  onCityChange: (city: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenKeyModal: () => void;
  onOpenTraceabilityModal: () => void;
  onOpenAuthModal: () => void;
  currentUser: UserSession | null;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const ResponsiveNavbar: React.FC<ResponsiveNavbarProps> = ({
  aqiData,
  selectedCity,
  onCityChange,
  onRefresh,
  isLoading,
  activeTab,
  onTabChange,
  onOpenKeyModal,
  onOpenTraceabilityModal,
  onOpenAuthModal,
  currentUser,
  isDarkMode,
  onToggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState<boolean>(getSoundEnabled());
  const [ambientOn, setAmbientOn] = useState<boolean>(getAmbientPlaying());

  const handleSoundToggle = () => {
    const nextState = toggleSound();
    setSoundOn(nextState);
    if (nextState) playTactileClick(900, 0.05);
  };

  const handleAmbientToggle = () => {
    const nextState = toggleAmbientSoundscape();
    setAmbientOn(nextState);
    playTactileClick(nextState ? 800 : 500, 0.03);
  };

  const getAQIBadgeClass = (aqi: number) => {
    if (aqi <= 50) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    if (aqi <= 100) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    if (aqi <= 150) return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
    if (aqi <= 200) return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    if (aqi <= 300) return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    return 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-200 dark:border-red-800 animate-pulse';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 transition-colors duration-200 shadow-xs">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playTactileClick(800, 0.02);
                onTabChange('dashboard');
              }}
              className="flex items-center gap-2.5 text-left group"
              aria-label="Go to BreatheSmart AI Dashboard"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white block leading-tight">
                  Breathe<span className="text-emerald-600 dark:text-emerald-400">Smart</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block tracking-wide">
                  ENVIRONMENTAL INTELLIGENCE
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60" role="tablist">
            {NAV_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    playTactileClick(750, 0.02);
                    onTabChange(tab.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 min-h-[34px] ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: City Selector, Refresh, Audio, Theme, Auth */}
          <div className="flex items-center gap-2">
            {/* City Selector */}
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs focus-within:ring-2 focus-within:ring-emerald-500 min-h-[38px]">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1.5 shrink-0" />
              <select
                id="city-select"
                aria-label="Select City for Air Quality Data"
                value={selectedCity}
                onChange={(e) => {
                  playTactileClick(700, 0.02);
                  onCityChange(e.target.value);
                }}
                className="bg-transparent text-slate-800 dark:text-slate-200 outline-none font-medium cursor-pointer text-xs"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => {
                playTactileClick(850, 0.02);
                onRefresh();
              }}
              disabled={isLoading}
              aria-label="Refresh Air Quality Data"
              className="p-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition active:scale-95 disabled:opacity-50 min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Refresh live environmental telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* AQI Live Pill Badge */}
            {aqiData && (
              <div 
                role="status" 
                aria-live="polite"
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold shadow-2xs ${getAQIBadgeClass(aqiData.aqi)}`}
              >
                <span className="font-bold">AQI {aqiData.aqi}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                <span className="hidden xl:inline">{aqiData.level}</span>
              </div>
            )}

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle Light and Dark Mode"
              className="p-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition min-h-[38px] min-w-[38px] flex items-center justify-center"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            {/* Audio Feedback Toggle */}
            <button
              onClick={handleSoundToggle}
              aria-label="Toggle tactile UI feedback audio"
              className={`p-2 rounded-xl border transition min-h-[38px] min-w-[38px] hidden md:flex items-center justify-center ${
                soundOn 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
              title={soundOn ? 'Tactile Sound: Active' : 'Tactile Sound: Muted'}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Brown Noise Ambient Soundscape */}
            <button
              onClick={handleAmbientToggle}
              aria-label="Toggle procedural clean air brown noise soundscape"
              className={`p-2 rounded-xl border transition min-h-[38px] min-w-[38px] hidden md:flex items-center justify-center ${
                ambientOn 
                  ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 animate-pulse' 
                  : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
              title={ambientOn ? 'Clean Air Soundscape: ACTIVE' : 'Clean Air Soundscape: OFF'}
            >
              <Sparkles className={`w-3.5 h-3.5 ${ambientOn ? 'text-teal-600 dark:text-teal-400' : ''}`} />
            </button>

            {/* User Auth Button */}
            <button
              onClick={() => {
                playTactileClick(750, 0.02);
                onOpenAuthModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition min-h-[38px]"
              title="User Account & Preferences"
            >
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Strip on Tablets/Medium Screens */}
      <div className="lg:hidden border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 px-4 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5">
          {NAV_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  playTactileClick(750, 0.02);
                  onTabChange(tab.id);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition min-h-[34px] ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.shortLabel || tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer (When hamburger clicked) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-4 shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            {NAV_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playTactileClick(750, 0.02);
                    onTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold text-left transition min-h-[44px] ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => {
                onOpenTraceabilityModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 py-2 font-medium hover:text-emerald-600"
            >
              <FileText className="w-4 h-4" />
              <span>Traceability Matrix</span>
            </button>
            <button
              onClick={() => {
                onOpenKeyModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 py-2 font-medium hover:text-emerald-600"
            >
              <Key className="w-4 h-4" />
              <span>Gemini Key</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
