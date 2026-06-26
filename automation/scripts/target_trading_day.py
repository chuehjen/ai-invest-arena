#!/usr/bin/env python3
"""Print the target trading day given a reference date (default: NY today).

Used by .github/workflows/daily-prices.yml for idempotency check.

Usage:
    python3 target_trading_day.py                # NY today -> prev_trading_day
    python3 target_trading_day.py 2026-06-25     # given date -> prev_trading_day
"""
from datetime import date, timedelta
import os
import sys

# Allow running from repo root or scripts/
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

from holidays import is_market_closed  # noqa: E402


def prev_trading_day(d_str: str) -> str:
    d = date.fromisoformat(d_str) - timedelta(days=1)
    while is_market_closed(d.isoformat()):
        d -= timedelta(days=1)
    return d.isoformat()


def main() -> int:
    if len(sys.argv) > 1:
        ref = sys.argv[1]
    else:
        # NY today
        # We rely on TZ env being set by caller (TZ='America/New_York' python3 ...)
        # but fall back to local date if not.
        from datetime import datetime
        try:
            from zoneinfo import ZoneInfo
            ref = datetime.now(ZoneInfo("America/New_York")).strftime("%Y-%m-%d")
        except Exception:
            ref = date.today().isoformat()
    print(prev_trading_day(ref))
    return 0


if __name__ == "__main__":
    sys.exit(main())
