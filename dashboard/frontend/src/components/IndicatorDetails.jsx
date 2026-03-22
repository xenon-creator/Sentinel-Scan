import React, { useState, useEffect, useCallback } from 'react';
import { X, ExternalLink, Shield, Server, Box, Globe, Activity, RefreshCw, AlertTriangle, CheckCircle, XCircle, Database, Bug } from 'lucide-react';
import { fetchIndicatorDetails, fetchEnrichmentData } from '../api';
import { format } from 'date-fns';

const ScoreBar = ({ value, max = 100, color = 'bg-primary' }) => (
  <div className="w-full bg-black/40 rounded-full h-1.5 mt-1">
    <div
      className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
);

const SourceBadge = ({ success }) =>
  success ? (
    <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="w-3 h-3" /> Live</span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-red-400"><XCircle className="w-3 h-3" /> Error</span>
  );

const AbuseIpCard = ({ data }) => {
  if (!data) return null;
  const score = data.abuse_confidence_score ?? 0;
  const color = score > 70 ? 'bg-red-500' : score > 30 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-white flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> AbuseIPDB</span>
        <SourceBadge success={data.success} />
      </div>
      {data.success ? (
        <>
          <div>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-secondary">Abuse Confidence</span>
              <span className="font-bold text-white">{score}%</span>
            </div>
            <ScoreBar value={score} color={color} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <span className="text-secondary">ISP</span>
            <span className="text-gray-300 truncate">{data.isp || '—'}</span>
            <span className="text-secondary">Country</span>
            <span className="text-gray-300">{data.country_code || '—'}</span>
            <span className="text-secondary">Reports</span>
            <span className="text-gray-300">{data.total_reports ?? 0}</span>
            <span className="text-secondary">Tor Exit</span>
            <span className={data.is_tor ? 'text-red-400 font-medium' : 'text-gray-300'}>{data.is_tor ? 'Yes' : 'No'}</span>
          </div>
        </>
      ) : (
        <p className="text-xs text-red-400">{data.error}</p>
      )}
    </div>
  );
};

