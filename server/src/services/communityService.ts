import { CommunityReport } from '../types';
import { sanitizeString } from '../utils/sanitizer';

let reportsStore: CommunityReport[] = [
  {
    id: 'rep-1',
    reporterName: 'Priya S.',
    category: 'open_burning',
    location: 'Sector 44 Park Boundary',
    description: 'Dry leaf and garden waste burning reported along roadside hedge, creating dense localized smoke plume.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    upvotes: 14,
    status: 'reported'
  },
  {
    id: 'rep-2',
    reporterName: 'Arun K.',
    category: 'carpool_offer',
    location: 'Mayur Vihar to Cyber City',
    description: 'Offering EV carpool for 3 passengers Mon-Fri 8:15 AM departure. Clean cabin with HEPA filtration.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    upvotes: 28,
    status: 'verified'
  },
  {
    id: 'rep-3',
    reporterName: 'Neha M.',
    category: 'traffic_congestion',
    location: 'St. Mary School Entrance Ring Rd',
    description: 'Heavy diesel bus and SUV idling for 45 minutes during school release. PM2.5 spike observed > 380 ug/m3.',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    upvotes: 39,
    status: 'verified'
  },
  {
    id: 'rep-4',
    reporterName: 'David R.',
    category: 'dust_construction',
    location: 'Metro Extension Phase 4 Site',
    description: 'Uncovered dry debris pile without anti-smog water gun misting.',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    upvotes: 19,
    status: 'mitigated'
  }
];

export function getCommunityReports(): CommunityReport[] {
  return [...reportsStore].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function createCommunityReport(data: {
  reporterName?: string;
  category: CommunityReport['category'];
  location: string;
  description: string;
}): CommunityReport {
  const newReport: CommunityReport = {
    id: `rep-${Date.now()}`,
    reporterName: sanitizeString(data.reporterName || 'Neighbor', 50),
    category: data.category,
    location: sanitizeString(data.location, 120),
    description: sanitizeString(data.description, 400),
    timestamp: new Date().toISOString(),
    upvotes: 1,
    status: 'reported'
  };

  reportsStore.unshift(newReport);
  return newReport;
}

export function upvoteCommunityReport(id: string): CommunityReport | null {
  const report = reportsStore.find(r => r.id === id);
  if (report) {
    report.upvotes += 1;
    if (report.upvotes >= 5 && report.status === 'reported') {
      report.status = 'verified';
    }
    return report;
  }
  return null;
}

