"""
OWASP ZAP Scanner Plugin for Sentinel-Scan.

Provides web application vulnerability scanning via the ZAP API.
"""

from backend.plugins.zap.zap_scanner import ZapScanner

__all__ = ["ZapScanner"]
