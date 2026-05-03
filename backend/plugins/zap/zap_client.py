"""
ZAP Client — Low-level connection wrapper around the OWASP ZAP API.

Handles connection management, health checks, and provides a clean interface
to the ZAP daemon for other modules to consume.
"""

import time
from typing import Optional

from backend.core.logger import get_logger

logger = get_logger("zap.client")


class ZapConnectionError(Exception):
    """Raised when the ZAP daemon is unreachable or connection fails."""
    pass


class ZapClient:
    """
    Manages the connection to the OWASP ZAP daemon.

    Args:
        proxy_host: ZAP proxy host address (default: 127.0.0.1).
        proxy_port: ZAP proxy port (default: 8080).
        api_key: Optional ZAP API key. If None, ZAP must be started
                 with ``-config api.disablekey=true``.
    """

    def __init__(
        self,
        proxy_host: str = "127.0.0.1",
        proxy_port: int = 8080,
        api_key: Optional[str] = None,
    ):
        self.proxy_host = proxy_host
        self.proxy_port = proxy_port
        self.api_key = api_key or ""
        self.proxy_url = f"http://{proxy_host}:{proxy_port}"
        self._zap = None
        self._connected = False

    @property
    def is_connected(self) -> bool:
        """Check whether the client has an active connection to ZAP."""
        return self._connected

    @property
    def zap(self):
        """Return the underlying ZAPv2 instance. Raises if not connected."""
        if not self._connected or self._zap is None:
            raise ZapConnectionError(
                "ZAP client is not connected. Call connect() first."
            )
        return self._zap

    def connect(self) -> "ZapClient":
        """
        Establish connection to the ZAP daemon and verify it is reachable.

        Returns:
            self — for method chaining.

        Raises:
            ZapConnectionError: If ZAP is not running or unreachable.
        """
        try:
            from zapv2 import ZAPv2
        except ImportError:
            raise ZapConnectionError(
                "The 'zaproxy' package is not installed. "
                "Install it with: pip install zaproxy"
            )

        try:
            proxies = {
                "http": self.proxy_url,
                "https": self.proxy_url,
            }
            self._zap = ZAPv2(apikey=self.api_key, proxies=proxies)

            # Verify ZAP is reachable by fetching its version
            version = self._zap.core.version
            logger.info(
                "Connected to OWASP ZAP",
                extra={"zap_version": version, "proxy": self.proxy_url},
            )
            self._connected = True
            return self

        except Exception as e:
            self._connected = False
            self._zap = None
            raise ZapConnectionError(
                f"Failed to connect to ZAP at {self.proxy_url}. "
                f"Ensure ZAP is running in daemon mode. Error: {e}"
            ) from e

    def disconnect(self):
        """Clean up the ZAP client connection."""
        self._zap = None
        self._connected = False
        logger.info("Disconnected from ZAP")

    def get_version(self) -> str:
        """Return the ZAP daemon version string."""
        return self.zap.core.version

    def open_url(self, url: str, retries: int = 3, delay: float = 2.0):
        """
        Access a URL through ZAP's proxy to seed the sites tree.

        Args:
            url: The target URL to open.
            retries: Number of retry attempts on failure.
            delay: Seconds to wait between retries.
        """
        for attempt in range(1, retries + 1):
            try:
                self.zap.urlopen(url)
                time.sleep(delay)
                logger.debug(f"Opened URL through ZAP proxy: {url}")
                return
            except Exception as e:
                if attempt == retries:
                    logger.warning(
                        f"Failed to open URL through ZAP after {retries} attempts: {e}"
                    )
                    raise
                time.sleep(delay)

    def get_alerts(self, base_url: str, start: int = 0, count: int = -1) -> list:
        """
        Retrieve all alerts for a given base URL.

        Args:
            base_url: The target URL to filter alerts by.
            start: Starting offset.
            count: Maximum number of alerts to return (-1 for all).

        Returns:
            List of alert dictionaries from ZAP.
        """
        if count == -1:
            return self.zap.core.alerts(baseurl=base_url)
        return self.zap.core.alerts(baseurl=base_url, start=start, count=count)