const VirusTotalCard = ({ data }) => {
  if (!data) return null;
  const mal = data.malicious_votes ?? 0;
  const total = (data.malicious_votes ?? 0) + (data.harmless_votes ?? 0) + (data.suspicious_votes ?? 0) + (data.undetected_votes ?? 0);
  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-white flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400" /> VirusTotal</span>
        <SourceBadge success={data.success} />
      </div>
      {data.success ? (
        <>
          <div>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-secondary">Malicious Engines</span>
              <span className="font-bold text-white">{mal} / {total}</span>
            </div>
            <ScoreBar value={mal} max={Math.max(total, 1)} color={mal > 5 ? 'bg-red-500' : mal > 0 ? 'bg-amber-500' : 'bg-emerald-500'} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <span className="text-secondary">Suspicious</span>
            <span className="text-gray-300">{data.suspicious_votes ?? 0}</span>
            <span className="text-secondary">Reputation</span>
            <span className={`font-medium ${(data.reputation ?? 0) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{data.reputation ?? 0}</span>
            {data.country && <><span className="text-secondary">Country</span><span className="text-gray-300">{data.country}</span></>}
            {data.as_owner && <><span className="text-secondary">ASN Owner</span><span className="text-gray-300 truncate">{data.as_owner}</span></>}
          </div>
        </>
      ) : (
        <p className="text-xs text-red-400">{data.error}</p>
      )}
    </div>
  );
};

const NvdCard = ({ data }) => {
  if (!data) return null;
  const severityColor = {
    CRITICAL: 'text-red-400', HIGH: 'text-orange-400',
    MEDIUM: 'text-amber-400', LOW: 'text-blue-400',
  };
  return (
    <div className="glass-panel p-4 space-y-3 col-span-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-white flex items-center gap-2"><Database className="w-4 h-4 text-emerald-400" /> NVD / NIST</span>
        <SourceBadge success={data.success} />
      </div>
      {data.success ? (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs bg-black/30 px-2 py-0.5 rounded border border-border">{data.cve_id}</span>
            {data.severity && <span className={`text-xs font-bold uppercase ${severityColor[data.severity] || 'text-gray-300'}`}>{data.severity}</span>}
            {data.cvss_score && <span className="text-white text-sm font-bold">CVSS {data.cvss_score}</span>}
          </div>
          {data.description && <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{data.description}</p>}
          {data.cvss_vector && <p className="text-xs font-mono text-blue-400 break-all">{data.cvss_vector}</p>}
          {data.references?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.references.slice(0, 3).map((ref, i) => (
                <a key={i} href={ref} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Ref {i + 1}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-secondary">{data.error}</p>
      )}
    </div>
  );
};

const EnrichmentPanel = ({ findingId, enrichmentCache }) => {
  const [enrichment, setEnrichment] = useState(enrichmentCache || null);
  const [loading, setLoading] = useState(!enrichmentCache);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await fetchEnrichmentData(findingId, refresh);
      setEnrichment(data);
    } catch (e) {
      console.error('Enrichment fetch failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [findingId]);

  useEffect(() => { if (!enrichmentCache) load(); }, [enrichmentCache, load]);

  const noSources = enrichment?.note && !enrichment?.abuseipdb && !enrichment?.virustotal && !enrichment?.nvd;

  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-4 border-b border-border bg-black/30 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Bug className="w-4 h-4 text-primary" /> Threat Intelligence Enrichment
        </h3>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-secondary hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            <div className="h-28 bg-border/30 rounded-xl" />
            <div className="h-28 bg-border/30 rounded-xl" />
            <div className="col-span-2 h-24 bg-border/30 rounded-xl" />
          </div>
        ) : noSources ? (
          <div className="flex items-center gap-2 text-secondary text-xs py-4">
            <AlertTriangle className="w-4 h-4" />
            <span>{enrichment.note}</span>
          </div>
        ) : enrichment ? (
          <div className="grid grid-cols-2 gap-3">
            <AbuseIpCard data={enrichment.abuseipdb} />
            <VirusTotalCard data={enrichment.virustotal} />
            {enrichment.nvd && <NvdCard data={enrichment.nvd} />}
          </div>
        ) : (
          <p className="text-xs text-secondary py-4">No enrichment data available.</p>
        )}
        {enrichment?.enriched_at && (
          <p className="text-xs text-gray-600 mt-3 text-right">
            Enriched {format(new Date(enrichment.enriched_at), 'MMM dd, HH:mm')}
          </p>
        )}
      </div>
    </div>
  );
};

const IndicatorDetails = ({ indicatorId, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(!!indicatorId);

  useEffect(() => {
    if (!indicatorId) return;
    let ignore = false;
    fetchIndicatorDetails(indicatorId)
      .then(data => { if (!ignore) { setDetails(data); setLoading(false); } })
      .catch(err => { if (!ignore) { console.error('Failed to load indicator details:', err); setLoading(false); } });
    return () => { ignore = true; };
  }, [indicatorId]);

  if (!indicatorId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-panel border-l border-border shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">

        <div className="sticky top-0 bg-panel/95 backdrop-blur z-10 border-b border-border p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Shield className="w-6 h-6 mr-2 text-primary" /> Indicator Analysis
            </h2>
            <p className="text-sm text-secondary mt-1 tracking-wide uppercase font-semibold">
              ID: {indicatorId.substring(0, 8)}...
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/20 hover:bg-white/10 rounded-full transition-colors border border-border">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-24 bg-border/50 rounded-xl" />
              <div className="h-64 bg-border/30 rounded-xl" />
              <div className="h-40 bg-border/30 rounded-xl" />
            </div>
          ) : details ? (
            <>
              <div className="glass-panel p-6 relative overflow-hidden flex flex-col items-center justify-center border-t-4 border-t-primary">
                <div className={`absolute inset-0 bg-gradient-to-b ${
                  details.classification === 'Malicious' ? 'from-danger/20' :
                  details.classification === 'Suspicious' ? 'from-warning/20' : 'from-success/20'
                } to-transparent opacity-50`} />
                <div className="relative z-10 text-center">
                  <h1 className="text-4xl font-mono font-bold text-white mb-2">{details.indicator}</h1>
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <span className={`badge ${
                      details.classification === 'Malicious' ? 'badge-danger' :
                      details.classification === 'Suspicious' ? 'badge-warning' : 'badge-success'
                    } px-3 py-1.5 text-sm`}>
                      {details.classification?.toUpperCase()}
                    </span>
                    <span className="text-white font-semibold flex items-center bg-black/30 px-3 py-1.5 rounded-full border border-border text-sm">
                      Score: {details.threat_score}/100
                    </span>
                  </div>
                  <p className="text-secondary">{details.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-xl border border-border flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="block text-xs text-secondary uppercase tracking-wider mb-1">Time Detected</span>
                    <span className="text-gray-200 text-sm font-medium">
                      {details.timestamp ? format(new Date(details.timestamp), 'MMM dd, yyyy HH:mm:ss') : 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-border flex items-start space-x-3">
                  <Box className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <span className="block text-xs text-secondary uppercase tracking-wider mb-1">Severity / Status</span>
                    <span className="text-gray-200 text-sm font-medium capitalize flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        details.severity === 'critical' || details.severity === 'high' ? 'bg-danger' :
                        details.severity === 'medium' || details.severity === 'low' ? 'bg-warning' : 'bg-success'
                      }`} />
                      {details.severity} / {details.scan_status}
                    </span>
                  </div>
                </div>
                {details.port && (
                  <div className="bg-black/20 p-4 rounded-xl border border-border flex items-start space-x-3 col-span-2">
                    <Server className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <span className="block text-xs text-secondary uppercase tracking-wider mb-1">Service Analysis</span>
                      <span className="text-gray-200 text-sm font-medium">
                        Port {details.port}/{details.protocol || 'tcp'} detected open.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {details.description && (
                <div className="glass-panel p-5 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-primary" /> Finding Description
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{details.description}</p>
                </div>
              )}

              <EnrichmentPanel
                findingId={indicatorId}
                cveId={details.cve_id}
                enrichmentCache={details.enrichment}
              />

              {details.raw_data && (
                <div className="glass-panel overflow-hidden">
                  <div className="p-4 border-b border-border bg-black/40 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-white flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2" /> Raw Scan Data
                    </h3>
                  </div>
                  <div className="p-4 bg-[#0a0f18] overflow-x-auto max-h-72">
                    <pre className="text-xs text-gray-300 font-mono">
                      {JSON.stringify(details.raw_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Shield className="w-16 h-16 mb-4 opacity-20" />
              <p>Details not available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default IndicatorDetails;