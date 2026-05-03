import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Shield, Server, Box, Globe, Activity, RefreshCw, AlertTriangle, CheckCircle, XCircle, Database, Bug } from 'lucide-react';
import { fetchIndicatorDetails, fetchEnrichmentData } from '../api';
import { format } from 'date-fns';

const ScoreBar = ({ value, max = 100, color = 'bg-primary' }) => (
  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 shadow-inner">
    <div
      className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
);

const SourceBadge = ({ success }) =>
  success ? (
    <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold"><CheckCircle className="w-3 h-3" /> Live</span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-red-600 font-bold"><XCircle className="w-3 h-3" /> Error</span>
  );

const AbuseIpCard = ({ data }) => {
  if (!data) return null;
  const score = data.abuse_confidence_score ?? 0;
  const color = score > 70 ? 'bg-red-500' : score > 30 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="bg-white border border-border rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-gray-900 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> AbuseIPDB</span>
        <SourceBadge success={data.success} />
      </div>
      {data.success ? (
        <>
          <div>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-secondary font-bold">Abuse Confidence</span>
              <span className="font-bold text-gray-900">{score}%</span>
            </div>
            <ScoreBar value={score} color={color} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <span className="text-secondary font-bold">ISP</span>
            <span className="text-gray-700 truncate font-medium">{data.isp || '—'}</span>
            <span className="text-secondary font-bold">Country</span>
            <span className="text-gray-700 font-medium">{data.country_code || '—'}</span>
            <span className="text-secondary font-bold">Reports</span>
            <span className="text-gray-700 font-medium">{data.total_reports ?? 0}</span>
            <span className="text-secondary font-bold">Tor Exit</span>
            <span className={data.is_tor ? 'text-red-600 font-bold' : 'text-gray-700 font-medium'}>{data.is_tor ? 'Yes' : 'No'}</span>
          </div>
        </>
      ) : (
        <p className="text-xs text-red-500 font-medium">{data.error}</p>
      )}
    </div>
  );
};

