"""
Sentinel-Scan Structured Logging System.

Provides centralized, structured logging with console and file handlers.
ZAP-specific logs are written to a dedicated log file.
"""

import logging
import os
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler
from typing import Optional


# Default log directory
LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)
))), "logs")


class StructuredFormatter(logging.Formatter):
    """
    Custom formatter that produces structured, readable log lines.

    Format: [TIMESTAMP] [LEVEL] [LOGGER] MESSAGE | key=value ...
    """

    LEVEL_COLORS = {
        "DEBUG": "\033[36m",     # Cyan
        "INFO": "\033[32m",      # Green
        "WARNING": "\033[33m",   # Yellow
        "ERROR": "\033[31m",     # Red
        "CRITICAL": "\033[41m",  # Red background
    }
    RESET = "\033[0m"

    def __init__(self, use_colors: bool = True):
        super().__init__()
        self.use_colors = use_colors

    def format(self, record: logging.LogRecord) -> str:
        timestamp = datetime.fromtimestamp(record.created).strftime(
            "%Y-%m-%d %H:%M:%S"
        )
        level = record.levelname

        if self.use_colors:
            color = self.LEVEL_COLORS.get(level, "")
            level_str = f"{color}{level:>8}{self.RESET}"
        else:
            level_str = f"{level:>8}"

        # Base message
        msg = f"[{timestamp}] [{level_str}] [{record.name}] {record.getMessage()}"

        # Append structured extra fields if present
        extras = {
            k: v
            for k, v in record.__dict__.items()
            if k not in logging.LogRecord(
                "", 0, "", 0, "", (), None
            ).__dict__
            and k not in ("message", "msg", "args", "exc_info", "exc_text",
                          "stack_info", "taskName")
        }
        if extras:
            extra_str = " | ".join(f"{k}={v}" for k, v in extras.items())
            msg += f" | {extra_str}"

        # Append exception info if present
        if record.exc_info and not record.exc_text:
            record.exc_text = self.formatException(record.exc_info)
        if record.exc_text:
            msg += f"\n{record.exc_text}"

        return msg


def _ensure_log_dir(log_dir: str) -> None:
    """Create the log directory if it does not exist."""
    os.makedirs(log_dir, exist_ok=True)


def get_logger(
    name: str,
    log_file: Optional[str] = None,
    level: int = logging.DEBUG,
    log_dir: Optional[str] = None,
) -> logging.Logger:
    """
    Create or retrieve a structured logger.

    Args:
        name: Logger name (e.g., ``"zap.client"``, ``"zap.scanner"``).
        log_file: Optional log filename. Defaults to ``"zap.log"`` for
                  any logger whose name starts with ``"zap."``.
        level: Logging level (default: DEBUG).
        log_dir: Directory for log files (default: ``<project>/logs``).

    Returns:
        Configured ``logging.Logger`` instance.
    """
    logger = logging.getLogger(name)

    # Avoid adding duplicate handlers if logger already configured
    if logger.handlers:
        return logger

    logger.setLevel(level)
    logger.propagate = False

    # Console handler — INFO level with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(StructuredFormatter(use_colors=True))
    logger.addHandler(console_handler)

    # File handler — DEBUG level, no colors
    _log_dir = log_dir or LOG_DIR
    _ensure_log_dir(_log_dir)

    if log_file is None:
        if name.startswith("zap"):
            log_file = "zap.log"
        else:
            log_file = "sentinel_scan.log"

    file_path = os.path.join(_log_dir, log_file)
    file_handler = RotatingFileHandler(
        file_path,
        maxBytes=10 * 1024 * 1024,  # 10 MB
        backupCount=5,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(StructuredFormatter(use_colors=False))
    logger.addHandler(file_handler)

    return logger
