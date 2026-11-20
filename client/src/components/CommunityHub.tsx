import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  ThumbsUp, 
  PlusCircle, 
  CheckCircle2, 
  Flame, 
  Car, 
  Layers, 
  Wind, 
  ShieldCheck 
} from 'lucide-react';
import { 
  fetchCommunityReports, 
  submitCommunityReport, 
  upvoteReport, 
  CommunityReport 
} from '../services/api';
import { playTactileClick } from './AudioEffects';

export const CommunityHub: React.FC = () => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState<boolean>(false);

  // Form state
  const [reporterName, setReporterName] = useState<string>('');
  const [category, setCategory] = useState<CommunityReport['category']>('open_burning');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadReports = async () => {
    try {
      const data = await fetchCommunityReports();
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleUpvote = async (id: string) => {
    playTactileClick(850, 0.02);
    try {
      const updated = await upvoteReport(id);
      setReports(prev => prev.map(r => r.id === id ? updated : r));
    } catch (err) {
      console.error('Error upvoting report:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return;

    playTactileClick(900, 0.03);
    setIsSubmitting(true);
    try {
      const created = await submitCommunityReport({
        reporterName: reporterName.trim() || 'Neighbor',
        category,
        location,
        description
      });
      setReports(prev => [created, ...prev]);
      setShowForm(false);
      setLocation('');
      setDescription('');
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = filterCategory === 'all' 
    ? reports 
    : reports.filter(r => r.category === filterCategory);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'open_burning':
        return { label: 'Open Burning', color: 'bg-rose-950/80 text-rose-300 border-rose-500/40' };
      case 'carpool_offer':
        return { label: 'EV / Carpool Pod', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' };
      case 'traffic_congestion':
        return { label: 'Engine Idling Hotspot', color: 'bg-amber-950/80 text-amber-300 border-amber-500/40' };
      case 'dust_construction':
        return { label: 'Construction Dust', color: 'bg-blue-950/80 text-blue-300 border-blue-500/40' };
      default:
        return { label: 'Pollution Alert', color: 'bg-purple-950/80 text-purple-300 border-purple-500/40' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Community Action Header */}
      <section 
        aria-labelledby="community-heading"
        className="bg-[#090c10] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <h2 id="community-heading" className="text-sm font-mono uppercase tracking-wider font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Community Smog Defense & Clean Alternatives Network</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Crowdsource local pollution anomalies (trash burning, bus idling) and connect with neighborhood carpool clusters to clear our shared air.
            </p>
          </div>

          <button
            onClick={() => {
              playTactileClick(700, 0.02);
              setShowForm(!showForm);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/50"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{showForm ? 'Close Form' : 'Report Hotspot / Offer Carpool'}</span>
          </button>
        </div>

        {/* Report Submission Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 bg-slate-950/90 p-5 rounded-xl border border-white/10 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Submit Neighborhood Alert or Sustainable Action
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">Your Name or Alias</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Priya or Sector 4 Resident"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">Report Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="open_burning">Open Leaf / Waste Burning</option>
                  <option value="traffic_congestion">Vehicle Engine Idling Zone</option>
                  <option value="dust_construction">Uncovered Construction Debris</option>
                  <option value="carpool_offer">Clean Carpool / EV Ride Offer</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">Specific Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Park Gate 2, Ring Road Junction"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">Description & Details</label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the smoke source, timing, or carpool departure times..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-mono hover:bg-slate-800 border border-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Post Community Alert'}
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-400 mr-2">Filter by:</span>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'open_burning', label: '🔥 Open Burning' },
            { id: 'traffic_congestion', label: '🚗 Idling Zones' },
            { id: 'dust_construction', label: '🏗️ Dust Debris' },
            { id: 'carpool_offer', label: '🌱 Clean Carpools' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                playTactileClick(650, 0.01);
                setFilterCategory(f.id);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono transition border ${
                filterCategory === f.id
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 font-bold'
                  : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {filteredReports.map((report) => {
            const badge = getCategoryBadge(report.category);
            return (
              <div 
                key={report.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col justify-between transition hover:border-emerald-500/30 space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-mono font-bold text-white">
                    📍 {report.location}
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                    {report.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Reported by: <strong className="text-slate-300">{report.reporterName}</strong></span>

                  <button
                    onClick={() => handleUpvote(report.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition active:scale-95"
                    title="Confirm this incident is active"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{report.upvotes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
