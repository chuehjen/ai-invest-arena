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
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import TWELVE_DATA_KEY, TWELVE_DATA_BASE, SYMBOLS, PRICES_DIR


def chunked(lst, size):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]


def fetch_time_series_batch(symbols, date, retries=3):
    """time_series 端点带日期，可拉指定日收盘价。批 ≤ 8 受 free tier 8 credits/min 限制。"""
    qs = urlencode({
        "symbol": ",".join(symbols),
        "interval": "1day",
        "start_date": date,
        "end_date": date,
        "outputsize": 1,
        "apikey": TWELVE_DATA_KEY,
    })
    url = f"{TWELVE_DATA_BASE}/time_series?{qs}"
    last_err = None
    for attempt in range(retries):
        try:
            with urlopen(Request(url), timeout=30) as resp:
                data = json.loads(resp.read())
            return data
        except (HTTPError, URLError) as e:
            last_err = e
            time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"Twelve Data fetch failed after {retries} retries: {last_err}")


def parse_ohlc(payload, symbol):
    """time_series batch 返回 {SYM: {values:[{open,high,low,close}]}}; 单 symbol 返回直接对象
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
            ohlc = parse_ohlc(payload, sym)
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
