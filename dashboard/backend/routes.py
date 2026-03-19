from fastapi import APIRouter, Depends, Query, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any
from dashboard.backend.database import get_db
from datetime import datetime, timedelta
import os
router = APIRouter(prefix='/dashboard', tags=['dashboard'])

@router.get('/stats')
async def get_stats(db: AsyncIOMotorDatabase=Depends(get_db)):
    total_findings = await db.findings.count_documents({})
    malicious = await db.findings.count_documents({'severity': {'$in': ['critical', 'high']}})
    suspicious = await db.findings.count_documents({'severity': {'$in': ['medium', 'low']}})
    safe = await db.findings.count_documents({'severity': 'info'})
    total_scans = await db.scans.count_documents({})
    return {'total_scans': total_scans, 'total_indicators': total_findings, 'malicious': malicious, 'suspicious': suspicious, 'safe': safe}

@router.get('/threat-trends')
async def get_threat_trends(days: int=30, db: AsyncIOMotorDatabase=Depends(get_db)):
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    pipeline = [{'$match': {'discovered_at': {'$gte': cutoff_date}, 'severity': {'$in': ['critical', 'high', 'medium']}}}, {'$group': {'_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$discovered_at'}}, 'count': {'$sum': 1}}}, {'$sort': {'_id': 1}}]
    results = await db.findings.aggregate(pipeline).to_list(length=None)
    formatted_results = [{'date': r['_id'], 'count': r['count']} for r in results]
    current = cutoff_date
    final_data = []
    results_dict = {item['date']: item['count'] for item in formatted_results}
    for i in range(days + 1):
        day_str = current.strftime('%Y-%m-%d')
        final_data.append({'date': day_str, 'count': results_dict.get(day_str, 0)})
        current += timedelta(days=1)
    return final_data

@router.get('/threat-distribution')
async def get_threat_distribution(db: AsyncIOMotorDatabase=Depends(get_db)):
    malicious = await db.findings.count_documents({'severity': {'$in': ['critical', 'high']}})
    suspicious = await db.findings.count_documents({'severity': {'$in': ['medium', 'low']}})
    safe = await db.findings.count_documents({'severity': 'info'})
    return [{'name': 'Malicious', 'value': malicious, 'color': '#ef4444'}, {'name': 'Suspicious', 'value': suspicious, 'color': '#f59e0b'}, {'name': 'Safe', 'value': safe, 'color': '#10b981'}]

@router.get('/recent-scans')
async def get_recent_scans(limit: int=20, db: AsyncIOMotorDatabase=Depends(get_db)):
    pipeline = [{'$sort': {'discovered_at': -1}}, {'$limit': limit}]
    findings = await db.findings.aggregate(pipeline).to_list(length=limit)
    formatted = []
    for f in findings:
        classification = 'Safe'
        if f.get('severity') in ['critical', 'high']:
            classification = 'Malicious'
        elif f.get('severity') in ['medium', 'low']:
            classification = 'Suspicious'
        formatted.append({'id': f.get('finding_id'), 'indicator': f.get('affected_asset', 'Unknown'), 'type': 'ip' if '.' in f.get('affected_asset', '') and (not any((c.isalpha() for c in f.get('affected_asset', '')))) else 'domain', 'threat_score': (f.get('risk_score') or 0) * 10, 'classification': classification, 'source': f.get('title', 'Nmap Scan'), 'timestamp': f.get('discovered_at')})
    return formatted

@router.get('/indicator/{indicator_id}')
async def get_indicator_details(indicator_id: str, db: AsyncIOMotorDatabase=Depends(get_db)):
    finding = await db.findings.find_one({'finding_id': indicator_id})
    if not finding:
        raise HTTPException(status_code=404, detail='Indicator not found')
    scan = await db.scans.find_one({'scan_id': finding.get('scan_id')})
    classification = 'Safe'
    if finding.get('severity') in ['critical', 'high']:
        classification = 'Malicious'
    elif finding.get('severity') in ['medium', 'low']:
        classification = 'Suspicious'
    enrichment = finding.get('enrichment')
    return {'finding_id': finding.get('finding_id'), 'indicator': finding.get('affected_asset'), 'title': finding.get('title'), 'description': finding.get('description'), 'threat_score': (finding.get('risk_score') or 0) * 10, 'classification': classification, 'severity': finding.get('severity'), 'cve_id': finding.get('cve_id'), 'timestamp': finding.get('discovered_at'), 'port': finding.get('port'), 'protocol': finding.get('protocol'), 'scan_status': scan.get('status') if scan else 'Unknown', 'enrichment': enrichment, 'raw_data': {'finding': {k: v for k, v in finding.items() if k not in ('_id', 'enrichment')}, 'scan': {k: v for k, v in scan.items() if k != '_id'} if scan else None}}

@router.get('/top-threats')
async def get_top_threats(limit: int=5, db: AsyncIOMotorDatabase=Depends(get_db)):
    pipeline = [{'$match': {'severity': {'$in': ['critical', 'high']}}}, {'$group': {'_id': '$affected_asset', 'count': {'$sum': 1}, 'avg_risk': {'$avg': '$risk_score'}, 'finding_ids': {'$push': '$finding_id'}}}, {'$sort': {'avg_risk': -1, 'count': -1}}, {'$limit': limit}]
    results = await db.findings.aggregate(pipeline).to_list(length=limit)
    return [{'indicator': r['_id'], 'times_detected': r['count'], 'threat_score': min((r.get('avg_risk') or 0) * 10, 100), 'finding_id': r['finding_ids'][0] if r['finding_ids'] else None} for r in results]

@router.get('/api-status')
async def get_api_status():
    return [
        {
            'id': 'abuseipdb',
            'name': 'AbuseIPDB',
            'description': 'IP reputation & crowdsourced abuse reporting.',
            'logo': '\U0001f6e1\ufe0f',
            'endpoint': 'https://api.abuseipdb.com/api/v2/check',
            'configured': bool(os.getenv('ABUSEIPDB_API_KEY')),
            'api_key_env': 'ABUSEIPDB_API_KEY',
        },
        {
            'id': 'virustotal',
            'name': 'VirusTotal',
            'description': 'Analyze IPs, domains, files and URLs with 70+ AV engines.',
            'logo': '\U0001f50d',
            'endpoint': 'https://www.virustotal.com/api/v3/',
            'configured': bool(os.getenv('VIRUSTOTAL_API_KEY')),
            'api_key_env': 'VIRUSTOTAL_API_KEY',
        },
        {
            'id': 'nvd',
            'name': 'NVD (NIST)',
            'description': 'National Vulnerability Database — CVE detail & CVSS scores.',
            'logo': '\U0001f4dc',
            'endpoint': 'https://services.nvd.nist.gov/rest/json/cves/2.0',
            'configured': bool(os.getenv('NVD_API_KEY')),
            'api_key_env': 'NVD_API_KEY',
        },
        {
            'id': 'osv',
            'name': 'OSV (Google)',
            'description': 'Open-source vulnerability database — no key required.',
            'logo': '\U0001f9ec',
            'endpoint': 'https://api.osv.dev/v1/query',
            'configured': True,
            'api_key_env': None,
        },
    ]