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
  Users,
  Info,
  TrendingUp
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
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: Activity },
  { id: 'air-quality', label: 'Air Quality', shortLabel: 'Air Quality', icon: Layers },
  { id: 'health', label: 'Health Insights', shortLabel: 'Health', icon: HeartPulse },
  { id: 'trends', label: 'Trends / Analytics', shortLabel: 'Trends', icon: TrendingUp },
  { id: 'routine', label: 'Routine Planner', shortLabel: 'Routine', icon: Calendar },
  { id: 'indoor-air', label: 'Indoor Air', shortLabel: 'Indoor Air', icon: Home },
  { id: 'ai-assistant', label: 'AI Copilot', shortLabel: 'AI Copilot', icon: Bot },
  { id: 'community', label: 'Community', shortLabel: 'Community', icon: Users },
  { id: 'about', label: 'About', shortLabel: 'About', icon: Info }
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
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 transition-colors duration-200 shadow-xs">
      {/* Primary Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4 min-w-0">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2.5 shrink-0 min-w-0">
            <button
              onClick={() => {
                playTactileClick(800, 0.02);
                onTabChange('dashboard');
              }}
              className="flex items-center gap-2 text-left group min-w-0"
              aria-label="Go to BreatheSmart AI Dashboard"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Wind className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-display font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white block leading-tight truncate">
                  Breathe<span className="text-emerald-600 dark:text-emerald-400">Smart</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 dark:text-slate-400 block tracking-wider uppercase truncate">
                  Environmental Intelligence
                </span>
              </div>
            </button>
          </div>

          {/* Full Navigation Links (Large Desktop: 1440px and above) */}
          <nav 
            className="hidden 2xl:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0" 
            role="tablist"
          >
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

          {/* Right Action Tools: City Selector, Refresh, Audio, Theme, Auth, Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* City Selector (Hidden on small mobile, visible on sm+) */}
            <div className="hidden md:flex items-center bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs focus-within:ring-2 focus-within:ring-emerald-500 min-h-[38px] shrink-0">
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

            {/* Refresh Button (Visible on sm+) */}
            <button
              onClick={() => {
                playTactileClick(850, 0.02);
                onRefresh();
              }}
              disabled={isLoading}
              aria-label="Refresh Air Quality Data"
              className="hidden md:flex p-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition active:scale-95 disabled:opacity-50 min-h-[38px] min-w-[38px] items-center justify-center shrink-0"
              title="Refresh live environmental telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* AQI Live Pill Badge */}
            {aqiData && (
              <div 
                role="status" 
                aria-live="polite"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold shadow-2xs shrink-0 min-h-[34px] ${getAQIBadgeClass(aqiData.aqi)}`}
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
              className="p-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            {/* Audio Feedback Toggle (Laptops & Desktops) */}
            <button
              onClick={handleSoundToggle}
              aria-label="Toggle tactile UI feedback audio"
              className={`p-2 rounded-xl border transition min-h-[38px] min-w-[38px] hidden xl:flex items-center justify-center shrink-0 ${
                soundOn 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' 
                  : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
              title={soundOn ? 'Tactile Sound: Active' : 'Tactile Sound: Muted'}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Ambient Soundscape Toggle */}
            <button
              onClick={handleAmbientToggle}
              aria-label="Toggle clean air brown noise soundscape"
              className={`p-2 rounded-xl border transition min-h-[38px] min-w-[38px] hidden xl:flex items-center justify-center shrink-0 ${
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
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition min-h-[38px] shrink-0"
              title="User Account & Preferences"
            >
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline">{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
            </button>

            {/* Mobile / Tablet Menu Hamburger (Visible on < 2xl) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="2xl:hidden p-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Bar: City Selector & Controls (Below 768px) */}
      <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs flex-1 min-w-0 min-h-[38px]">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mr-1.5 shrink-0" />
          <select
            id="mobile-city-select"
            aria-label="Select City for Air Quality Data"
            value={selectedCity}
            onChange={(e) => {
              playTactileClick(700, 0.02);
              onCityChange(e.target.value);
            }}
            className="bg-transparent text-slate-800 dark:text-slate-200 outline-none font-medium cursor-pointer text-xs w-full"
          >
            {CITIES.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            playTactileClick(850, 0.02);
            onRefresh();
          }}
          disabled={isLoading}
          aria-label="Refresh Air Quality Data"
          className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition active:scale-95 disabled:opacity-50 min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
          title="Refresh telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        <button
          onClick={() => {
            playTactileClick(750, 0.02);
            onOpenAuthModal();
          }}
          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
          title="User Account"
        >
          <User className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tablet & Laptop Secondary Navigation Strip (768px to 1439px) */}
      <div className="hidden md:block 2xl:hidden border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 max-w-7xl mx-auto">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 min-h-[34px] shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessible Mobile Drawer Menu (When hamburger clicked on mobile/tablet/laptop) */}
      {mobileMenuOpen && (
        <div className="2xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-4 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 flex-wrap gap-3">
            <button
              onClick={() => {
                onOpenTraceabilityModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 py-2 font-medium hover:text-emerald-600 min-h-[44px]"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Traceability Matrix</span>
            </button>
            <button
              onClick={() => {
                onOpenKeyModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 py-2 font-medium hover:text-emerald-600 min-h-[44px]"
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span>Gemini Key</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSoundToggle}
                className="flex items-center gap-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs min-h-[44px]"
              >
                {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                <span>Sound</span>
              </button>
              <button
                onClick={handleAmbientToggle}
                className="flex items-center gap-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs min-h-[44px]"
              >
                <Sparkles className={`w-3.5 h-3.5 ${ambientOn ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>Ambient</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
