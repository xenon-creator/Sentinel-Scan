"""
Unit tests for the ZAP Parser module.

Tests alert-to-finding mapping, risk normalization, severity summary,
and JSON report generation using mock ZAP alert data.
"""

import pytest
from backend.plugins.zap.zap_parser import ZapParser


# ── Mock ZAP Alert Data ──────────────────────────────────────────────

MOCK_ALERTS = [
    {
        "alert": "SQL Injection",
        "risk": "High",
        "confidence": "Medium",
        "url": "http://testsite.com/login?id=1",
        "description": "SQL injection may be possible.",
        "solution": "Use parameterized queries.",
        "reference": "https://owasp.org/www-community/attacks/SQL_Injection\nhttps://cwe.mitre.org/data/definitions/89.html",
        "cweid": "89",
        "wascid": "19",
        "alertRef": "40018",
        "pluginId": "40018",
        "method": "GET",
        "param": "id",
        "attack": "1 OR 1=1",
        "evidence": "error in your SQL syntax",
        "other": "",
        "tags": {},
    },
    {
        "alert": "Cross Site Scripting (Reflected)",
        "risk": "High",
        "confidence": "High",
        "url": "http://testsite.com/search?q=test",
        "description": "Cross-site scripting (XSS) vulnerability.",
        "solution": "Encode output and validate input.",
        "reference": "https://owasp.org/www-community/attacks/xss/",
        "cweid": "79",
        "wascid": "8",
        "alertRef": "40012",
        "pluginId": "40012",
        "method": "GET",
        "param": "q",
        "attack": "<script>alert(1)</script>",
        "evidence": "<script>alert(1)</script>",
        "other": "",
        "tags": {},
    },
    {
        "alert": "Cookie Without Secure Flag",
        "risk": "Low",
        "confidence": "Medium",
        "url": "http://testsite.com/",
        "description": "A cookie has been set without the secure flag.",
        "solution": "Set the secure flag on all cookies.",
        "reference": "",
        "cweid": "614",
        "wascid": "13",
        "alertRef": "10011",
        "pluginId": "10011",
        "method": "GET",
        "param": "",
        "attack": "",
        "evidence": "Set-Cookie: session=abc123",
        "other": "",
        "tags": {},
    },
    {
        "alert": "X-Content-Type-Options Header Missing",
        "risk": "Informational",
        "confidence": "Medium",
        "url": "http://testsite.com/",
        "description": "The Anti-MIME-Sniffing header is not set.",
        "solution": "Set X-Content-Type-Options header to 'nosniff'.",
        "reference": "https://owasp.org/www-project-secure-headers/",
        "cweid": "-1",
        "wascid": "15",
        "alertRef": "10021",
        "pluginId": "10021",
        "method": "GET",
        "param": "",
        "attack": "",
        "evidence": "",
        "other": "",
        "tags": {},
    },
    # Duplicate of the first SQL Injection — should be de-duplicated
    {
        "alert": "SQL Injection",
        "risk": "High",
        "confidence": "Medium",
        "url": "http://testsite.com/login?id=1",
        "description": "SQL injection may be possible (duplicate).",
        "solution": "Use parameterized queries.",
        "reference": "",
        "cweid": "89",
        "wascid": "19",
        "alertRef": "40018",
        "pluginId": "40018",
        "method": "GET",
        "param": "id",
        "attack": "1 OR 1=1",
        "evidence": "",
        "other": "",
        "tags": {},
    },
]

TARGET = "http://testsite.com"


# ── Tests ────────────────────────────────────────────────────────────

