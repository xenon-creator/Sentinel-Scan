# Contributing to Sentinel-Scan

Thank you for your interest in contributing to Sentinel-Scan! This project is maintained jointly:
- **Backend Architecture & Logic:** Saran Surya
- **Cloud Infrastructure, CI/CD, & DevOps:** Rahul Surya
- **Frontend Development:** Shared Responsibility

## Development Workflow

### 1. Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)

### 2. Local Setup via Docker (Recommended)
We use Docker to emulate our production environment locally.

```bash
# Start the full stack (MongoDB, Redis, FastAPI, React)
docker-compose up --build -d
```

### 3. Submitting Changes
1. Fork and Clone the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes.
4. Run tests and linting locally (they will also be checked by CI/CD GitHub Actions).
5. Submit a Pull Request.

## Governance & Roles
When discussing architectural changes, please tag the relevant maintainer:
- `@BackendLead` for Python/FastAPI/MongoDB optimizations.
- `@CloudArchitect` for any additions to Docker, CI/CD, deployment strategy, or infrastructure scaling.
