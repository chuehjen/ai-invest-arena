"""US stock market (NYSE) holiday calendar — used by daily cron to skip closed days.

CLI:
    python3 holidays.py YYYY-MM-DD
        Prints "CLOSED" or "OPEN" + sets exit code (0 always; check stdout).

Library:
    from holidays import is_market_closed, market_closed_reason
    is_market_closed("2026-07-03")  # -> True
    market_closed_reason("2026-07-03")  # -> "Independence Day (observed)"

Notes:
- Includes weekends (Sat/Sun automatically closed).
- Half-day early-close sessions (Black Friday, Christmas Eve) are NOT counted as
  closed — they still produce a real settlement close. Add them to EARLY_CLOSE if
  you want to surface them.
- Maintenance: extend YEARLY_HOLIDAYS map every November when NYSE publishes the
  next year's schedule (usually 2 years ahead).
"""
from datetime import date
import sys
from typing import Dict, Optional

# NYSE full-day closures. Source: NYSE annual holiday calendar.
# Format: "YYYY-MM-DD": "Holiday name"
NYSE_HOLIDAYS: Dict[str, str] = {
    # ---- 2026 ----
    "2026-01-01": "New Year's Day",
    "2026-01-19": "Martin Luther King Jr. Day",
    "2026-02-16": "Presidents' Day",
    "2026-04-03": "Good Friday",
    "2026-05-25": "Memorial Day",
    "2026-06-19": "Juneteenth",
    "2026-07-03": "Independence Day (observed)",  # Jul 4, 2026 is Saturday
    "2026-09-07": "Labor Day",
    "2026-11-26": "Thanksgiving Day",
    "2026-12-25": "Christmas Day",
    # ---- 2027 ----
    "2027-01-01": "New Year's Day",
    "2027-01-18": "Martin Luther King Jr. Day",
    "2027-02-15": "Presidents' Day",
    "2027-03-26": "Good Friday",
    "2027-05-31": "Memorial Day",
    "2027-06-18": "Juneteenth (observed)",        # Jun 19, 2027 is Saturday
    "2027-07-05": "Independence Day (observed)",  # Jul 4, 2027 is Sunday
    "2027-09-06": "Labor Day",
    "2027-11-25": "Thanksgiving Day",
    "2027-12-24": "Christmas Day (observed)",     # Dec 25, 2027 is Saturday
}

# Early-close days (half-day, market closes 13:00 ET). NOT treated as closed.
EARLY_CLOSE: Dict[str, str] = {
    "2026-11-27": "Day after Thanksgiving (early close 13:00 ET)",
    "2026-12-24": "Christmas Eve (early close 13:00 ET)",
    "2027-11-26": "Day after Thanksgiving (early close 13:00 ET)",
}


def is_market_closed(d: str) -> bool:
    """Return True if NYSE has a full-day closure on date d (YYYY-MM-DD)."""
    parsed = date.fromisoformat(d)
    if parsed.weekday() >= 5:  # Saturday=5, Sunday=6
        return True
    return d in NYSE_HOLIDAYS


def market_closed_reason(d: str) -> Optional[str]:
    """Return human-readable reason if closed, else None."""
    parsed = date.fromisoformat(d)
    if parsed.weekday() == 5:
        return "Weekend (Saturday)"
    if parsed.weekday() == 6:
        return "Weekend (Sunday)"
    return NYSE_HOLIDAYS.get(d)


def is_early_close(d: str) -> bool:
    """Return True if d is a half-day early-close session."""
    return d in EARLY_CLOSE


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: holidays.py YYYY-MM-DD", file=sys.stderr)
        return 2
    d = sys.argv[1]
    try:
        date.fromisoformat(d)
    except ValueError as e:
        print(f"invalid date: {e}", file=sys.stderr)
        return 2

    if is_market_closed(d):
        reason = market_closed_reason(d) or "Unknown"
        print(f"CLOSED ({reason})")
    elif is_early_close(d):
        print(f"OPEN_EARLY_CLOSE ({EARLY_CLOSE[d]})")
    else:
        print("OPEN")
    return 0


if __name__ == "__main__":
    sys.exit(main())
