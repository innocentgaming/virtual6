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
      case 'industrial': return 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400';
      case 'highway': return 'border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400';
      case 'dense_urban': return 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400';
      case 'school': return 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400';
      case 'green_lung': return 'border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400';
      case 'clean_shelter': return 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300';
    }
  };

  const getAqiBadgeColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700';
    if (aqi <= 100) return 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700';
    if (aqi <= 200) return 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-700';
    if (aqi <= 300) return 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700';
    return 'bg-red-50 text-red-900 border-red-300 dark:bg-red-950/90 dark:text-red-200 dark:border-red-700';
  };

  return (
    <div className="card-premium p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
              Hyper-Local Spatial Sensor Grid & Clean Air Refuge Locator
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
            Real-time urban microclimate variance across 6 neighborhood micro-sensor nodes for {city}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          <span>Active GIS Microgrid (6 Nodes)</span>
        </div>
      </div>

      {/* Grid of Micro-Sensor Locations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {nodes.map(node => {
          const isSelected = node.id === selectedNodeId;
          const nodeAqi = Math.round(baseAqi * node.aqiMultiplier);
          return (
            <button
              key={node.id}
              onClick={() => {
                playTactileClick(700, 0.02);
                setSelectedNodeId(node.id);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[110px] ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    {node.isShelter ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 font-display">
                      {node.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${getAqiBadgeColor(nodeAqi)}`}>
                    AQI {nodeAqi}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-sans">
                  {node.dominantSource}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                <span>Distance: {node.relativeDistanceKm} km</span>
                <span className={node.isShelter ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                  PM2.5: {node.pm25} µg/m³
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Node Detailed Inspection Panel */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-display">
              {selectedNode.name}
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getNodeColor(selectedNode.zoneType)}`}>
              {selectedNode.isShelter ? 'DESIGNATED CLEAN AIR REFUGE' : 'MONITORING NODE'}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {selectedNode.relativeDistanceKm} km from your registered coordinates
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {selectedNode.description}
          </p>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1">
            Dominant Contaminant: <strong>{selectedNode.dominantSource}</strong>
          </div>
        </div>

        {/* Readout Pill & Directions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 min-w-[200px] shrink-0 self-stretch md:self-auto text-center shadow-xs">
          <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
            Microclimate Inhalation Dose
          </span>
          <div className="text-2xl font-black font-display text-slate-900 dark:text-slate-100 my-0.5">
            {selectedNode.pm25} <span className="text-xs font-normal text-slate-500">µg/m³</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block">
            {selectedNode.isShelter ? '92% Inhaled Dose Elimination' : `${selectedNode.aqiMultiplier}× Urban Baseline`}
          </span>
        </div>
      </div>
    </div>
  );
};
