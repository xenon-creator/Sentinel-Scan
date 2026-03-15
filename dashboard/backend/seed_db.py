import asyncio
import random
import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('MONGODB_DB_NAME', 'sentinel_scan')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def seed_database():
    print('Clearing old dummy data...')
    scans_to_insert = []
    findings_to_insert = []
    now = datetime.utcnow()
    threat_actors = [{'ip': '185.15.24.1', 'type': 'ip'}, {'ip': '45.22.11.99', 'type': 'ip'}, {'ip': 'malware-dist-01.ru', 'type': 'domain'}, {'ip': '103.44.11.2', 'type': 'ip'}, {'ip': 'phishing-login-secure.com', 'type': 'domain'}, {'ip': '114.114.114.114', 'type': 'ip'}, {'ip': '8.8.8.8', 'type': 'ip'}, {'ip': 'github.com', 'type': 'domain'}, {'ip': '142.250.190.46', 'type': 'ip'}, {'ip': 'suspicious-proxy.net', 'type': 'domain'}]
    print('Generating 100 random scans over the last 30 days...')
    for i in range(100):
        days_ago = random.randint(0, 30)
        scan_date = now - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
        target_info = random.choice(threat_actors)
        if 'malware' in target_info['ip'] or 'phishing' in target_info['ip']:
            severity_choice = random.choices(['critical', 'high', 'medium'], weights=[0.5, 0.4, 0.1])[0]
        elif target_info['ip'] in ['8.8.8.8', 'github.com', '142.250.190.46', '114.114.114.114']:
            severity_choice = 'info'
        else:
            severity_choice = random.choices(['high', 'medium', 'low', 'info'], weights=[0.2, 0.3, 0.3, 0.2])[0]
        risk_score_map = {'critical': random.uniform(9.0, 10.0), 'high': random.uniform(7.0, 8.9), 'medium': random.uniform(4.0, 6.9), 'low': random.uniform(1.0, 3.9), 'info': 0.0}
        risk_score = risk_score_map[severity_choice]
        scan_id = f'scn_{random.randint(100000, 999999)}'
        finding_id = f'fnd_{random.randint(100000, 999999)}'
        scan = {'scan_id': scan_id, 'target': target_info['ip'], 'scan_types': ['network', 'threat_intel'], 'status': 'completed', 'progress': 100, 'created_at': scan_date, 'started_at': scan_date + timedelta(seconds=2), 'completed_at': scan_date + timedelta(seconds=45), 'findings_count': 1, 'risk_score': risk_score, 'severity_breakdown': {severity_choice: 1}, 'tags': ['dummy-data', 'dashboard-seed']}
        finding = {'finding_id': finding_id, 'scan_id': scan_id, 'title': f"Threat Intel Hit from {random.choice(['VirusTotal', 'AbuseIPDB', 'AlienVault'])}", 'description': f"The target {target_info['ip']} was flagged by security vendors. Evidence suggests automated scanning or botnet activity.", 'severity': severity_choice, 'risk_score': risk_score, 'affected_asset': target_info['ip'], 'port': random.choice([80, 443, 22, 3389, 8080, None]), 'protocol': 'tcp', 'status': 'open', 'discovered_at': scan_date + timedelta(seconds=15), 'tags': ['dummy-data', 'dashboard-seed']}
        if severity_choice == 'info':
            finding['title'] = 'Normal Host Discovered'
            finding['description'] = f"The target {target_info['ip']} is safe with no malicious history."
        scans_to_insert.append(scan)
        findings_to_insert.append(finding)
    if scans_to_insert:
        await db.scans.insert_many(scans_to_insert)
    if findings_to_insert:
        await db.findings.insert_many(findings_to_insert)
    print(f'Successfully injected {len(scans_to_insert)} scans and findings!')
    print('Refresh your Dashboard at http://localhost:5174 to see the new charts!')
    client.close()
if __name__ == '__main__':
    asyncio.run(seed_database())