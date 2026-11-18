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
        return { label: 'Open Burning', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'carpool_offer':
        return { label: 'EV / Carpool Pod', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'traffic_congestion':
        return { label: 'Engine Idling Hotspot', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'dust_construction':
        return { label: 'Construction Dust', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      default:
        return { label: 'Pollution Alert', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    }
  };

  return (
    <div className="space-y-8">
      {/* Community Action Header */}
      <section 
        aria-labelledby="community-heading"
        className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
          <div>
            <h2 id="community-heading" className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Community Smog Defense & Clean Alternatives Network</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Crowdsource local pollution anomalies (trash burning, bus idling) and connect with neighborhood carpool clusters to clear our shared air.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showForm ? 'Close Form' : 'Report Hotspot / Offer Carpool'}</span>
          </button>
        </div>

        {/* Report Submission Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 bg-slate-900/80 p-5 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Submit Neighborhood Alert or Sustainable Action
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Your Name or Alias</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Priya or Sector 4 Resident"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Report Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="open_burning">Open Leaf / Waste Burning</option>
                  <option value="traffic_congestion">Vehicle Engine Idling Zone</option>
                  <option value="dust_construction">Uncovered Construction Debris</option>
                  <option value="carpool_offer">Clean Carpool / EV Ride Offer</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Specific Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Park Gate 2, Ring Road Junction"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Description & Details</label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the smoke source, timing, or carpool departure times..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Post Community Alert'}
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <span className="text-xs font-semibold text-slate-400 mr-2">Filter by:</span>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'open_burning', label: '🔥 Open Burning' },
            { id: 'traffic_congestion', label: '🚗 Idling Zones' },
            { id: 'dust_construction', label: '🏗️ Dust Debris' },
            { id: 'carpool_offer', label: '🌱 Clean Carpools' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition border ${
                filterCategory === f.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-900/40 text-slate-400 border-slate-700 hover:border-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reports Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {filteredReports.map(report => {
            const badge = getCategoryBadge(report.category);
            return (
              <div 
                key={report.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{report.location}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{report.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Reported by: <strong className="text-slate-300">{report.reporterName}</strong></span>

                  <button
                    onClick={() => handleUpvote(report.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 border border-slate-700"
                    title="Verify / Upvote report"
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

      {/* Sustainable Alternatives Matrix */}
      <section 
        aria-labelledby="alternatives-heading"
        className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl p-6 shadow-xl"
      >
        <div className="mb-6">
          <h3 id="alternatives-heading" className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Sustainable Alternatives: The Clean Transition Matrix</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Replace high-emission winter practices with accessible, high-efficiency solutions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/60 text-slate-300">
                <th className="p-3 font-bold uppercase tracking-wider">Lifestyle Domain</th>
                <th className="p-3 font-bold uppercase tracking-wider text-rose-400">High-Smog Choice</th>
                <th className="p-3 font-bold uppercase tracking-wider text-emerald-400">AeroShield Clean Alternative</th>
                <th className="p-3 font-bold uppercase tracking-wider">Direct Impact & Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Space Heating</td>
                <td className="p-3 text-rose-300">Fireplace / Wood / Coal Chulha</td>
                <td className="p-3 text-emerald-300 font-medium">Inverter Heat Pump or Ceramic Infrared Radiator</td>
                <td className="p-3 text-slate-400">Eliminates 3.2 kg CO2e/day + zero indoor toxic benzene & PAHs</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Cooking Method</td>
                <td className="p-3 text-rose-300">Unvented Gas Cooktop / Open Frying</td>
                <td className="p-3 text-emerald-300 font-medium">Induction Cooktop + Covered Pots + Range Hood</td>
                <td className="p-3 text-slate-400">Zero indoor NO2 gas spikes + 85% less particulate vapor</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Work Commute</td>
                <td className="p-3 text-rose-300">Solo Combustion Vehicle / AC pulling outside air</td>
                <td className="p-3 text-emerald-300 font-medium">EV Carpool / Metro + Internal Recirculation Mode</td>
                <td className="p-3 text-slate-400">Saves 185g CO2 per km + avoids 70% in-cabin exhaust buildup</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Face Protection</td>
                <td className="p-3 text-rose-300">Cloth Bandana / Loose Surgical Mask</td>
                <td className="p-3 text-emerald-300 font-medium">Fitted N95 / KF94 Respirator with Nose Wire</td>
                <td className="p-3 text-slate-400">Traps 95% of fine PM2.5 (vs only 20-30% for cloth masks)</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 font-bold text-white">Home Cleaning</td>
                <td className="p-3 text-rose-300">Dry Broom Sweeping & Feather Duster</td>
                <td className="p-3 text-emerald-300 font-medium">Microfiber Damp Mop & HEPA-filtered vacuum</td>
                <td className="p-3 text-slate-400">Prevents re-suspension of settled toxic particles for 4 hours</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

