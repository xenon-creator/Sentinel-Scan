# Sentinel-Scan: Project Structure

## Recommended Directory Layout

```
sentinel-scan/
│
├── backend/                      # FastAPI backend application
│   ├── api/                      # API routes and endpoints
│   │   ├── routes/
│   │   │   ├── scans.py         # Scan management endpoints
│   │   │   ├── findings.py      # Findings retrieval endpoints
│   │   │   ├── assets.py        # Asset management endpoints
│   │   │   └── reports.py       # Report generation endpoints
│   │   ├── dependencies.py      # Shared dependencies
│   │   └── middleware.py        # Custom middleware
│   │
│   ├── core/                     # Core business logic
│   │   ├── orchestrator.py      # Scan orchestration engine
│   │   ├── plugin_manager.py    # Plugin system manager
│   │   ├── enrichment.py        # CVE/CVSS enrichment
│   │   └── risk_scorer.py       # Risk scoring algorithm
│   │
│   ├── plugins/                  # Scanner plugins
│   │   ├── base.py              # Abstract base class
│   │   ├── nmap_scanner.py      # Network scanner
│   │   ├── nuclei_scanner.py    # Vulnerability scanner
│   │   ├── zap_scanner.py       # Web application scanner
│   │   ├── trivy_scanner.py     # Container scanner
│   │   ├── trufflehog_scanner.py # Secrets scanner
│   │   ├── checkov_scanner.py   # IaC scanner
│   │   └── scoutsuite_scanner.py # Cloud scanner
│   │
│   ├── models/                   # Pydantic data models
│   │   ├── scan.py              # Scan models
│   │   ├── finding.py           # Finding models
│   │   ├── asset.py             # Asset models
│   │   └── threat_intel.py      # Threat intel models
│   │
│   ├── workers/                  # Celery workers
│   │   ├── celery_app.py        # Celery configuration
│   │   └── tasks.py             # Task definitions
│   │
│   ├── db/                       # Database utilities
│   │   └── mongodb.py           # MongoDB connection
│   │
│   ├── utils/                    # Utility functions
│   │   ├── parsers.py           # Output parsers
│   │   ├── validators.py        # Input validators
│   │   └── helpers.py           # Helper functions
│   │
│   ├── main.py                   # FastAPI application entry
│   ├── config.py                 # Configuration management
│   └── requirements.txt          # Python dependencies
│
├── frontend/                     # React dashboard
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Dashboard/
│   │   │   │   ├── RiskGauge.jsx
│   │   │   │   ├── FindingsOverview.jsx
│   │   │   │   ├── TrendChart.jsx
│   │   │   │   └── RecentScans.jsx
│   │   │   ├── Scans/
│   │   │   │   ├── ScanForm.jsx
│   │   │   │   ├── ScanList.jsx
│   │   │   │   └── ScanDetails.jsx
│   │   │   ├── Findings/
│   │   │   │   ├── FindingsTable.jsx
│   │   │   │   ├── FindingDetails.jsx
│   │   │   │   └── SeverityBadge.jsx
│   │   │   └── Common/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── Card.jsx
│   │   │
│   │   ├── pages/               # Page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ScansPage.jsx
│   │   │   ├── FindingsPage.jsx
│   │   │   ├── AssetsPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   │
│   │   ├── services/            # API services
│   │   │   └── api.js           # Axios API client
│   │   │
│   │   ├── store/               # Redux store
│   │   │   ├── index.js
│   │   │   ├── scansSlice.js
│   │   │   ├── findingsSlice.js
│   │   │   └── assetsSlice.js
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   └── formatters.js
│   │   │
│   │   ├── App.jsx              # Main App component
│   │   ├── index.jsx            # React entry point
│   │   └── index.css            # Global styles
│   │
│   ├── package.json
│   └── vite.config.js           # Vite configuration
│
├── docker/                       # Docker configurations
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── worker.Dockerfile
│
├── docs/                         # Documentation
│   ├── api/
│   │   └── README.md            # API documentation
│   ├── plugins/
│   │   └── development.md       # Plugin dev guide
│   ├── deployment/
│   │   ├── docker.md            # Docker deployment
│   │   └── kubernetes.md        # K8s deployment
│   └── user-guide/
│       └── getting-started.md
│
├── tests/                        # Test suites
│   ├── backend/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── api/
│   └── frontend/
│       ├── components/
│       └── e2e/
│
├── scripts/                      # Utility scripts
│   ├── setup.sh                 # Initial setup
│   ├── seed_db.py               # Database seeding
│   └── run_tests.sh             # Test runner
│
├── k8s/                          # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
│
├── .github/                      # GitHub workflows
│   └── workflows/
│       └── ci-cd.yml
│
├── docker-compose.yml            # Docker Compose config
├── .env.example                  # Environment variables template
├── .gitignore
├── LICENSE
├── README.md                     # Project README
└── PLATFORM_DESIGN.md           # Comprehensive design doc
```

## Technology Stack Summary

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Task Queue:** Celery + Redis
- **Database:** MongoDB
- **Validation:** Pydantic
- **Testing:** pytest

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **State Management:** Redux Toolkit
- **Data Fetching:** React Query + Axios
- **Styling:** TailwindCSS (or Vanilla CSS)
- **Charts:** Recharts

### Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose / Kubernetes
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana (future)

### External Services
- **NVD API:** CVE data
- **Exploit-DB:** Exploit information
- **Threat Feeds:** AlienVault OTX, Abuse.ch
- **Cloud APIs:** AWS, Azure, GCP SDKs

## Development Workflow

1. **Local Development:**
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn main:app --reload
   
   # Frontend
   cd frontend
   npm install
   npm run dev
   ```

2. **Docker Development:**
   ```bash
   docker-compose up --build
   ```

3. **Testing:**
   ```bash
   # Backend tests
   pytest tests/backend/
   
   # Frontend tests
   cd frontend && npm test
   ```

4. **Production Build:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```
