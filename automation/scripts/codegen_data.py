#!/usr/bin/env python3
"""
codegen_data.py — 把 responses/{date}/*.json + prev state + 收盘价 渲染成

  1) public/data/latest.json       (前端实时拉取，最新一天 snapshot)
  2) public/data/archive/{date}.json (历史归档，保留每一天)

数据隔离方案 A：主仓库 src/ 不再每日变动，data 仅 JSON。

用法:
  python codegen_data.py --date 2026-06-11
"""
import argparse
import json
import sys
from datetime import date as date_cls, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import (
    AGENTS, DATA_LATEST_JSON, DATA_ARCHIVE_DIR, PRICES_DIR, RESPONSES_DIR, SECTOR_MAP,
)
from ts_state import parse_dates, parse_state

NAME_OVERRIDES = {
    "NVDA": "英伟达", "MRVL": "Marvell", "BE": "Bloom Energy", "XOM": "埃克森美孚",
    "AAPL": "苹果", "JPM": "摩根大通", "MSFT": "微软", "QQQ": "纳指ETF",
    "TEM": "Tempus AI", "SHOP": "Shopify", "TSLA": "特斯拉", "HOOD": "Robinhood",
    "CRSP": "CRISPR", "PLTR": "Palantir", "COIN": "Coinbase", "CRCL": "Circle",
    "GOOGL": "谷歌", "META": "Meta", "AMZN": "亚马逊", "APP": "AppLovin",
    "COHR": "Coherent", "GEV": "GE Vernova", "GLD": "黄金ETF", "JNJ": "强生",
    "LITE": "Lumentum", "SCHD": "红利ETF", "V": "Visa", "VOO": "标普500ETF",
    "XLV": "医疗ETF", "SPY": "标普500ETF", "AVGO": "博通", "TSM": "台积电",
    "AMD": "AMD", "MU": "美光", "IWM": "罗素2000ETF",
}

AVATAR_MAP = {
    "claude": "CL", "doubao": "DB", "cathie-wood": "CW", "gemini-ext": "GE",
    "grok": "GK", "gemini-std": "GS", "chatgpt": "CG", "beth-kindig": "BK",
    "serenity": "SE", "qwen": "QW",
}
BADGE_MAP = {0: "gold", 1: "silver", 2: "bronze"}

INIT_CAPITAL = 10000.0


def _close(p):
    """兼容旧格式 (number) 和新 OHLC 格式 (dict) → 返回 close price"""
    if isinstance(p, dict):
        return p.get("close", 0)
    return p


def _round(v, n=2):
    return round(float(v) + 1e-9, n)


def build_holding(h_after, prev_agent, prices):
    """组装一条 holding（含派生字段 marketValue/pnl/pnlPercent/weight 占位）"""
    sym = h_after["symbol"]
    raw = prices.get(sym)
    cur = _close(raw) if raw is not None else None
    if cur is None and prev_agent:
        for ph in prev_agent["holdings"]:
            if ph["symbol"] == sym:
                cur = ph["current_price"]
                break
    if cur is None:
        cur = h_after["avg_cost"]
    shares = h_after["shares"]
    avg = h_after["avg_cost"]
    mv = shares * cur
    pnl = (cur - avg) * shares
    pnl_pct = (cur - avg) / avg * 100 if avg > 0 else 0
    return {
        "symbol": sym,
        "name": NAME_OVERRIDES.get(sym, sym),
        "shares": shares,
        "avgCost": _round(avg, 2),
        "currentPrice": _round(cur, 2),
        "marketValue": _round(mv, 2),
        "pnl": _round(pnl, 2),
        "pnlPercent": _round(pnl_pct, 2),
        "weight": 0.0,  # 占位，后面整体算
        "sector": SECTOR_MAP.get(sym, "其他"),
    }


def build_agent_record(meta, response, prev_agent, prices):
    holdings = [build_holding(h, prev_agent, prices) for h in response["holdings_after"]]
    cash = response["cash_after"]
    total = sum(h["marketValue"] for h in holdings) + cash  # 用实际市值重算，不信任 response 的 total
    # 重算 weight
    for h in holdings:
        h["weight"] = _round(h["marketValue"] / max(total, 1) * 100, 1)
    return {
        "id": meta["id"],
        "name": meta["name"],
        "avatar": AVATAR_MAP.get(meta["id"], meta["id"][:2].upper()),
        "color": meta["color"],
        "style": meta["style"],
        "totalAssets": _round(total, 2),
        "returnPct": _round((total - INIT_CAPITAL) / INIT_CAPITAL * 100, 2),
        "cash": _round(cash, 2),
        "cashPct": _round(cash / max(total, 1) * 100, 1),
        "holdingsCount": len(holdings),
        "holdings": holdings,
    }