const VirusTotalCard = ({ data }) => {
  if (!data) return null;
  const mal = data.malicious_votes ?? 0;
  const total = (data.malicious_votes ?? 0) + (data.harmless_votes ?? 0) + (data.suspicious_votes ?? 0) + (data.undetected_votes ?? 0);
  return (
    <div className="bg-white border border-border rounded-xl p-4 space-y-3 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-gray-900 flex items-center gap-2"><Shield className="w-4 h-4 text-purple-500" /> VirusTotal</span>
        <SourceBadge success={data.success} />
      </div>
      {data.success ? (
        <>
          <div>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-secondary font-bold">Malicious Engines</span>
              <span className="font-bold text-gray-900">{mal} / {total}</span>
            </div>
            <ScoreBar value={mal} max={Math.max(total, 1)} color={mal > 5 ? 'bg-red-500' : mal > 0 ? 'bg-amber-500' : 'bg-emerald-500'} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <span className="text-secondary font-bold">Suspicious</span>
            <span className="text-gray-700 font-medium">{data.suspicious_votes ?? 0}</span>
            <span className="text-secondary font-bold">Reputation</span>
            <span className={`font-bold ${(data.reputation ?? 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{data.reputation ?? 0}</span>
            {data.country && <><span className="text-secondary font-bold">Country</span><span className="text-gray-700 font-medium">{data.country}</span></>}
            {data.as_owner && <><span className="text-secondary font-bold">ASN Owner</span><span className="text-gray-700 truncate font-medium">{data.as_owner}</span></>}
          </div>
        </>
      ) : (
        <p className="text-xs text-red-500 font-medium">{data.error}</p>
      )}
    </div>
  );
};

const NvdCard = ({ data }) => {
  if (!data) return null;
  const severityColor = {
    CRITICAL: 'text-red-600 bg-red-50 border-red-200', HIGH: 'text-orange-600 bg-orange-50 border-orange-200',
    MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200', LOW: 'text-blue-600 bg-blue-50 border-blue-200',
  };
  return (
    <div className="bg-white border border-border rounded-xl p-4 space-y-3 col-span-2 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-gray-900 flex items-center gap-2"><Database className="w-4 h-4 text-emerald-500" /> NVD / NIST</span>
        <SourceBadge success={data.success} />
      </div>
      {data.success ? (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded border border-border font-bold text-gray-800">{data.cve_id}</span>
            {data.severity && <span className={`text-xs px-2 py-0.5 rounded border font-bold uppercase ${severityColor[data.severity] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>{data.severity}</span>}
            {data.cvss_score && <span className="text-gray-900 text-sm font-bold">CVSS {data.cvss_score}</span>}
          </div>
          {data.description && <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-3">{data.description}</p>}
          {data.cvss_vector && <p className="text-xs font-mono text-blue-600 bg-blue-50/50 p-1.5 rounded break-all">{data.cvss_vector}</p>}
          {data.references?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {data.references.slice(0, 3).map((ref, i) => (
                <a key={i} href={ref} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-bold text-primary hover:text-blue-700 hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Ref {i + 1}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-secondary font-medium">{data.error}</p>
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
    <div className="bg-gray-50/80 border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border bg-white flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Bug className="w-4 h-4 text-primary" /> Threat Intelligence Enrichment
        </h3>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            <div className="h-28 bg-gray-200 rounded-xl" />
            <div className="h-28 bg-gray-200 rounded-xl" />
            <div className="col-span-2 h-24 bg-gray-200 rounded-xl" />
          </div>
        ) : noSources ? (
          <div className="flex items-center gap-2 text-secondary font-medium text-xs py-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{enrichment.note}</span>
          </div>
        ) : enrichment ? (
          <div className="grid grid-cols-2 gap-3">
            <AbuseIpCard data={enrichment.abuseipdb} />
            <VirusTotalCard data={enrichment.virustotal} />
            {enrichment.nvd && <NvdCard data={enrichment.nvd} />}
          </div>
        ) : (
          <p className="text-xs text-secondary font-medium py-4">No enrichment data available.</p>
        )}
        {enrichment?.enriched_at && (
          <p className="text-xs font-bold text-gray-400 mt-3 text-right">
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

  return createPortal(
    <>
      <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white border-l border-border shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">

        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-border p-6 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-primary" /> Indicator Analysis
            </h2>
            <p className="text-xs text-secondary mt-1 tracking-wide uppercase font-bold">
              ID: {indicatorId.substring(0, 16)}...
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-border shadow-sm">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-24 bg-gray-100 rounded-xl" />
              <div className="h-64 bg-gray-50 rounded-xl" />
              <div className="h-40 bg-gray-50 rounded-xl" />
            </div>
          ) : details ? (
            <>
              <div className="bg-white border border-border rounded-xl p-6 relative overflow-hidden flex flex-col items-center justify-center border-t-4 border-t-primary shadow-sm">
                <div className={`absolute inset-0 bg-gradient-to-b ${
                  details.classification === 'Malicious' ? 'from-red-50' :
                  details.classification === 'Suspicious' ? 'from-amber-50' : 'from-emerald-50'
                } to-transparent opacity-80`} />
                <div className="relative z-10 text-center w-full">
                  <h1 className="text-3xl sm:text-4xl font-mono font-extrabold text-gray-900 mb-3 break-all px-4">{details.indicator}</h1>
                  <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                    <span className={`px-3 py-1.5 text-xs font-bold uppercase rounded-full border shadow-sm ${
                      details.classification === 'Malicious' ? 'bg-red-50 text-red-700 border-red-200' :
                      details.classification === 'Suspicious' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {details.classification?.toUpperCase()}
                    </span>
                    <span className="text-gray-800 font-bold flex items-center bg-gray-100 px-3 py-1.5 rounded-full border border-border text-xs shadow-sm">
                      Score: {Math.round(Number(details.threat_score))}/100
                    </span>
                  </div>
                  <p className="text-secondary font-medium text-sm">{details.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-border flex items-start space-x-3 shadow-sm">
                  <Activity className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <span className="block text-xs text-secondary font-bold uppercase tracking-wider mb-1">Time Detected</span>
                    <span className="text-gray-900 text-sm font-bold">
                      {details.timestamp ? format(new Date(details.timestamp), 'MMM dd, yyyy HH:mm:ss') : 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-border flex items-start space-x-3 shadow-sm">
                  <Box className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <span className="block text-xs text-secondary font-bold uppercase tracking-wider mb-1">Severity / Status</span>
                    <span className="text-gray-900 text-sm font-bold capitalize flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 shadow-sm ${
                        details.severity === 'critical' || details.severity === 'high' ? 'bg-red-500' :
                        details.severity === 'medium' || details.severity === 'low' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      {details.severity} / {details.scan_status}
                    </span>
                  </div>
                </div>
                {details.port && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-border flex items-start space-x-3 col-span-2 shadow-sm">
                    <Server className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <span className="block text-xs text-secondary font-bold uppercase tracking-wider mb-1">Service Analysis</span>
                      <span className="text-gray-900 text-sm font-bold">
                        Port {details.port}/{details.protocol || 'tcp'} detected open.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {details.description && (
                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-primary" /> Finding Description
                  </h3>
                  <p className="text-gray-700 text-sm font-medium leading-relaxed">{details.description}</p>
                </div>
              )}

              <EnrichmentPanel
                findingId={indicatorId}
                cveId={details.cve_id}
                enrichmentCache={details.enrichment}
              />

              {details.raw_data && (
                <div className="bg-gray-50 border border-border rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-border bg-white flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2 text-gray-500" /> Raw Scan Data
                    </h3>
                  </div>
                  <div className="p-4 bg-gray-50 overflow-x-auto max-h-72">
                    <pre className="text-xs text-gray-700 font-mono font-medium">
                      {JSON.stringify(details.raw_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Shield className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold">Details not available</p>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
};

export default IndicatorDetails;