"""
ZAP Scanner — Main scanning plugin for OWASP ZAP integration.

Implements the full scanning pipeline:
  1. Target validation
  2. Spider scan (crawl endpoints)
  3. Passive scan (automatic analysis)
  4. Active scan (attack phase)
  5. Fetch & parse alerts

Supports ``quick`` and ``full`` scan intensity modes.
"""

import asyncio
import time
from datetime import datetime
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

from backend.core.logger import get_logger
from backend.plugins.base import ScannerPlugin, ScanResult
from backend.plugins.zap.zap_client import ZapClient, ZapConnectionError
from backend.plugins.zap.zap_parser import ZapParser

logger = get_logger("zap.scanner")

# Default timeout values (seconds)
DEFAULT_SPIDER_TIMEOUT = 300       # 5 minutes
DEFAULT_PASSIVE_SCAN_TIMEOUT = 120  # 2 minutes
DEFAULT_ACTIVE_SCAN_TIMEOUT = 1800  # 30 minutes
POLL_INTERVAL = 5                   # seconds between progress polls


class ZapScanner(ScannerPlugin):
    """
    OWASP ZAP web application vulnerability scanner plugin.

    Integrates with the ZAP daemon via its REST API to perform spider
    crawling, passive analysis, and active attack scanning.
    """

    name = "zap"
    version = "1.0.0"
    description = "Web application vulnerability scanner using OWASP ZAP"
    supported_targets = ["url", "domain"]

    def __init__(self, config: Optional[Dict] = None):
        super().__init__(config)
        self.client: Optional[ZapClient] = None
        self.parser: Optional[ZapParser] = None

        # Configuration with defaults
        self.proxy_host = self.config.get("proxy_host", "127.0.0.1")
        self.proxy_port = self.config.get("proxy_port", 8080)
        self.api_key = self.config.get("api_key", None)
        self.spider_timeout = self.config.get(
            "spider_timeout", DEFAULT_SPIDER_TIMEOUT
        )
        self.active_scan_timeout = self.config.get(
            "active_scan_timeout", DEFAULT_ACTIVE_SCAN_TIMEOUT
        )

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def initialize(self) -> bool:
        """
        Initialize the ZAP client and verify connectivity.

        Returns:
            True if ZAP is reachable, False otherwise.
        """
        try:
            self.client = ZapClient(
                proxy_host=self.proxy_host,
                proxy_port=self.proxy_port,
                api_key=self.api_key,
            )
            # Connection attempt runs synchronous HTTP — offload to thread
            await asyncio.to_thread(self.client.connect)
            self.initialized = True
            logger.info(
                "ZAP scanner initialized successfully",
                extra={"proxy": self.client.proxy_url},
            )
            return True
        except ZapConnectionError as e:
            logger.error(f"ZAP initialization failed: {e}")
            self.initialized = False
            return False
        except Exception as e:
            logger.error(f"Unexpected error during ZAP init: {e}")
            self.initialized = False
            return False

    async def cleanup(self):
        """Disconnect from ZAP and release resources."""
        if self.client:
            self.client.disconnect()
        self.initialized = False
        logger.info("ZAP scanner cleaned up")

    # ------------------------------------------------------------------
    # Target validation
    # ------------------------------------------------------------------

    def validate_target(self, target: str) -> bool:
        """
        Validate that the target is a well-formed URL.

        Logs a warning for targets that are not localhost/internal,
        reminding the operator about authorization.
        """
        if not super().validate_target(target):
            return False

        parsed = urlparse(target)

        # Must have a scheme (http/https)
        if parsed.scheme not in ("http", "https"):
            logger.error(
                f"Invalid target scheme: '{parsed.scheme}'. "
                "Target must start with http:// or https://"
            )
            return False

        # Must have a hostname
        if not parsed.hostname:
            logger.error("Target URL has no hostname")
            return False

        # Authorization warning for external targets
        internal_hosts = {"localhost", "127.0.0.1", "::1", "0.0.0.0"}
        if parsed.hostname not in internal_hosts and not parsed.hostname.endswith(
            ".local"
        ):
            logger.warning(
                f"⚠️  EXTERNAL TARGET DETECTED: {parsed.hostname} — "
                "Ensure you have explicit authorization to scan this target. "
                "Unauthorized scanning may be illegal."
            )

        return True

    # ------------------------------------------------------------------
    # Individual scan phases (independently callable)
    # ------------------------------------------------------------------

    async def spider_scan(
        self,
        target: str,
        timeout: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Phase 2: Spider/crawl the target to discover all endpoints.

        Args:
            target: Target URL.
            timeout: Maximum time in seconds (default: spider_timeout config).

        Returns:
            Dict with spider results including URLs found.
        """
        _timeout = timeout or self.spider_timeout
        logger.info(f"🕷️  Starting spider scan on {target} (timeout: {_timeout}s)")

        def _run_spider():
            zap = self.client.zap
            scan_id = zap.spider.scan(url=target)
            start_time = time.time()

            while True:
                elapsed = time.time() - start_time
                if elapsed > _timeout:
                    logger.warning(
                        f"Spider scan timed out after {_timeout}s"
                    )
                    zap.spider.stop(scan_id)
                    break

                progress = int(zap.spider.status(scan_id))
                logger.debug(f"Spider progress: {progress}%")
                if progress >= 100:
                    break
                time.sleep(POLL_INTERVAL)

            # Collect results
            urls = zap.spider.results(scan_id)
            logger.info(
                f"🕷️  Spider completed — discovered {len(urls)} URLs"
            )
            return {
                "scan_id": scan_id,
                "urls_found": len(urls),
                "urls": urls[:100],  # Cap at 100 for logging
                "timed_out": (time.time() - start_time) > _timeout,
            }

        return await asyncio.to_thread(_run_spider)

    async def wait_for_passive_scan(
        self,
        timeout: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Phase 3: Wait for the passive scan queue to drain.

        ZAP automatically performs passive scanning on all proxied traffic.
        This method waits until the queue is empty.

        Args:
            timeout: Maximum wait time in seconds.

        Returns:
            Dict with passive scan status.
        """
        _timeout = timeout or DEFAULT_PASSIVE_SCAN_TIMEOUT
        logger.info(f"🔍 Waiting for passive scan to complete (timeout: {_timeout}s)")

        def _wait_passive():
            zap = self.client.zap
            start_time = time.time()

            while True:
                elapsed = time.time() - start_time
                if elapsed > _timeout:
                    logger.warning("Passive scan wait timed out")
                    break

                records_remaining = int(zap.pscan.records_to_scan)
                logger.debug(
                    f"Passive scan queue: {records_remaining} records remaining"
                )
                if records_remaining == 0:
                    break
                time.sleep(2)

            logger.info("🔍 Passive scan completed")
            return {
                "status": "completed",
                "timed_out": (time.time() - start_time) > _timeout,
            }

        return await asyncio.to_thread(_wait_passive)

    async def active_scan(
        self,
        target: str,
        timeout: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Phase 4: Run active scan (attack phase) against the target.

        This sends real attack payloads — only use on authorized targets.

        Args:
            target: Target URL.
            timeout: Maximum time in seconds (default: active_scan_timeout config).

        Returns:
            Dict with active scan results.
        """
        _timeout = timeout or self.active_scan_timeout
        logger.info(f"⚔️  Starting active scan on {target} (timeout: {_timeout}s)")

        def _run_active():
            zap = self.client.zap
            scan_id = zap.ascan.scan(url=target)
            start_time = time.time()

            while True:
                elapsed = time.time() - start_time
                if elapsed > _timeout:
                    logger.warning(
                        f"Active scan timed out after {_timeout}s"
                    )
                    zap.ascan.stop(scan_id)
                    break

                progress = int(zap.ascan.status(scan_id))
                logger.debug(f"Active scan progress: {progress}%")
                if progress >= 100:
                    break
                time.sleep(POLL_INTERVAL)

            elapsed = time.time() - start_time
            logger.info(f"⚔️  Active scan completed in {elapsed:.1f}s")
            return {
                "scan_id": scan_id,
                "duration_seconds": round(elapsed, 2),
                "timed_out": elapsed > _timeout,
            }

        return await asyncio.to_thread(_run_active)

    async def fetch_alerts(self, target: str) -> List[Dict[str, Any]]:
        """
        Phase 5: Fetch all alerts from ZAP for the given target.

        Returns:
            List of raw ZAP alert dictionaries.
        """
        logger.info(f"📋 Fetching alerts for {target}")

        def _fetch():
            return self.client.get_alerts(base_url=target)

        alerts = await asyncio.to_thread(_fetch)
        logger.info(f"📋 Retrieved {len(alerts)} alerts from ZAP")
        return alerts

    # ------------------------------------------------------------------
    # Main scan method (ScannerPlugin interface)
    # ------------------------------------------------------------------

    async def scan(
        self, target: str, options: Optional[Dict] = None
    ) -> ScanResult:
        """
        Execute the full ZAP scanning pipeline.

        Args:
            target: URL to scan.
            options: Scan options dict. Supports:
                - ``scan_intensity``: ``"quick"`` or ``"full"`` (default: ``"full"``).
                - ``spider_timeout``: Override spider timeout.
                - ``active_scan_timeout``: Override active scan timeout.

        Returns:
            ``ScanResult`` with parsed findings.
        """
        if not self.initialized:
            init_ok = await self.initialize()
            if not init_ok:
                return ScanResult(
                    scanner_name=self.name,
                    target=target,
                    status="failed",
                    findings=[],
                    error_message="Failed to connect to ZAP daemon",
                )

        options = options or {}
        intensity = options.get("scan_intensity", "full")
        spider_timeout = options.get("spider_timeout", self.spider_timeout)
        active_timeout = options.get(
            "active_scan_timeout", self.active_scan_timeout
        )

        self.parser = ZapParser(target)
        start_time = datetime.utcnow()

        logger.info(
            f"🚀 Starting ZAP scan on {target}",
            extra={"intensity": intensity},
        )

        try:
            # Step 1: Open URL through ZAP proxy to seed sites tree
            await asyncio.to_thread(self.client.open_url, target)

            # Step 2: Spider scan
            spider_result = await self.spider_scan(target, timeout=spider_timeout)

            # Step 3: Wait for passive scan
            await self.wait_for_passive_scan()

            # Step 4: Active scan (only in "full" mode)
            active_result = None
            if intensity == "full":
                active_result = await self.active_scan(
                    target, timeout=active_timeout
                )
            else:
                logger.info(
                    "⏩ Skipping active scan (quick mode)"
                )

            # Step 5: Fetch and parse alerts
            raw_alerts = await self.fetch_alerts(target)
            findings = self.parser.parse_alerts(raw_alerts)

            scan_duration = (datetime.utcnow() - start_time).total_seconds()

            # Build metadata
            metadata = {
                "intensity": intensity,
                "spider": spider_result,
                "passive_scan": {"status": "completed"},
                "alerts_raw_count": len(raw_alerts),
                "alerts_parsed_count": len(findings),
            }
            if active_result:
                metadata["active_scan"] = active_result

            severity_summary = self.parser.build_severity_summary(findings)
            logger.info(
                f"✅ ZAP scan completed on {target}",
                extra={
                    "duration": f"{scan_duration:.1f}s",
                    "findings": len(findings),
                    "severity": severity_summary,
                },
            )

            return ScanResult(
                scanner_name=self.name,
                target=target,
                status="success",
                findings=findings,
                raw_output=None,
                scan_duration=scan_duration,
                metadata=metadata,
            )

        except ZapConnectionError as e:
            scan_duration = (datetime.utcnow() - start_time).total_seconds()
            logger.error(f"ZAP connection error during scan: {e}")
            return ScanResult(
                scanner_name=self.name,
                target=target,
                status="failed",
                findings=[],
                error_message=f"ZAP connection error: {e}",
                scan_duration=scan_duration,
            )
        except Exception as e:
            scan_duration = (datetime.utcnow() - start_time).total_seconds()
            logger.error(f"Unexpected error during ZAP scan: {e}", exc_info=True)
            return ScanResult(
                scanner_name=self.name,
                target=target,
                status="failed",
                findings=[],
                error_message=f"Scan failed: {e}",
                scan_duration=scan_duration,
            )

    # ------------------------------------------------------------------
    # Output parser (ScannerPlugin interface)
    # ------------------------------------------------------------------

    def parse_output(self, raw_output: str) -> List[Dict[str, Any]]:
        """
        Parse raw output. For ZAP, parsing is handled via ``ZapParser``
        directly from alert dicts, so this is a no-op fallback.
        """
        return []