def build_from_prev(meta, prev_agent, prices):
    holdings = []
    for h in prev_agent["holdings"]:
        raw = prices.get(h["symbol"])
        cur = _close(raw) if raw is not None else h["current_price"]
        shares = h["shares"]
        avg = h["avg_cost"]
        mv = shares * cur
        pnl = (cur - avg) * shares
        pnl_pct = (cur - avg) / avg * 100 if avg > 0 else 0
        holdings.append({
            "symbol": h["symbol"],
            "name": NAME_OVERRIDES.get(h["symbol"], h["symbol"]),
            "shares": shares,
            "avgCost": _round(avg, 2),
            "currentPrice": _round(cur, 2),
            "marketValue": _round(mv, 2),
            "pnl": _round(pnl, 2),
            "pnlPercent": _round(pnl_pct, 2),
            "weight": 0.0,
            "sector": h["sector"],
        })
    cash = prev_agent["cash"]
    total = sum(h["marketValue"] for h in holdings) + cash
    for h in holdings:
        h["weight"] = _round(h["marketValue"] / max(total, 1) * 100, 1)
    return {
        "id": meta["id"],
        "name": meta["name"],
        "avatar": AVATAR_MAP.get(meta["id"], meta["id"][:2].upper()),
        "color": meta["color"],
        "style": meta["style"],
        "totalAssets": _round(total, 2),
        "returnPct": _round((total - INIT_CAPITAL) / INIT_CAPITAL * 100, 2),
        "cash": _round(cash, 2),
        "cashPct": _round(cash / max(total, 1) * 100, 1),
        "holdingsCount": len(holdings),
        "holdings": holdings,
    }


def _prev_trading_day(d_str):
    d = date_cls.fromisoformat(d_str) - timedelta(days=1)
    while d.weekday() >= 5:
        d -= timedelta(days=1)
    return d.isoformat()


def _read_existing_perf_daily():
    """从 latest.json 读已有 perf/daily 行；不存在则回退到旧 TS 解析"""
    if DATA_LATEST_JSON.exists():
        d = json.loads(DATA_LATEST_JSON.read_text())
        return d.get("performanceHistory", []), d.get("dailyReturns", [])
    # fallback：从旧 TS 兼容（迁移期）
    return [], []


def _day_n(snapshot_date):
    """简单计算 day_n：从 2026-06-03 起算（含）的工作日数"""
    start = date_cls(2026, 6, 3)
    d = date_cls.fromisoformat(snapshot_date)
    days = 0
    cur = start
    while cur <= d:
        if cur.weekday() < 5:
            days += 1
        cur += timedelta(days=1)
    return days


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", required=True, help="今日 YYYY-MM-DD")
    ap.add_argument("--prev", default=None)
    ap.add_argument("--out", default=None, help="主输出文件（默认 public/data/latest.json）")
    args = ap.parse_args()

    today = args.date
    prev = args.prev or _prev_trading_day(today)
    today_short = today[5:]

    prices_path = PRICES_DIR / f"{prev}.json"
    if not prices_path.exists():
        print(f"❌ Missing {prices_path}")
        sys.exit(1)
    prices = json.loads(prices_path.read_text())["prices"]

    resp_dir = RESPONSES_DIR / today
    if not resp_dir.is_dir():
        print(f"❌ Missing {resp_dir}")
        sys.exit(1)

    prev_state = {a["id"]: a for a in parse_state()}

    perf_rows, daily_rows = _read_existing_perf_daily()

    # 组装 10 agent
    agents_data = []
    for meta in AGENTS:
        rp = resp_dir / f"{meta['id']}.json"
        if not rp.exists():
            print(f"⚠ {meta['id']} response missing, reusing prev state")
            agents_data.append(build_from_prev(meta, prev_state[meta["id"]], prices))
            continue
        resp = json.loads(rp.read_text())
        agents_data.append(build_agent_record(meta, resp, prev_state.get(meta["id"]), prices))

    # 排名按 returnPct desc
    agents_data.sort(key=lambda x: -x["returnPct"])
    for i, a in enumerate(agents_data):
        a["rank"] = i + 1
        a["badge"] = BADGE_MAP.get(i)

    # 添加 / 覆盖今日 perf 行
    new_perf = {"date": today_short}
    new_daily = {"date": today, "returns": {}}
    for a in agents_data:
        new_perf[a["id"]] = a["returnPct"]
        new_daily["returns"][a["id"]] = a["returnPct"]

    if perf_rows and perf_rows[-1].get("date") == today_short:
        perf_rows[-1] = new_perf
    else:
        perf_rows.append(new_perf)

    if daily_rows and daily_rows[-1].get("date") == today:
        daily_rows[-1] = new_daily
    else:
        daily_rows.append(new_daily)

    snapshot = {
        "schema_version": "1.0",
        "snapshot_date": today,
        "day_n": _day_n(today),
        "competitionInfo": {
            "name": "AI 美股投资竞赛",
            "season": "S1",
            "startDate": "2026-06-03",
            "endDate": "2026-07-03",
            "totalParticipants": len(AGENTS),
            "initialCapital": int(INIT_CAPITAL),
        },
        "participants": agents_data,
        "performanceHistory": perf_rows,
        "dailyReturns": daily_rows,
    }

    out_latest = Path(args.out) if args.out else DATA_LATEST_JSON
    out_latest.parent.mkdir(parents=True, exist_ok=True)
    out_latest.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n")

    DATA_ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    archive_path = DATA_ARCHIVE_DIR / f"{today}.json"
    archive_path.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n")

    print(f"✅ Wrote {out_latest}")
    print(f"✅ Wrote {archive_path}")
    print("Rank:")
    for i, a in enumerate(agents_data, 1):
        print(f"  {i:>2}. {a['name']:<14} {a['returnPct']:>+6.2f}%  ${a['totalAssets']:.2f}")


if __name__ == "__main__":
    main()
