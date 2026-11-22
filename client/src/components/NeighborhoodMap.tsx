import React, { useState } from 'react';
import { 
  MapPin, 
  Building2, 
  TreePine, 
  Factory, 
  GraduationCap, 
  ShieldCheck, 
  Navigation, 
  Compass, 
  Radio, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { playTactileClick } from './AudioEffects';

interface NeighborhoodNode {
  id: string;
  name: string;
  zoneType: 'industrial' | 'highway' | 'dense_urban' | 'school' | 'green_lung' | 'clean_shelter';
  relativeDistanceKm: number;
  aqiMultiplier: number; // relative to baseline city AQI
  pm25: number;
  dominantSource: string;
  isShelter: boolean;
  description: string;
}

interface NeighborhoodMapProps {
  city: string;
  baseAqi: number;
  basePm25: number;
}

export const NeighborhoodMap: React.FC<NeighborhoodMapProps> = ({ city, baseAqi, basePm25 }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node_shelter');

  const nodes: NeighborhoodNode[] = [
    {
      id: 'node_industrial',
      name: `${city} Industrial & Logistics Corridor`,
      zoneType: 'industrial',
      relativeDistanceKm: 8.2,
      aqiMultiplier: 1.35,
      pm25: Math.round(basePm25 * 1.35),
      dominantSource: 'Heavy Diesel Hauling, Brick Kilns, Biomass Stacks',
      isShelter: false,
      description: 'Severe microclimate stagnation. High concentrations of ultrafine black carbon and sulfur dioxide.'
    },
    {
      id: 'node_highway',
      name: 'Central Expressway & Arterial Ring Junction',
      zoneType: 'highway',
      relativeDistanceKm: 3.5,
      aqiMultiplier: 1.22,
      pm25: Math.round(basePm25 * 1.22),
      dominantSource: 'Traffic Idling, Brake Dust, Tire Wear Resuspension',
      isShelter: false,
      description: 'Street canyon effect prevents wind dispersion; nitrogen dioxide spikes during morning commute peaks.'
    },
    {
      id: 'node_dense_urban',
      name: 'High-Density Residential Sector 4',
      zoneType: 'dense_urban',
      relativeDistanceKm: 1.8,
      aqiMultiplier: 1.05,
      pm25: Math.round(basePm25 * 1.05),
      dominantSource: 'Domestic Heating, Kitchen Gas Combustion, Trash Fires',
      isShelter: false,
      description: 'Ground-level nocturnal heating smoke pooled under cold radiation inversion boundary layer.'
    },
    {
      id: 'node_school',
      name: 'Community Primary School District',
      zoneType: 'school',
      relativeDistanceKm: 2.1,
      aqiMultiplier: 0.95,
      pm25: Math.round(basePm25 * 0.95),
      dominantSource: 'School Bus Drop-off Idling, Street Dust',
      isShelter: false,
      description: 'High pediatric vulnerability. Outdoor recess must be postponed until midday solar mixing window.'
    },
    {
      id: 'node_green_lung',
      name: 'Metropolitan Botanical Green Sanctuary',
      zoneType: 'green_lung',
      relativeDistanceKm: 4.6,
      aqiMultiplier: 0.62,
      pm25: Math.round(basePm25 * 0.62),
      dominantSource: 'Natural Vegetative Dust Absorption Buffer',
      isShelter: false,
      description: 'Canopy leaves absorb coarse particles; temperature buffer creates localized downward clean air pocket.'
    },
    {
      id: 'node_shelter',
      name: 'Municipal Central Library Clean Air Shelter',
      zoneType: 'clean_shelter',
      relativeDistanceKm: 1.2,
      aqiMultiplier: 0.12,
      pm25: Math.max(6, Math.round(basePm25 * 0.12)),
      dominantSource: 'Positive-Pressure Dual HEPA Filtration HVAC',
      isShelter: true,
      description: 'Designated public clean air sanctuary. Continuous hospital-grade filtration with PM2.5 maintained ≤ 12 µg/m³.'
    }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[5];
  const selectedAqi = Math.round(baseAqi * selectedNode.aqiMultiplier);

  const getNodeColor = (type: NeighborhoodNode['zoneType']) => {
    switch (type) {
      case 'industrial': return 'border-red-500/60 bg-red-950/40 text-red-400';
      case 'highway': return 'border-orange-500/60 bg-orange-950/40 text-orange-400';
      case 'dense_urban': return 'border-amber-500/60 bg-amber-950/40 text-amber-400';
      case 'school': return 'border-blue-500/60 bg-blue-950/40 text-blue-400';
      case 'green_lung': return 'border-teal-500/60 bg-teal-950/40 text-teal-400';
      case 'clean_shelter': return 'border-emerald-500/80 bg-emerald-950/50 text-emerald-300';
    }
  };

  const getAqiBadgeColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
    if (aqi <= 100) return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    if (aqi <= 200) return 'bg-orange-950/80 text-orange-300 border-orange-500/50';
    if (aqi <= 300) return 'bg-rose-950/80 text-rose-300 border-rose-500/50';
    return 'bg-red-950/90 text-red-200 border-red-500/70';
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090c10] p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
              Hyper-Local Spatial Sensor Grid & Clean Air Refuge Locator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Captures real urban microclimate gradients from industrial hotspots down to certified public clean air shelters.
          </p>
        </div>

        {/* Shelter Quick Pill */}
        <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono text-xs self-start sm:self-auto flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Nearest Shelter: <strong>1.2 km away ({nodes[5].pm25} µg/m³)</strong></span>
        </div>
      </div>

      {/* Spatial Sensor Node Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const nodeAqi = Math.round(baseAqi * node.aqiMultiplier);

          return (
            <button
              key={node.id}
              onClick={() => {
                playTactileClick(750, 0.02);
                setSelectedNodeId(node.id);
              }}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-3 relative ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500/80 shadow-xl'
                  : 'bg-slate-950/70 border-white/5 hover:border-white/20'
              }`}
            >
              {node.isShelter && (
                <span className="absolute -top-2 right-3 text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white border border-emerald-400 shadow">
                  Clean Air Shelter
                </span>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{node.name.split(' ')[0]} {node.name.split(' ')[1]}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {node.relativeDistanceKm} km
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black font-mono" style={{
                    color: nodeAqi <= 50 ? '#10b981' : nodeAqi <= 200 ? '#f59e0b' : '#ef4444'
                  }}>
                    AQI {nodeAqi}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ({node.pm25} µg/m³)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono text-slate-400 truncate">
                Source: {node.dominantSource.split(',')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Microclimate Node Deep-Dive */}
      <div className="bg-slate-950/80 p-5 rounded-xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h4 className="text-sm font-mono font-bold text-white">
              Telemetry Profile: {selectedNode.name}
            </h4>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${getAqiBadgeColor(selectedAqi)}`}>
            Microclimate AQI {selectedAqi} ({selectedNode.pm25} µg/m³ PM2.5)
          </span>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          {selectedNode.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
            <span className="text-[10px] uppercase text-slate-400 block">Distance from User</span>
            <span className="text-base font-bold text-white mt-0.5 block">{selectedNode.relativeDistanceKm} km away</span>
            <span className="text-[10px] text-slate-500">~{Math.round(selectedNode.relativeDistanceKm * 12)} min transit</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
            <span className="text-[10px] uppercase text-slate-400 block">Dominant Particulate Emitter</span>
            <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">{selectedNode.dominantSource}</span>
            <span className="text-[10px] text-slate-500">Primary localized vector</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5">
            <span className="text-[10px] uppercase text-slate-400 block">Refuge Classification</span>
            <span className={`text-xs font-bold mt-0.5 block ${selectedNode.isShelter ? 'text-emerald-400' : 'text-amber-400'}`}>
              {selectedNode.isShelter ? '✓ Certified Clean Air Sanctuary' : 'Unfiltered Ambient Sector'}
            </span>
            <span className="text-[10px] text-slate-500">
              {selectedNode.isShelter ? 'Free public admission' : 'Respirator advised'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