class TestZapParser:

    def setup_method(self):
        self.parser = ZapParser(target=TARGET)

    def test_normalize_risk_string_values(self):
        assert self.parser.normalize_risk("High") == "high"
        assert self.parser.normalize_risk("Medium") == "medium"
        assert self.parser.normalize_risk("Low") == "low"
        assert self.parser.normalize_risk("Informational") == "info"

    def test_normalize_risk_numeric_values(self):
        assert self.parser.normalize_risk("3") == "high"
        assert self.parser.normalize_risk("2") == "medium"
        assert self.parser.normalize_risk("1") == "low"
        assert self.parser.normalize_risk("0") == "info"

    def test_normalize_risk_unknown_defaults_to_info(self):
        assert self.parser.normalize_risk("Unknown") == "info"
        assert self.parser.normalize_risk("") == "info"

    def test_normalize_confidence(self):
        assert self.parser.normalize_confidence("High") == "high"
        assert self.parser.normalize_confidence("Medium") == "medium"
        assert self.parser.normalize_confidence("Low") == "low"
        assert self.parser.normalize_confidence("User Confirmed") == "confirmed"

    def test_parse_alerts_deduplication(self):
        """Duplicate alerts (same name + URL) should be removed."""
        findings = self.parser.parse_alerts(MOCK_ALERTS)
        # 5 alerts but 1 is a duplicate → 4 unique findings
        assert len(findings) == 4

    def test_parse_alerts_field_mapping(self):
        findings = self.parser.parse_alerts(MOCK_ALERTS)
        sqli = findings[0]

        assert sqli["title"] == "SQL Injection"
        assert sqli["severity"] == "high"
        assert sqli["affected_asset"] == TARGET
        assert sqli["affected_component"] == "http://testsite.com/login?id=1"
        assert sqli["remediation"] == "Use parameterized queries."
        assert sqli["cwe_id"] == "CWE-89"
        assert len(sqli["references"]) == 2

    def test_parse_alerts_cwe_handling(self):
        """CWE -1 or 0 should result in None."""
        findings = self.parser.parse_alerts(MOCK_ALERTS)
        info_finding = [f for f in findings if f["title"] == "X-Content-Type-Options Header Missing"][0]
        assert info_finding["cwe_id"] is None

    def test_parse_alerts_metadata(self):
        findings = self.parser.parse_alerts(MOCK_ALERTS)
        sqli = findings[0]

        assert sqli["metadata"]["scanner"] == "zap"
        assert sqli["metadata"]["confidence"] == "medium"
        assert sqli["metadata"]["attack"] == "1 OR 1=1"
        assert sqli["metadata"]["param"] == "id"

    def test_build_severity_summary(self):
        findings = self.parser.parse_alerts(MOCK_ALERTS)
        summary = self.parser.build_severity_summary(findings)

        assert summary["high"] == 2      # SQL Injection + XSS
        assert summary["medium"] == 0
        assert summary["low"] == 1       # Cookie Without Secure Flag
        assert summary["info"] == 1      # X-Content-Type-Options
        assert summary["critical"] == 0

    def test_build_json_report_structure(self):
        findings = self.parser.parse_alerts(MOCK_ALERTS)
        report = self.parser.build_json_report(findings, scan_duration=42.5)

        assert report["target"] == TARGET
        assert report["scan_type"] == "zap"
        assert report["scan_duration_seconds"] == 42.5
        assert report["total_vulnerabilities"] == 4
        assert "severity_summary" in report
        assert "vulnerabilities" in report
        assert len(report["vulnerabilities"]) == 4

    def test_build_json_report_vulnerability_format(self):
        findings = self.parser.parse_alerts(MOCK_ALERTS)
        report = self.parser.build_json_report(findings)
        vuln = report["vulnerabilities"][0]

        assert "name" in vuln
        assert "risk" in vuln
        assert "url" in vuln
        assert "description" in vuln
        assert "solution" in vuln

    def test_empty_alerts_list(self):
        findings = self.parser.parse_alerts([])
        assert findings == []

        summary = self.parser.build_severity_summary([])
        assert all(v == 0 for v in summary.values())

        report = self.parser.build_json_report([])
        assert report["total_vulnerabilities"] == 0
