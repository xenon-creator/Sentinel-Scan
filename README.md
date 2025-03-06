# Sentinel-Scan
# Sentinel Scan

## Overview
Sentinel Scan is a cybersecurity tool designed to fetch, analyze, and generate insights from threat intelligence data. It collects threat data from an API, aggregates the information, counts different threat types, and provides insights based on the frequency of detected threats.

## Features
- Fetches threat intelligence data from a specified API URL
- Aggregates and stores the collected data
- Analyzes threat types and counts occurrences
- Generates insights based on threat frequency

## Installation
### Prerequisites
Ensure you have the following installed on your system:
- Python 3.x
- `requests` library
- `pandas` library


## File Structure
```
Sentinel-Scan/
│-- data/
│   ├── aggregated_data.json
│   ├── threat_counts.json
│   ├── insights.json
│-- fetch_threat_data.py
│-- analyze_threats.py
│-- generate_insights.py
│-- README.md
```

## Example Output
**Threat Counts:**
```json
{
    "Malware": 5,
    "Phishing": 3,
    "Ransomware": 7
}
```

**Generated Insights:**
```json
[
    "High frequency of Malware detected: 5 occurrences.",
    "Moderate presence of Phishing: 3 occurrences.",
    "High frequency of Ransomware detected: 7 occurrences."
]
```



---
Happy scanning! 🚀

