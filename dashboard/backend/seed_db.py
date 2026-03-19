import asyncio
import random
import os
import sys
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
DB_NAME   = os.getenv('MONGODB_DB_NAME', 'sentinel_scan')

MALICIOUS_IPS = [
    '185.15.24.1', '45.22.11.99', '103.44.11.2', '91.108.4.0',
    '178.62.197.82', '5.188.86.170', '185.220.101.31', '46.166.161.130',
    '194.165.16.11', '77.83.36.35', '31.220.55.14', '45.142.212.100',
    '185.107.56.122', '167.99.193.100', '159.65.4.0', '104.21.37.55',
]
MALICIOUS_DOMAINS = [
    'malware-dist-01.ru', 'phishing-login-secure.com', 'c2-server-hidden.xyz',
    'botnet-controller.club', 'ransomware-c2.onion.link', 'trojan-dropper.pw',
    'exploit-kit-landing.net', 'stealer-panel.gq', 'cryptominer-pool.icu',
    'fake-update-adobe.com', 'spearphish-target.org', 'rat-command.info',
]
SUSPICIOUS_IPS = [
    '203.0.113.5', '198.51.100.22', '93.184.220.15', '23.21.88.100',
    '52.87.114.22', '54.166.41.200', '35.180.200.11', '13.250.99.18',
]
SUSPICIOUS_DOMAINS = [
    'suspicious-proxy.net', 'tor-exit-node.cc', 'darkweb-mirror.xyz',
    'anon-vpn-relay.io', 'scan-from-shodan.net',
]
SAFE_IPS     = ['8.8.8.8', '8.8.4.4', '1.1.1.1', '142.250.190.46', '151.101.193.69', '172.217.16.46']
SAFE_DOMAINS = ['github.com', 'google.com', 'cloudflare.com', 'microsoft.com', 'amazon.com']

SOURCES = ['VirusTotal', 'AbuseIPDB', 'AlienVault OTX', 'Shodan', 'Nmap Scan']
PORTS   = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 6379, 8080, 8443, 27017, None]

def make_finding(scan_id, target, target_type, severity, risk_score, scan_date, source):
    finding_id = f'fnd_{random.randint(10000000, 99999999)}'

    if severity in ('critical', 'high'):
        if target_type == 'ip':
            title = f'Malicious IP Detected via {source}'
            desc  = (f'The IP address {target} has been flagged by multiple threat intelligence feeds. '
                     f'It is associated with botnet activity, port scanning, and brute-force attacks. '
                     f'Immediate blocking is recommended.')
        else:
            title = f'Malicious Domain Flagged by {source}'
            desc  = (f'The domain {target} has been identified as a command-and-control server or '
                     f'phishing infrastructure. DNS resolution should be blocked at the perimeter firewall.')
    elif severity in ('medium', 'low'):
        if target_type == 'ip':
            title = f'Suspicious IP Observed — {source}'
            desc  = (f'The IP {target} exhibited anomalous behaviour consistent with port scanning or '
                     f'automated reconnaissance. Manual review recommended.')
        else:
            title = f'Suspicious Domain Activity — {source}'
            desc  = (f'The domain {target} appears on watchlists for suspicious hosting or proxy services. '
                     f'Monitor for further connections.')
    else:
        title = f'Benign Host Recorded — {source}'
        desc  = (f'The target {target} was scanned and determined to be legitimate with no known '
                 f'malicious history at the time of this scan.')

    return {
        'finding_id':    finding_id,
        'scan_id':       scan_id,
        'title':         title,
        'description':   desc,
        'severity':      severity,
        'risk_score':    round(risk_score, 2),
        'affected_asset': target,
        'port':          random.choice(PORTS),
        'protocol':      'tcp',
        'status':        'open',
        'discovered_at': scan_date + timedelta(seconds=random.randint(5, 50)),
        'tags':          ['seeded', 'dashboard-demo'],
    }


