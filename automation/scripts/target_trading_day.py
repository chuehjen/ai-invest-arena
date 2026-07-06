#!/usr/bin/env python3
"""Trading-day helpers used by workflows and cron.

CLI 语义：
    默认打印「参考日期的上一个交易日」——沿用旧行为，保持向后兼容。
    用 --mode prev|next|today 显式指定。

Usage:
    python3 target_trading_day.py                     # NY today -> prev_trading_day
    python3 target_trading_day.py 2026-06-25          # -> prev_trading_day
    python3 target_trading_day.py --mode next         # -> next_trading_day (今天开盘则返回今天)
    python3 target_trading_day.py --mode today        # -> 今天若开盘则返回今天，否则下一个交易日
    python3 target_trading_day.py --mode prev 2026-07-06

Semantics:
    prev(d)  = 严格早于 d 的最近一个交易日（用于「上一日收盘价」）
    next(d)  = 严格晚于 d 的最近一个交易日（用于「明天调仓」）
    today(d) = 若 d 本身开盘则 d，否则 next(d)  （用于「今天该跑哪一天的 prompts」）
"""
from datetime import date, timedelta
import argparse
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


def next_trading_day(d_str: str) -> str:
    d = date.fromisoformat(d_str) + timedelta(days=1)
    while is_market_closed(d.isoformat()):
        d += timedelta(days=1)
    return d.isoformat()


def today_or_next(d_str: str) -> str:
    """今天若开盘则返回今天，否则返回下一个交易日。"""
    if not is_market_closed(d_str):
        return d_str
    return next_trading_day(d_str)


def _ny_today() -> str:
    from datetime import datetime
    try:
        from zoneinfo import ZoneInfo
        return datetime.now(ZoneInfo("America/New_York")).strftime("%Y-%m-%d")
    except Exception:
        return date.today().isoformat()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ref_date", nargs="?", default=None,
                    help="参考日期 YYYY-MM-DD（默认为纽约今天）")
    ap.add_argument("--mode", choices=["prev", "next", "today"], default="prev",
                    help="prev=上一个交易日 (默认); next=下一个交易日; today=今天或下一个交易日")
    args = ap.parse_args()

    ref = args.ref_date or _ny_today()

    # 显式校验格式
    try:
        date.fromisoformat(ref)
    except ValueError as e:
        print(f"invalid date: {e}", file=sys.stderr)
        return 2

    if args.mode == "prev":
        print(prev_trading_day(ref))
    elif args.mode == "next":
        print(next_trading_day(ref))
    else:  # today
        print(today_or_next(ref))
    return 0


if __name__ == "__main__":
    sys.exit(main())
