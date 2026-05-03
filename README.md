# 🛡️ Sentinel-Scan

> **Next-Generation Unified Threat Intelligence & Vulnerability Scanning Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)

Sentinel-Scan is an enterprise-grade cybersecurity platform designed for SOC teams, DevSecOps engineers, and security professionals. It unifies network scanning, web application vulnerability detection, and automated threat intelligence enrichment into a single, scalable ecosystem.

---

## ✨ Comprehensive Feature Set

### 🔍 Multi-Scanner Architecture
A robust plugin system that dynamically loads and orchestrates multiple security scanners:
*   **Network Scanning (Nmap):** Performs port scanning, service detection, and OS fingerprinting. Automatically categorizes severity based on exposed critical ports and services.
*   **Web Application Scanning (OWASP ZAP):** Deep integration with the OWASP ZAP daemon. Features a multi-phase pipeline: target validation, spider crawling, passive analysis, and active attacking (with authorization warnings). Supports `quick` (spider/passive) and `full` (active) scan intensities.

### 🧠 Threat Intelligence Enrichment
Automatically enriches findings with contextual data from global threat feeds:
*   **NVD (National Vulnerability Database):** Fetches CVSS scores, vectors, and detailed vulnerability descriptions for discovered CVEs.
*   **VirusTotal:** Scans IPs and domains against 70+ antivirus scanners and URL/domain blocklisting services.
*   **AbuseIPDB:** Checks IP addresses for reported malicious activity and provides confidence scores.
*   **OSV (Open Source Vulnerabilities):** Queries the OSV database for package vulnerabilities.

### 📊 Advanced Reporting Engine
Translates raw scanner data into actionable insights:
*   **HTML Reports:** Generates responsive, dark-themed HTML reports using Jinja2 templates. Features visual severity bar charts, color-coded findings, and print support.
*   **JSON Reports:** Produces structured JSON data for easy integration with external SIEMs, dashboards, or CI/CD pipelines.

### 💻 Command-Line Interface (CLI)
A powerful, standalone CLI (`sentinel_cli.py`) for engineers who prefer the terminal:
*   Initiate scans directly from the command line.
*   Real-time progress bars for scan phases (e.g., ZAP spidering, active scanning).
*   Built-in target authorization warnings to prevent accidental scanning of unauthorized external domains.
*   Options to export results directly to HTML or JSON.

### 🔌 API-First Design
Built on FastAPI, the entire platform is accessible via a RESTful API:
*   `/api/v1/scans`: Start, stop, and monitor multi-tool scans.
*   `/api/v1/findings`: Retrieve, filter, and update vulnerabilities.
*   `/api/v1/assets`: Manage target assets and track their risk scores over time.
*   `/api/v1/zap`: Dedicated endpoints for precise control over the ZAP integration.

---

## 🏗️ Architecture

Sentinel-Scan utilizes a modern, decoupled microservices architecture:

1.  **FastAPI Backend:** The core orchestration engine. Handles API requests, coordinates plugins, and manages the database.
2.  **MongoDB:** The primary datastore for assets, scan histories, and vulnerabilities. Provides flexible schema support for diverse findings.
3.  **Redis & Celery (Planned/Partial):** Used for background task queuing, ensuring long-running scans don't block the API.
4.  **Scanner Daemons (e.g., ZAP):** External tools running in their own containers, communicated with via their respective APIs.

---

## 🚀 Getting Started

### Prerequisites
*   Docker & Docker Compose
*   Python 3.11+ (for local CLI usage)

### Installation (Docker Compose)

1.  Clone the repository and prepare the environment:
    ```bash
    git clone <repository_url>
    cd sentinel-scan
    cp .env.example .env
    ```
2.  Update the `.env` file with your API keys (VirusTotal, NVD, AbuseIPDB).
3.  Start the infrastructure (MongoDB, Redis, ZAP Daemon, FastAPI):
    ```bash
    docker-compose up -d
    ```

### Using the CLI (`sentinel_cli.py`)

Ensure your environment is set up (or you are connected to the Docker network) and run:

```bash
# 1. Check if the ZAP daemon is running and reachable
python sentinel_cli.py --zap-status

# 2. Run a "quick" web scan (Spider + Passive Analysis only)
python sentinel_cli.py --target http://example.local --scan zap --intensity quick

# 3. Run a "full" active web scan and export an HTML report
python sentinel_cli.py --target http://example.local --scan zap --intensity full --export html
```

### Using the REST API

```bash
# Start a ZAP scan via API
curl -X POST http://localhost:8000/api/v1/zap/scan \
  -H "Content-Type: application/json" \
  -d '{"target": "http://example.local", "intensity": "quick"}'

# Check the status of a specific scan
curl http://localhost:8000/api/v1/zap/scan/<scan_id>/status

# Download the HTML report for a completed scan
curl -o report.html http://localhost:8000/api/v1/zap/scan/<scan_id>/report/html
```

---

## 📂 Project Structure Overview

*   `backend/core/`: Orchestration, plugin management, and structured logging.
*   `backend/plugins/`: Scanner integrations (`base.py`, `nmap_scanner.py`, `zap/`).
*   `backend/services/`: Threat intel enrichment and HTML/JSON report generation.
*   `backend/api/routes/`: FastAPI endpoints for assets, findings, scans, and ZAP.
*   `backend/models/`: Pydantic models defining the data schemas.
*   `backend/templates/`: Jinja2 HTML templates for reporting.
*   `sentinel_cli.py`: The standalone command-line interface.

---

## ⚠️ Disclaimer & Authorization

**Always ensure you have explicit, written authorization to scan a target.** 
Features like the OWASP ZAP "full" scan mode send real attack payloads to the target. Sentinel-Scan includes warnings for external domains, but it is the user's responsibility to comply with all applicable laws and regulations.
