#!/usr/bin/env python3
"""
fetch_prices.py — Twelve Data 拉取 30 symbols OHLC 价格

用法:
  python fetch_prices.py                # 拉取最新一天
  python fetch_prices.py --date 2026-06-10  # 指定日期 OHLC（time_series）
  python fetch_prices.py --batch-size 8 --delay 62  # 调整批次

输出: automation/prices/{date}.json
{
  "date": "2026-06-10",
  "fetched_at": "2026-06-11T09:30:00+08:00",
  "source": "twelvedata.time_series",
  "prices": {"NVDA": {"open": 206.5, "high": 210.3, "low": 205.1, "close": 208.19}, ...},
  "missing": []
}
"""
import argparse
import json
import socket
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import TWELVE_DATA_KEY, TWELVE_DATA_BASE, SYMBOLS, PRICES_DIR


# Twelve Data free tier 偶发慢响应，实测 45-55s 才能读完 8 symbols 的 outputsize=5
DEFAULT_HTTP_TIMEOUT = 60
DEFAULT_RETRIES = 4  # 30s → 60s → 90s 累计等待 3 分钟，覆盖大部分抖动


def chunked(lst, size):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]


def fetch_time_series_batch(symbols, date=None, retries=DEFAULT_RETRIES,
                            timeout=DEFAULT_HTTP_TIMEOUT):
    """time_series 端点拉最近 5 个交易日（outputsize=5），本地按日期筛选。

    注：start_date/end_date 参数已失效（Twelve Data 返回 400），故不使用。
    批 ≤ 8 受 free tier 8 credits/min 限制。

    重试策略：指数退避 15/30/60/90 秒，涵盖 socket.timeout / ConnectionReset /
    HTTPError。失败时把每次原因和等待时间打到 stderr，方便 CI 日志复盘。
    """
    qs = urlencode({
        "symbol": ",".join(symbols),
        "interval": "1day",
        "outputsize": 5,
        "apikey": TWELVE_DATA_KEY,
    })
    url = f"{TWELVE_DATA_BASE}/time_series?{qs}"
    last_err = None
    backoff = [15, 30, 60, 90]
    for attempt in range(retries):
        try:
            with urlopen(Request(url), timeout=timeout) as resp:
                data = json.loads(resp.read())
            if attempt > 0:
                print(f"    ✓ batch recovered on attempt {attempt+1}", file=sys.stderr)
            return data
        except (HTTPError, URLError, socket.timeout, TimeoutError,
                ConnectionResetError, json.JSONDecodeError) as e:
            last_err = e
            if attempt == retries - 1:
                break
            wait = backoff[min(attempt, len(backoff) - 1)]
            print(f"    ⚠ batch attempt {attempt+1}/{retries} failed ({type(e).__name__}: {e}); "
                  f"sleeping {wait}s", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError(f"Twelve Data fetch failed after {retries} retries: {last_err}")


def parse_ohlc(payload, symbol, target_date=None):
    """time_series batch 返回 {SYM: {values:[{datetime,open,high,low,close},...]}}; 单 symbol 返回直接对象
    如果 target_date 非空，在 values 中按 datetime 匹配；否则取最新一条。
    返回 dict: {"open": float, "high": float, "low": float, "close": float} 或 None
    """
    if isinstance(payload, dict) and "values" in payload:
        block = payload
    else:
        block = payload.get(symbol) if isinstance(payload, dict) else None
    if not block or block.get("status") == "error":
        return None
    values = block.get("values") or []
    if not values:
        return None
    try:
        if target_date:
            bar = next((v for v in values if v["datetime"] == target_date), None)
            if bar is None:
                return None
        else:
            bar = values[0]
        return {
            "open": float(bar["open"]),
            "high": float(bar["high"]),
            "low": float(bar["low"]),
            "close": float(bar["close"]),
        }
    except (KeyError, ValueError, TypeError):
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", default=None, help="收盘价日期 YYYY-MM-DD（默认最近一个交易日）")
    ap.add_argument("--batch-size", type=int, default=8)
    ap.add_argument("--delay", type=int, default=62, help="批次间秒数（free tier 8 credits/min）")
    ap.add_argument("--symbols", nargs="*", default=None)
    ap.add_argument("--missing-threshold", type=float, default=0.3,
                    help="允许缺失比例 (0~1)，超过则 exit 1（默认 0.3 = 30%%）")
    args = ap.parse_args()

    target_date = args.date or _latest_trading_date()
    symbols = args.symbols or SYMBOLS
    print(f"📈 Fetching {len(symbols)} symbols for {target_date}...")

    PRICES_DIR.mkdir(parents=True, exist_ok=True)

    prices = {}
    missing = []
    batches = list(chunked(symbols, args.batch_size))
    for i, batch in enumerate(batches, 1):
        print(f"  [{i}/{len(batches)}] {','.join(batch)}")
        payload = fetch_time_series_batch(batch, target_date)
        for sym in batch:
            ohlc = parse_ohlc(payload, sym, target_date)
            if ohlc is None:
                missing.append(sym)
                print(f"    ⚠ {sym} no data")
            else:
                prices[sym] = ohlc
        if i < len(batches):
            print(f"    ⏳ wait {args.delay}s for next batch")
            time.sleep(args.delay)

    out = {
        "date": target_date,
        "fetched_at": datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds"),
        "source": "twelvedata.time_series",
        "prices": prices,
        "missing": missing,
    }
    out_path = PRICES_DIR / f"{target_date}.json"
    out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False))
    print(f"✅ {len(prices)}/{len(symbols)} prices → {out_path}")
    if missing:
        ratio = len(missing) / len(symbols)
        print(f"⚠ Missing {len(missing)}/{len(symbols)} ({ratio:.0%}): {missing}")
        if len(prices) == 0:
            print("❌ 全部股票无数据，疑似 API 故障，强制失败")
            sys.exit(1)
        if ratio > args.missing_threshold:
            print(f"❌ 缺失率 {ratio:.0%} 超过阈值 {args.missing_threshold:.0%}，exit 1")
            sys.exit(1)
        print(f"⚠ 缺失率 {ratio:.0%} ≤ 阈值 {args.missing_threshold:.0%}，允许继续")


def _latest_trading_date():
    """简易版：今天的前一天；周末回退到上周五"""
    now = datetime.now(timezone(timedelta(hours=8)))
    d = now.date() - timedelta(days=1)
    while d.weekday() >= 5:  # 5=Sat, 6=Sun
        d -= timedelta(days=1)
    return d.isoformat()


if __name__ == "__main__":
    main()
