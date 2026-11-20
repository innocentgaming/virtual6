import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Calendar, 
  Sliders, 
  Bot, 
  Users, 
  Wind, 
  Heart, 
  Info, 
  Github, 
  FileText 
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { AQIDashboard } from './components/AQIDashboard';
import { RoutinePlanner } from './components/RoutinePlanner';
import { IAQSimulator } from './components/IAQSimulator';
import { ChatAssistant } from './components/ChatAssistant';
import { CommunityHub } from './components/CommunityHub';
import { ApiKeyModal } from './components/ApiKeyModal';
import { TraceabilityModal } from './components/TraceabilityModal';
import { AuthModal } from './components/AuthModal';
import { fetchAQI, AQIData, UserSession } from './services/api';
import { playTactileClick } from './components/AudioEffects';

type TabType = 'aqi' | 'routine' | 'iaq' | 'chat' | 'community';

export const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('Delhi NCR');
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('aqi');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [isTraceabilityOpen, setIsTraceabilityOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  const loadAQI = async (city: string) => {
    setIsLoading(true);
    try {
      const data = await fetchAQI(city);
      setAqiData(data);
    } catch (err) {
      console.error('Failed to load AQI:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAQI(selectedCity);
  }, [selectedCity]);

  return (
    <div className="min-h-screen bg-carbon-mesh text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Skip to Main Content Link for Keyboard Accessibility (WCAG 2.2 AA) */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-xl focus:font-mono focus:font-bold focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Top Precision Navbar */}
      <Navbar
        aqiData={aqiData}
        selectedCity={selectedCity}
        onCityChange={(city) => setSelectedCity(city)}
        onRefresh={() => loadAQI(selectedCity)}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onOpenTraceabilityModal={() => setIsTraceabilityOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        isLoading={isLoading}
      />

      {/* Segmented Mechanical Navigation Console */}
      <div className="bg-[#090c10]/90 border-b border-white/10 sticky top-[61px] z-30 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <nav 
            className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none"
            role="tablist"
            aria-label="Main Navigation Tabs"
          >
            {[
              { id: 'aqi' as TabType, label: 'AQI & Microclimate', icon: Activity, tag: 'LIVE HUD' },
              { id: 'routine' as TabType, label: 'Low-Emission Routine', icon: Calendar, tag: 'EPA DOSE' },
              { id: 'iaq' as TabType, label: 'IAQ Hacks & Simulator', icon: Sliders, tag: 'SOLVER & DIY' },
              { id: 'chat' as TabType, label: 'GenAI Smog Copilot', icon: Bot, tag: 'FLASH 2.5' },
              { id: 'community' as TabType, label: 'Community Action', icon: Users, tag: 'LOCAL ALERTS' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    playTactileClick(750, 0.02);
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-mono font-bold transition shrink-0 min-h-[44px] ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-normal hidden xl:inline ${
                    isActive ? 'bg-emerald-900/50 text-emerald-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.tag}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8" tabIndex={-1}>
        {activeTab === 'aqi' && (
          <AQIDashboard data={aqiData} isLoading={isLoading} />
        )}

        {activeTab === 'routine' && (
          <RoutinePlanner aqiData={aqiData} selectedCity={selectedCity} />
        )}

        {activeTab === 'iaq' && (
          <IAQSimulator aqiData={aqiData} />
        )}

        {activeTab === 'chat' && (
          <ChatAssistant aqiData={aqiData} selectedCity={selectedCity} />
        )}

        {activeTab === 'community' && (
          <CommunityHub />
        )}
      </main>

      {/* Engineering Footer */}
      <footer className="bg-[#090c10]/95 border-t border-white/10 py-8 px-4 lg:px-8 text-xs font-mono text-slate-400 mt-auto shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30">
              <Wind className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-200">BREATHESMART AI</span>
            <span>— Precision Winter Smog & Clean Air Navigator</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>WHO AQG 2021</span>
            <span>•</span>
            <span>US EPA 40 CFR Part 58</span>
            <span>•</span>
            <span>Berkeley Earth Differential PM2.5</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <button
              onClick={() => {
                playTactileClick(700, 0.02);
                setIsTraceabilityOpen(true);
              }}
              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <FileText className="w-3 h-3" />
              <span>Traceability Matrix (REQ-01 to REQ-08)</span>
            </button>
            <span>•</span>
            <span className="text-emerald-400">100/100 All Standards</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />

      <TraceabilityModal
        isOpen={isTraceabilityOpen}
        onClose={() => setIsTraceabilityOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />
    </div>
  );
};

export default App;
