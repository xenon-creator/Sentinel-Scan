#!/usr/bin/env python3
"""
Sentinel-Scan CLI — Command-line interface for vulnerability scanning.

Usage:
    python sentinel_cli.py --target http://example.com --scan zap
    python sentinel_cli.py --target http://example.com --scan zap --intensity quick
    python sentinel_cli.py --target http://example.com --scan zap --export html
    python sentinel_cli.py --zap-status
"""

import argparse
import asyncio
import json
import os
import sys
import time

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


# ── ANSI Colors ──────────────────────────────────────────────────────
class Colors:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    GRAY = "\033[90m"
    BG_RED = "\033[41m"
    BG_GREEN = "\033[42m"
    BG_YELLOW = "\033[43m"
    BG_BLUE = "\033[44m"


SEVERITY_COLORS = {
    "critical": Colors.BG_RED,
    "high": Colors.RED,
    "medium": Colors.YELLOW,
    "low": Colors.GREEN,
    "info": Colors.BLUE,
}

BANNER = f"""
{Colors.CYAN}{Colors.BOLD}
  ____  _____ _   _ _____ ___ _   _ _____ _
 / ___|| ____| \\ | |_   _|_ _| \\ | | ____| |
 \\___ \\|  _| |  \\| | | |  | ||  \\| |  _| | |
  ___) | |___| |\\  | | |  | || |\\  | |___| |___
 |____/|_____|_| \\_| |_| |___|_| \\_|_____|_____|
  {Colors.MAGENTA}--- S C A N {Colors.RESET}{Colors.GRAY}  Professional Vulnerability Scanner  {Colors.RESET}
"""


def print_header(text: str):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'━' * 60}{Colors.RESET}")
    print(f"  {Colors.BOLD}{text}{Colors.RESET}")
    print(f"{Colors.CYAN}{'━' * 60}{Colors.RESET}")


def print_severity_badge(severity: str) -> str:
    color = SEVERITY_COLORS.get(severity.lower(), Colors.GRAY)
    return f"{color}{Colors.BOLD} {severity.upper()} {Colors.RESET}"


def print_progress(phase: str, progress: int):
    bar_length = 30
    filled = int(bar_length * progress / 100)
    bar = "█" * filled + "░" * (bar_length - filled)
    sys.stdout.write(f"\r  {Colors.CYAN}{phase}{Colors.RESET} [{bar}] {progress}%")
    sys.stdout.flush()
    if progress >= 100:
        print()


def confirm_scan(target: str) -> bool:
    """Display authorization warning and request confirmation."""
    print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  WARNING — AUTHORIZATION CHECK{Colors.RESET}")
    print(f"  Target: {Colors.BOLD}{target}{Colors.RESET}")
    print(f"  {Colors.YELLOW}Active scanning sends real attack payloads to the target.")
    print(f"  Ensure you have explicit authorization to scan this target.")
    print(f"  Unauthorized scanning may violate laws and regulations.{Colors.RESET}\n")

    try:
        response = input(f"  {Colors.BOLD}Do you have authorization to scan this target? (y/N): {Colors.RESET}")
        return response.strip().lower() in ("y", "yes")
    except (KeyboardInterrupt, EOFError):
        print()
        return False


# ── ZAP Status Check ─────────────────────────────────────────────────

async def check_zap_status(args):
    """Check if the ZAP daemon is reachable."""
    from backend.plugins.zap.zap_client import ZapClient, ZapConnectionError

    host = args.zap_host or "127.0.0.1"
    port = args.zap_port or 8080

    print_header("ZAP Daemon Status")
    print(f"  Proxy: {Colors.BOLD}http://{host}:{port}{Colors.RESET}")

    client = ZapClient(proxy_host=host, proxy_port=port, api_key=args.zap_api_key)
    try:
        client.connect()
        version = client.get_version()
        print(f"  Status: {Colors.GREEN}{Colors.BOLD}✅ CONNECTED{Colors.RESET}")
        print(f"  Version: {Colors.BOLD}{version}{Colors.RESET}")
        return True
    except ZapConnectionError as e:
        print(f"  Status: {Colors.RED}{Colors.BOLD}❌ NOT REACHABLE{Colors.RESET}")
        print(f"  Error: {Colors.RED}{e}{Colors.RESET}")
        print(f"\n  {Colors.GRAY}Tip: Start ZAP with:")
        print(f"    zap.sh -daemon -port 8080 -config api.disablekey=true{Colors.RESET}")
        return False


# ── ZAP Scan ─────────────────────────────────────────────────────────