def pick_target_and_severity():
    roll = random.random()
    if roll < 0.28:
        target = random.choice(MALICIOUS_IPS)
        target_type = 'ip'
        severity = random.choices(['critical', 'high', 'medium'], weights=[0.4, 0.45, 0.15])[0]
    elif roll < 0.42:
        target = random.choice(MALICIOUS_DOMAINS)
        target_type = 'domain'
        severity = random.choices(['critical', 'high', 'medium'], weights=[0.35, 0.50, 0.15])[0]
    elif roll < 0.60:
        target = random.choice(SUSPICIOUS_IPS)
        target_type = 'ip'
        severity = random.choices(['medium', 'low', 'info'], weights=[0.5, 0.35, 0.15])[0]
    elif roll < 0.72:
        target = random.choice(SUSPICIOUS_DOMAINS)
        target_type = 'domain'
        severity = random.choices(['medium', 'low'], weights=[0.6, 0.4])[0]
    elif roll < 0.86:
        target = random.choice(SAFE_IPS)
        target_type = 'ip'
        severity = 'info'
    else:
        target = random.choice(SAFE_DOMAINS)
        target_type = 'domain'
        severity = 'info'
    return target, target_type, severity


RISK_MAP = {
    'critical': lambda: round(random.uniform(9.0, 10.0), 2),
    'high':     lambda: round(random.uniform(7.0,  8.9),  2),
    'medium':   lambda: round(random.uniform(4.0,  6.9),  2),
    'low':      lambda: round(random.uniform(1.0,  3.9),  2),
    'info':     lambda: 0.0,
}


async def seed_database():
    print(f'\nConnecting to MongoDB at {MONGO_URL}...')
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=4000)
    db = client[DB_NAME]

    try:
        await client.admin.command('ping')
        print('MongoDB connection OK.')
    except Exception as e:
        print(f'ERROR: Cannot connect to MongoDB — {e}')
        print('Make sure MongoDB is running (mongod) and try again.')
        client.close()
        sys.exit(1)

    print('Clearing existing seeded data...')
    await db.scans.delete_many({'tags': 'seeded'})
    await db.findings.delete_many({'tags': 'seeded'})

    now = datetime.utcnow()
    scans_to_insert = []
    findings_to_insert = []

    NUM_SCANS = 320
    print(f'Generating {NUM_SCANS} scans over the last 30 days...')

    for _ in range(NUM_SCANS):
        days_ago  = random.uniform(0, 30)
        scan_date = now - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))

        target, target_type, severity = pick_target_and_severity()
        risk_score = RISK_MAP[severity]()
        source     = random.choice(SOURCES)
        scan_id    = f'scn_{random.randint(10000000, 99999999)}'

        scan = {
            'scan_id':     scan_id,
            'target':      target,
            'scan_types':  ['network', 'threat_intel'],
            'status':      'completed',
            'progress':    100,
            'created_at':  scan_date,
            'started_at':  scan_date + timedelta(seconds=2),
            'completed_at': scan_date + timedelta(seconds=random.randint(30, 120)),
            'findings_count': 1,
            'risk_score':  risk_score,
            'severity_breakdown': {severity: 1},
            'tags': ['seeded', 'dashboard-demo'],
        }

        finding = make_finding(scan_id, target, target_type, severity, risk_score, scan_date, source)

        scans_to_insert.append(scan)
        findings_to_insert.append(finding)

    await db.scans.insert_many(scans_to_insert)
    await db.findings.insert_many(findings_to_insert)

    total    = len(findings_to_insert)
    critical = sum(1 for f in findings_to_insert if f['severity'] == 'critical')
    high     = sum(1 for f in findings_to_insert if f['severity'] == 'high')
    medium   = sum(1 for f in findings_to_insert if f['severity'] == 'medium')
    low      = sum(1 for f in findings_to_insert if f['severity'] == 'low')
    info     = sum(1 for f in findings_to_insert if f['severity'] == 'info')

    print(f'\n✅ Seeded {total} findings into MongoDB:')
    print(f'   Critical : {critical}')
    print(f'   High     : {high}')
    print(f'   Medium   : {medium}')
    print(f'   Low      : {low}')
    print(f'   Info     : {info}')
    print('\nRefresh the dashboard at http://localhost:3000 to see the data!')
    client.close()


if __name__ == '__main__':
    asyncio.run(seed_database())