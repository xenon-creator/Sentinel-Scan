# Sentinel-Scan

> **Unified Threat Intelligence & Vulnerability Scanning Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18+-blue.svg)](https://react.dev/)

Sentinel-Scan is a next-generation, enterprise-grade cybersecurity platform that unifies threat intelligence, vulnerability scanning, and security automation into a single, powerful solution. Built for SOC teams, DevSecOps engineers, and cloud security professionals.

## ✨ Key Features

- 🎯 **Threat Intelligence Engine** - Multi-source threat feed aggregation with MITRE ATT&CK mapping
- 🔍 **Multi-Scanner Architecture** - Network, web, container, IaC, and cloud security scanning
- ⚡ **Automated Enrichment** - CVE/CVSS scoring with exploit availability checks
- 📊 **Intelligent Dashboard** - Real-time findings with trend analysis
- 🔌 **API-First Design** - RESTful API for complete automation
- 🛡️ **Compliance Ready** - OWASP Top 10, CIS Benchmarks, PCI-DSS alignment

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)
- Node.js 18+ (for frontend development)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sentinel-scan.git
cd sentinel-scan

# Start all services
docker-compose up -d

# Access the dashboard
open http://localhost:3000
```

### API Usage

```bash
# Create a scan
curl -X POST http://localhost:8000/api/v1/scans \
  -H "Content-Type: application/json" \
  -d '{
    "target": "192.168.1.0/24",
    "scan_types": ["network", "vulnerability"]
  }'

# Get scan results
curl http://localhost:8000/api/v1/scans/{scan_id}
```

## 📋 Supported Scanners

| Scanner Type | Technology | Coverage |
|-------------|-----------|----------|
| **Network Scanner** | Nmap, Masscan | Ports, services, OS detection |
| **Vulnerability Scanner** | OpenVAS, Nuclei | CVEs, misconfigurations |
| **Web Scanner** | OWASP ZAP, Nikto | XSS, SQLi, CSRF |
| **Secrets Detector** | TruffleHog, GitLeaks | API keys, credentials |
| **Container Scanner** | Trivy, Grype | Image vulnerabilities |
| **IaC Scanner** | Checkov, KICS | Terraform, CloudFormation |
| **Cloud Scanner** | ScoutSuite, Prowler | AWS, Azure, GCP |

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React     │────▶│   FastAPI    │────▶│  MongoDB    │
│  Dashboard  │     │   Backend    │     │  Database   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Celery    │
                    │   Workers    │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Scanner    │
                    │   Plugins    │
                    └──────────────┘
```

## 📚 Documentation

- [Platform Design Blueprint](docs/PLATFORM_DESIGN.md)
- [Implementation Plan](docs/implementation_plan.md)
- [API Documentation](docs/api/README.md)
- [Plugin Development Guide](docs/plugins/development.md)
- [Deployment Guide](docs/DOCKER_INSTALL.md)

## 🛣️ Roadmap

### MVP (Current Phase)
- [x] Platform design and architecture
- [x] Implementation planning
- [ ] FastAPI backend foundation
- [ ] First scanner plugin (Nmap)
- [ ] Basic API endpoints

### Phase 2 (3-6 months)
- [ ] Multi-scanner integration
- [ ] CVE enrichment engine
- [ ] React dashboard
- [ ] Docker containerization

### Phase 3 (6-12 months)
- [ ] Container & IaC scanning
- [ ] Cloud security scanning
- [ ] Advanced reporting
- [ ] Alert integrations

### Enterprise (12+ months)
- [ ] Multi-tenancy
- [ ] RBAC system
- [ ] Compliance frameworks
- [ ] SOAR capabilities

## 🤝 Contributing & Roles

Sentinel-Scan is maintained by the core team:
- **Backend Lead & Architecture:** [Saran Surya] (Python, FastAPI, MongoDB)
- **DevOps, Cloud & Infrastructure:** [Rahul Surya] (Docker, CI/CD, Community Standards)
- **Frontend Development:** Shared Responsibility (React, Tailwind)

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on setting up locally and our PR workflow.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Powered by [Celery](https://docs.celeryq.dev/)
- Visualized with [React](https://react.dev/)
- Inspired by the cybersecurity community


- **Website:** https://sentinel-scan.io
- **Documentation:** https://docs.sentinel-scan.io

---

**Built with ❤️ for the cybersecurity community**