async def run_zap_scan(args):
    """Execute a ZAP scan via the plugin system."""
    from backend.plugins.zap.zap_scanner import ZapScanner
    from backend.plugins.zap.zap_parser import ZapParser
    from backend.services.report_generator import ReportGenerator

    target = args.target
    intensity = args.intensity or "full"

    print_header(f"ZAP Web Scan — {intensity.upper()} mode")
    print(f"  Target:    {Colors.BOLD}{target}{Colors.RESET}")
    print(f"  Intensity: {Colors.BOLD}{intensity}{Colors.RESET}")

    # Authorization confirmation for external targets
    from urllib.parse import urlparse
    parsed = urlparse(target)
    internal = {"localhost", "127.0.0.1", "::1", "0.0.0.0"}
    if parsed.hostname and parsed.hostname not in internal:
        if not confirm_scan(target):
            print(f"\n  {Colors.RED}Scan cancelled by user.{Colors.RESET}")
            return

    # Configure and run scanner
    config = {
        "proxy_host": args.zap_host or "127.0.0.1",
        "proxy_port": args.zap_port or 8080,
        "api_key": args.zap_api_key,
    }
    scanner = ZapScanner(config=config)

    print(f"\n  {Colors.CYAN}Connecting to ZAP daemon...{Colors.RESET}")
    init_ok = await scanner.initialize()
    if not init_ok:
        print(f"  {Colors.RED}❌ Failed to connect to ZAP. Is it running?{Colors.RESET}")
        return

    print(f"  {Colors.GREEN}✅ Connected to ZAP{Colors.RESET}\n")

    options = {"scan_intensity": intensity}
    start_time = time.time()

    result = await scanner.scan(target, options)
    elapsed = time.time() - start_time

    # Display results
    print_header("Scan Results")
    print(f"  Status:   {Colors.GREEN if result.status == 'success' else Colors.RED}"
          f"{Colors.BOLD}{result.status.upper()}{Colors.RESET}")
    print(f"  Duration: {Colors.BOLD}{elapsed:.1f}s{Colors.RESET}")
    print(f"  Findings: {Colors.BOLD}{len(result.findings)}{Colors.RESET}")

    if result.error_message:
        print(f"  Error:    {Colors.RED}{result.error_message}{Colors.RESET}")

    if result.findings:
        # Severity summary
        parser = ZapParser(target)
        summary = parser.build_severity_summary(result.findings)

        print(f"\n  {Colors.BOLD}Severity Breakdown:{Colors.RESET}")
        for sev, count in summary.items():
            if count > 0:
                badge = print_severity_badge(sev)
                print(f"    {badge} {count}")

        # List findings
        print(f"\n  {Colors.BOLD}Vulnerabilities Found:{Colors.RESET}")
        for i, finding in enumerate(result.findings[:20], 1):
            sev = finding.get("severity", "info")
            badge = print_severity_badge(sev)
            title = finding.get("title", "Unknown")
            url = finding.get("affected_component", "")
            print(f"  {Colors.GRAY}{i:3}.{Colors.RESET} {badge} {title}")
            if url:
                print(f"       {Colors.GRAY}{url}{Colors.RESET}")

        if len(result.findings) > 20:
            print(f"\n  {Colors.GRAY}... and {len(result.findings) - 20} more findings{Colors.RESET}")

    # Export report
    if args.export:
        scan_id = f"cli_{int(time.time())}"
        generator = ReportGenerator(output_dir=args.output_dir or "./reports")

        if args.export in ("json", "both"):
            path = generator.generate_json_report(
                scan_id=scan_id, target=target, scan_type="zap",
                findings=result.findings, scan_duration=elapsed,
            )
            print(f"\n  {Colors.GREEN}📄 JSON report: {path}{Colors.RESET}")

        if args.export in ("html", "both"):
            path = generator.generate_html_report(
                scan_id=scan_id, target=target, scan_type="zap",
                findings=result.findings, scan_duration=elapsed,
            )
            print(f"  {Colors.GREEN}📄 HTML report: {path}{Colors.RESET}")

    await scanner.cleanup()
    print(f"\n{Colors.GREEN}{Colors.BOLD}✅ Scan complete.{Colors.RESET}\n")


# ── Argument Parsing ─────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="sentinel_cli",
        description="Sentinel-Scan — Professional Vulnerability Scanner CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python sentinel_cli.py --target http://example.com --scan zap
  python sentinel_cli.py --target http://example.com --scan zap --intensity quick
  python sentinel_cli.py --target http://example.com --scan zap --export html
  python sentinel_cli.py --zap-status
        """,
    )

    # Target and scan type
    parser.add_argument("--target", "-t", help="Target URL or IP to scan")
    parser.add_argument(
        "--scan", "-s", choices=["zap", "nmap"],
        help="Scanner to use (zap for web scanning)",
    )

    # ZAP options
    parser.add_argument(
        "--intensity", "-i", choices=["quick", "full"], default="full",
        help="Scan intensity: quick (spider+passive) or full (all phases)",
    )
    parser.add_argument("--zap-status", action="store_true", help="Check ZAP daemon status")
    parser.add_argument("--zap-host", default=None, help="ZAP proxy host (default: 127.0.0.1)")
    parser.add_argument("--zap-port", type=int, default=None, help="ZAP proxy port (default: 8080)")
    parser.add_argument("--zap-api-key", default=None, help="ZAP API key")

    # Output options
    parser.add_argument(
        "--export", "-e", choices=["json", "html", "both"],
        help="Export report format",
    )
    parser.add_argument("--output-dir", "-o", default="./reports", help="Report output directory")

    return parser


# ── Main ─────────────────────────────────────────────────────────────

def main():
    print(BANNER)
    parser = build_parser()
    args = parser.parse_args()

    # ZAP status check
    if args.zap_status:
        asyncio.run(check_zap_status(args))
        return

    # Require target and scan type for scanning
    if not args.target or not args.scan:
        parser.print_help()
        print(f"\n{Colors.RED}Error: --target and --scan are required for scanning.{Colors.RESET}")
        sys.exit(1)

    # Route to appropriate scanner
    if args.scan == "zap":
        asyncio.run(run_zap_scan(args))
    else:
        print(f"{Colors.YELLOW}Scanner '{args.scan}' CLI support coming soon.{Colors.RESET}")
        sys.exit(1)


if __name__ == "__main__":
    main()
